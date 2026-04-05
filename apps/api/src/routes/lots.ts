import { Router } from 'express';
import { AssignmentStatus, prisma } from '@circulartec/db';
import { z } from 'zod';
import { requireRole } from '../lib/guard';
import { HttpError } from '../lib/errors';
import { addStatusTransitionAuditEvent } from '../services/audit-service';
import { assignLot, buildLotTraceability } from '../services/traceability-service';

const router = Router();

function serializeLotTraceabilityResponse<T extends {
  traceability: {
    timeline: unknown[];
  };
  operation?: {
    id: string;
    evidences: Array<{ id: string; fileUrl: string }>;
  } | null;
}>(payload: T): T {
  if (!payload.operation) {
    return payload;
  }

  return {
    ...payload,
    operation: {
      ...payload.operation,
      evidences: payload.operation.evidences.map((evidence) => ({
        ...evidence,
        fileUrl: evidence.fileUrl.startsWith('/uploads/')
          ? `/api/v1/operations/${payload.operation!.id}/evidences/${evidence.id}/file`
          : evidence.fileUrl
      }))
    }
  };
}

const createLotSchema = z.object({
  wasteTypeId: z.string().uuid(),
  estimatedQuantityKg: z.number().positive(),
  address: z.string().min(5),
  pickupWindowStart: z.string().datetime(),
  pickupWindowEnd: z.string().datetime(),
  notes: z.string().optional()
}).superRefine((input, ctx) => {
  if (new Date(input.pickupWindowEnd) <= new Date(input.pickupWindowStart)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'pickupWindowEnd debe ser posterior a pickupWindowStart.',
      path: ['pickupWindowEnd']
    });
  }
});

const assignLotSchema = z.object({
  collectorOrgId: z.string().uuid().optional()
});

const listLotsQuerySchema = z.object({
  status: z.enum(['PUBLISHED', 'ASSIGNED', 'COLLECTED', 'CLOSED', 'CANCELLED']).optional(),
  wasteTypeId: z.string().uuid().optional(),
  generatorOrgId: z.string().uuid().optional(),
  collectorOrgId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

router.post('/', async (req, res, next) => {
  try {
    requireRole(req, ['OPERADOR_GENERADOR']);
    const user = req.user!;
    const input = createLotSchema.parse(req.body);

    const wasteType = await prisma.wasteType.findFirst({
      where: {
        id: input.wasteTypeId,
        active: true
      }
    });
    if (!wasteType) {
      throw new HttpError(404, 'Tipo de residuo no encontrado o inactivo.');
    }

    const count = await prisma.lot.count();
    const publicCode = `LOT-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    const lot = await prisma.lot.create({
      data: {
        publicCode,
        generatorOrgId: user.organizationId,
        wasteTypeId: input.wasteTypeId,
        estimatedQuantityKg: input.estimatedQuantityKg,
        address: input.address,
        pickupWindowStart: new Date(input.pickupWindowStart),
        pickupWindowEnd: new Date(input.pickupWindowEnd),
        notes: input.notes,
        createdBy: user.userId
      }
    });

    await addStatusTransitionAuditEvent({
      entityType: 'LOT',
      entityId: lot.id,
      eventType: 'LOT_PUBLISHED',
      fromStatus: 'NOT_CREATED',
      toStatus: lot.status,
      actor: user,
      payload: { lotId: lot.id }
    });

    res.status(201).json(lot);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    requireRole(req, ['ADMIN_MUNICIPIO', 'OPERADOR_GENERADOR', 'OPERADOR_RECOLECTOR']);
    const user = req.user!;
    const query = listLotsQuerySchema.parse(req.query);
    const collectorAssignmentFilter = user.role === 'OPERADOR_RECOLECTOR'
      ? {
          assignments: {
            some: {
              collectorOrgId: user.organizationId,
              status: AssignmentStatus.ACTIVE
            }
          }
        }
      : query.collectorOrgId
        ? {
            assignments: {
              some: {
                collectorOrgId: query.collectorOrgId,
                status: AssignmentStatus.ACTIVE
              }
            }
          }
        : {};

    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.wasteTypeId ? { wasteTypeId: query.wasteTypeId } : {}),
      ...(
        user.role === 'OPERADOR_GENERADOR'
          ? { generatorOrgId: user.organizationId }
          : user.role === 'OPERADOR_RECOLECTOR'
            ? {}
            : query.generatorOrgId
            ? { generatorOrgId: query.generatorOrgId }
            : {}
      ),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {})
            }
          }
        : {}),
      ...collectorAssignmentFilter
    };

    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await prisma.$transaction([
      prisma.lot.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
        include: {
          wasteType: true,
          assignments: {
            where: { status: 'ACTIVE' },
            orderBy: { assignedAt: 'desc' },
            include: {
              collector: {
                select: {
                  id: true,
                  displayName: true,
                  type: true
                }
              }
            }
          },
          operation: {
            select: {
              id: true,
              status: true,
              collectedQuantityKg: true,
              collectedAt: true,
              closedAt: true
            }
          }
        }
      }),
      prisma.lot.count({ where })
    ]);

    res.json({
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    requireRole(req, ['ADMIN_MUNICIPIO', 'OPERADOR_GENERADOR', 'OPERADOR_RECOLECTOR']);
    const user = req.user!;
    const traceability = await buildLotTraceability(req.params.id, user);
    res.json(serializeLotTraceabilityResponse({
      ...traceability.lot,
      traceability: traceability.traceability
    }));
  } catch (error) {
    next(error);
  }
});

router.get('/:id/traceability', async (req, res, next) => {
  try {
    requireRole(req, ['ADMIN_MUNICIPIO', 'OPERADOR_GENERADOR', 'OPERADOR_RECOLECTOR']);
    const user = req.user!;

    const traceability = await buildLotTraceability(req.params.id, user);
    res.json(traceability.traceability);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/assign', async (req, res, next) => {
  try {
    requireRole(req, ['OPERADOR_RECOLECTOR', 'ADMIN_MUNICIPIO']);
    const user = req.user!;
    const input = assignLotSchema.parse(req.body);

    const result = await assignLot({
      lotId: req.params.id,
      collectorOrgId: user.role === 'ADMIN_MUNICIPIO' ? input.collectorOrgId ?? '' : user.organizationId,
      assignedBy: user.userId,
      actor: user
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
