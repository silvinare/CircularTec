import { Router } from 'express';
import { prisma } from '@circulartec/db';
import { z } from 'zod';
import { requireRole } from '../lib/guard';

const router = Router();

const listCertificatesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10)
});

function buildEvidenceUrl(operationId: string, evidence: { id: string; fileUrl: string }): string {
  if (evidence.fileUrl.startsWith('/uploads/')) {
    return `/api/v1/operations/${operationId}/evidences/${evidence.id}/file`;
  }

  return evidence.fileUrl;
}

router.get('/', async (req, res, next) => {
  try {
    requireRole(req, ['ADMIN_MUNICIPIO', 'OPERADOR_GENERADOR', 'OPERADOR_RECOLECTOR']);
    const user = req.user!;
    const query = listCertificatesQuerySchema.parse(req.query);
    const skip = (query.page - 1) * query.pageSize;

    const where = user.role === 'OPERADOR_GENERADOR'
      ? { operation: { lot: { generatorOrgId: user.organizationId } } }
      : user.role === 'OPERADOR_RECOLECTOR'
        ? { operation: { collectorOrgId: user.organizationId } }
        : {};

    const [items, total] = await prisma.$transaction([
      prisma.certificate.findMany({
        where,
        orderBy: { issuedAt: 'desc' },
        skip,
        take: query.pageSize,
        include: {
          anchor: true,
          operation: {
            include: {
              evidences: {
                where: { fileType: 'PHOTO' },
                orderBy: { uploadedAt: 'asc' },
                take: 1
              },
              lot: {
                include: {
                  wasteType: true
                }
              }
            }
          }
        }
      }),
      prisma.certificate.count({ where })
    ]);

    res.json({
      items: items.map((certificate) => ({
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        publicVerificationCode: certificate.publicVerificationCode,
        pdfUrl: certificate.pdfUrl,
        issuedAt: certificate.issuedAt,
        status: certificate.status,
        lotPublicCode: certificate.operation.lot.publicCode,
        wasteType: certificate.operation.lot.wasteType.name,
        quantityKg: certificate.operation.collectedQuantityKg,
        blockchainTxId: certificate.anchor?.txId || null,
        previewEvidence: certificate.operation.evidences[0]
          ? {
              id: certificate.operation.evidences[0].id,
              fileUrl: buildEvidenceUrl(certificate.operation.id, certificate.operation.evidences[0]),
              fileType: certificate.operation.evidences[0].fileType
            }
          : null
      })),
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

router.get('/verify/:publicCode', async (req, res, next) => {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { publicVerificationCode: req.params.publicCode },
      include: {
        operation: {
          include: {
            lot: {
              include: {
                wasteType: true
              }
            }
          }
        },
        anchor: true
      }
    });

    if (!certificate) {
      return res.status(404).json({ valid: false, message: 'Certificado no encontrado.' });
    }

    return res.json({
      valid: certificate.status === 'VERIFIED',
      certificate: {
        certificateNumber: certificate.certificateNumber,
        issuedAt: certificate.issuedAt,
        wasteType: certificate.operation.lot.wasteType.name,
        quantityKg: certificate.operation.collectedQuantityKg,
        blockchainTxId: certificate.anchor?.txId || null,
        hash: certificate.anchor?.payloadHash || null
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
