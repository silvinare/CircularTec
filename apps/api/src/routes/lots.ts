import { Router } from 'express';
import { prisma } from '@circulartec/db';
import { z } from 'zod';
import { requireRole } from '../lib/guard';
import { HttpError } from '../lib/errors';
import { addAuditEvent } from '../services/audit-service';

const router = Router();

const createLotSchema = z.object({
  wasteTypeId: z.string().uuid(),
  estimatedQuantityKg: z.number().positive(),
  address: z.string().min(5),
  pickupWindowStart: z.string().datetime(),
  pickupWindowEnd: z.string().datetime(),
  notes: z.string().optional()
});

router.post('/', async (req, res, next) => {
  try {
    requireRole(req, ['OPERADOR_GENERADOR']);
    const user = req.user!;
    const input = createLotSchema.parse(req.body);

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

    await addAuditEvent({
      entityType: 'LOT',
      entityId: lot.id,
      eventType: 'LOT_PUBLISHED',
      payload: { lotId: lot.id },
      createdBy: user.userId
    });

    res.status(201).json(lot);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const lots = await prisma.lot.findMany({
      orderBy: { createdAt: 'desc' },
      include: { wasteType: true }
    });
    res.json(lots);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/assign', async (req, res, next) => {
  try {
    requireRole(req, ['OPERADOR_RECOLECTOR', 'ADMIN_MUNICIPIO']);
    const user = req.user!;

    const lot = await prisma.lot.findUnique({ where: { id: req.params.id } });
    if (!lot) throw new HttpError(404, 'Lote no encontrado.');
    if (lot.status !== 'PUBLISHED') throw new HttpError(409, 'El lote no esta disponible para asignar.');

    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.lotAssignment.create({
        data: {
          lotId: lot.id,
          collectorOrgId: user.organizationId,
          assignedBy: user.userId
        }
      });

      const updatedLot = await tx.lot.update({
        where: { id: lot.id },
        data: { status: 'ASSIGNED' }
      });

      return { assignment, updatedLot };
    });

    await addAuditEvent({
      entityType: 'LOT',
      entityId: lot.id,
      eventType: 'LOT_ASSIGNED',
      payload: { collectorOrgId: user.organizationId },
      createdBy: user.userId
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
