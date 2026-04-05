import { Router } from 'express';
import { prisma } from '@circulartec/db';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { z } from 'zod';
import { requireRole } from '../lib/guard';
import { HttpError } from '../lib/errors';
import { issueCertificateForOperation } from '../services/certificates-service';
import {
  addEvidenceAuditEvent,
  closeOperation,
  collectLot,
  confirmOperation,
  ensureOperationReadableByUser
} from '../services/traceability-service';

const router = Router();
const uploadsDir = path.resolve(process.cwd(), '../../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
    }
  }),
  fileFilter: (_req, file, cb) => {
    const allowed = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
    if (!allowed) {
      cb(new HttpError(400, 'Solo se permiten imagenes o PDFs.') as never);
      return;
    }

    cb(null, true);
  },
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});

function buildEvidenceUrl(operationId: string, evidence: { id: string; fileUrl: string }): string {
  if (evidence.fileUrl.startsWith('/uploads/')) {
    return `/api/v1/operations/${operationId}/evidences/${evidence.id}/file`;
  }

  return evidence.fileUrl;
}

function serializeOperation<T extends { id: string; evidences: Array<{ id: string; fileUrl: string }> }>(operation: T): T {
  return {
    ...operation,
    evidences: operation.evidences.map((evidence) => ({
      ...evidence,
      fileUrl: buildEvidenceUrl(operation.id, evidence)
    }))
  };
}

function operationInclude() {
  return {
    collector: {
      select: {
        id: true,
        displayName: true,
        legalName: true,
        type: true
      }
    },
    lot: {
      include: {
        wasteType: true,
        generator: {
          select: {
            id: true,
            displayName: true,
            legalName: true,
            type: true
          }
        },
        assignments: {
          orderBy: { assignedAt: 'desc' },
          include: {
            collector: {
              select: {
                id: true,
                displayName: true,
                legalName: true,
                type: true
              }
            }
          }
        }
      }
    },
    evidences: true,
    certificate: {
      include: {
        anchor: true
      }
    }
  } as const;
}

router.get('/:id', async (req, res, next) => {
  try {
    requireRole(req, ['ADMIN_MUNICIPIO', 'OPERADOR_GENERADOR', 'OPERADOR_RECOLECTOR']);
    const user = req.user!;
    await ensureOperationReadableByUser(req.params.id, user);

    const operation = await prisma.operation.findUnique({
      where: { id: req.params.id },
      include: operationInclude()
    });

    if (!operation) {
      throw new HttpError(404, 'Operacion no encontrada.');
    }

    res.json(serializeOperation(operation));
  } catch (error) {
    next(error);
  }
});

router.get('/by-lot/:lotId', async (req, res, next) => {
  try {
    requireRole(req, ['ADMIN_MUNICIPIO', 'OPERADOR_GENERADOR', 'OPERADOR_RECOLECTOR']);
    const user = req.user!;

    const operation = await prisma.operation.findUnique({
      where: { lotId: req.params.lotId },
      include: operationInclude()
    });

    if (!operation) {
      throw new HttpError(404, 'Operacion no encontrada para el lote.');
    }
    await ensureOperationReadableByUser(operation.id, user);

    res.json(serializeOperation(operation));
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

    const operation = await collectLot({
      lotId: req.params.lotId,
      collectorOrgId: user.organizationId,
      collectedQuantityKg: input.collectedQuantityKg,
      collectedAt: new Date(input.collectedAt),
      actor: user
    });

    res.json(operation);
  } catch (error) {
    next(error);
  }
});

const operationActionSchema = z.object({
  operationId: z.string().uuid()
});

router.post('/:lotId/confirm', async (req, res, next) => {
  try {
    requireRole(req, ['ADMIN_MUNICIPIO', 'OPERADOR_GENERADOR']);
    const user = req.user!;
    const { operationId } = operationActionSchema.parse(req.body);

    const confirmed = await confirmOperation({
      lotId: req.params.lotId,
      operationId,
      actor: user
    });

    res.json({ status: 'ok', operation: confirmed });
  } catch (error) {
    next(error);
  }
});

router.post('/:lotId/close', async (req, res, next) => {
  try {
    requireRole(req, ['ADMIN_MUNICIPIO', 'OPERADOR_GENERADOR']);
    const user = req.user!;
    const { operationId } = operationActionSchema.parse(req.body);

    const closed = await closeOperation({
      lotId: req.params.lotId,
      operationId,
      actor: user
    });

    await issueCertificateForOperation(closed.id, user);

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

    const operation = await ensureOperationReadableByUser(req.params.operationId, user);
    if (!operation) throw new HttpError(404, 'Operacion no encontrada.');

    const evidence = await prisma.operationEvidence.create({
      data: {
        operationId: operation.id,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        uploadedBy: user.userId
      }
    });

    await addEvidenceAuditEvent({
      operationId: operation.id,
      lotId: operation.lotId,
      evidenceId: evidence.id,
      fileType: evidence.fileType,
      fileUrl: evidence.fileUrl,
      actor: user
    });

    res.status(201).json({
      ...evidence,
      fileUrl: buildEvidenceUrl(operation.id, evidence)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:operationId/evidences/upload', upload.single('file'), async (req, res, next) => {
  try {
    requireRole(req, ['OPERADOR_RECOLECTOR', 'ADMIN_MUNICIPIO']);
    const user = req.user!;

    const operation = await ensureOperationReadableByUser(req.params.operationId, user);
    if (!operation) throw new HttpError(404, 'Operacion no encontrada.');
    if (!req.file) throw new HttpError(400, 'Debes adjuntar un archivo.');

    const fileType = req.file.mimetype.startsWith('image/') ? 'PHOTO' : 'DOCUMENT';
    const fileUrl = `/uploads/${req.file.filename}`;

    const evidence = await prisma.operationEvidence.create({
      data: {
        operationId: operation.id,
        fileUrl,
        fileType,
        uploadedBy: user.userId
      }
    });

    await addEvidenceAuditEvent({
      operationId: operation.id,
      lotId: operation.lotId,
      evidenceId: evidence.id,
      fileType: evidence.fileType,
      fileUrl: evidence.fileUrl,
      actor: user
    });

    res.status(201).json({
      ...evidence,
      fileUrl: buildEvidenceUrl(operation.id, evidence)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:operationId/evidences/:evidenceId/file', async (req, res, next) => {
  try {
    requireRole(req, ['ADMIN_MUNICIPIO', 'OPERADOR_GENERADOR', 'OPERADOR_RECOLECTOR']);
    const user = req.user!;

    const operation = await ensureOperationReadableByUser(req.params.operationId, user);
    const evidence = await prisma.operationEvidence.findFirst({
      where: {
        id: req.params.evidenceId,
        operationId: operation.id
      }
    });

    if (!evidence) {
      throw new HttpError(404, 'Evidencia no encontrada.');
    }
    if (!evidence.fileUrl.startsWith('/uploads/')) {
      throw new HttpError(400, 'La evidencia no corresponde a un archivo local.');
    }

    const filename = path.basename(evidence.fileUrl);
    const absolutePath = path.resolve(uploadsDir, filename);
    res.sendFile(absolutePath);
  } catch (error) {
    next(error);
  }
});

export default router;
