import { Router } from 'express';
import { prisma } from '@circulartec/db';
import { z } from 'zod';
import { requireRole } from '../lib/guard';
import { HttpError } from '../lib/errors';
import { addAuditEvent } from '../services/audit-service';
import { issueCertificateForOperation } from '../services/certificates-service';

const router = Router();

router.get('/by-lot/:lotId', async (req, res, next) => {
  try {
    const operation = await prisma.operation.findUnique({
      where: { lotId: req.params.lotId },
      include: {
        evidences: true,
        certificate: {
          include: {
            anchor: true
          }
        }
      }
    });

    if (!operation) {
      return res.status(404).json({ message: 'Operacion no encontrada para el lote.' });
    }

    res.json(operation);
  } catch (error) {
    next(error);
  }
});

const collectSchema = z.object({
  collectedQuantityKg: z.number().positive(),
  collectedAt: z.string().datetime()
});

router.post('/:lotId/collect', async (req, res, next) => {
  try {
    requireRole(req, ['OPERADOR_RECOLECTOR']);
    const user = req.user!;
    const input = collectSchema.parse(req.body);

    const lot = await prisma.lot.findUnique({ where: { id: req.params.lotId } });
    if (!lot) throw new HttpError(404, 'Lote no encontrado.');
    if (lot.status !== 'ASSIGNED') throw new HttpError(409, 'El lote no esta asignado para recoleccion.');

    const operation = await prisma.operation.upsert({
      where: { lotId: lot.id },
      update: {
        collectedQuantityKg: input.collectedQuantityKg,
        collectedAt: new Date(input.collectedAt),
        collectorOrgId: user.organizationId,
        status: 'PENDING_CONFIRMATION'
      },
      create: {
        lotId: lot.id,
        collectorOrgId: user.organizationId,
        collectedQuantityKg: input.collectedQuantityKg,
        collectedAt: new Date(input.collectedAt),
        status: 'PENDING_CONFIRMATION'
      }
    });

    await prisma.lot.update({ where: { id: lot.id }, data: { status: 'COLLECTED' } });

    await addAuditEvent({
      entityType: 'OPERATION',
      entityId: operation.id,
      eventType: 'OPERATION_COLLECTED',
      payload: { lotId: lot.id, collectedQuantityKg: input.collectedQuantityKg },
      createdBy: user.userId
    });

    res.json(operation);
  } catch (error) {
    next(error);
  }
});

const closeSchema = z.object({
  operationId: z.string().uuid()
});

router.post('/:lotId/close', async (req, res, next) => {
  try {
    requireRole(req, ['ADMIN_MUNICIPIO', 'OPERADOR_GENERADOR']);
    const user = req.user!;
    const { operationId } = closeSchema.parse(req.body);

    const operation = await prisma.operation.findUnique({
      where: { id: operationId },
      include: { evidences: true }
    });

    if (!operation || operation.lotId !== req.params.lotId) {
      throw new HttpError(404, 'Operacion no encontrada para el lote.');
    }
    if (operation.evidences.length < 1) {
      throw new HttpError(422, 'Se requiere al menos una evidencia para cerrar la operacion.');
    }

    const closed = await prisma.$transaction(async (tx) => {
      const closedOperation = await tx.operation.update({
        where: { id: operation.id },
        data: {
          status: 'CLOSED',
          confirmedByGeneratorUserId: user.userId,
          closedByUserId: user.userId,
          closedAt: new Date()
        }
      });

      await tx.lot.update({ where: { id: req.params.lotId }, data: { status: 'CLOSED' } });
      return closedOperation;
    });

    await addAuditEvent({
      entityType: 'OPERATION',
      entityId: operation.id,
      eventType: 'OPERATION_CLOSED',
      payload: { lotId: req.params.lotId },
      createdBy: user.userId
    });

    await issueCertificateForOperation(closed.id);

    res.json({ status: 'ok', operation: closed });
  } catch (error) {
    next(error);
  }
});

const evidenceSchema = z.object({
  fileUrl: z.string().url(),
  fileType: z.enum(['PHOTO', 'DOCUMENT'])
});

router.post('/:operationId/evidences', async (req, res, next) => {
  try {
    requireRole(req, ['OPERADOR_RECOLECTOR', 'ADMIN_MUNICIPIO']);
    const user = req.user!;
    const input = evidenceSchema.parse(req.body);

    const operation = await prisma.operation.findUnique({ where: { id: req.params.operationId } });
    if (!operation) throw new HttpError(404, 'Operacion no encontrada.');

    const evidence = await prisma.operationEvidence.create({
      data: {
        operationId: operation.id,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        uploadedBy: user.userId
      }
    });

    res.status(201).json(evidence);
  } catch (error) {
    next(error);
  }
});

export default router;
