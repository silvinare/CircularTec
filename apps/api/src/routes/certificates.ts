import { Router } from 'express';
import { prisma } from '@circulartec/db';

const router = Router();

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
