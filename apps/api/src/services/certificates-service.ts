import crypto from 'node:crypto';
import { prisma, AnchorStatus, CertificateStatus, HashAlgorithm } from '@circulartec/db';
import { addAuditEvent } from './audit-service';

function buildCertificateNumber(): string {
  const random = crypto.randomInt(100000, 999999);
  return `CT-${new Date().getFullYear()}-${random}`;
}

function buildPublicCode(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function canonicalOperationPayload(input: {
  operationId: string;
  lotId: string;
  collectedQuantityKg: number;
  collectedAt: Date;
  closedAt: Date;
}): string {
  return JSON.stringify({
    closedAt: input.closedAt.toISOString(),
    collectedAt: input.collectedAt.toISOString(),
    collectedQuantityKg: input.collectedQuantityKg,
    lotId: input.lotId,
    operationId: input.operationId
  });
}

export async function issueCertificateForOperation(operationId: string): Promise<void> {
  const operation = await prisma.operation.findUnique({ where: { id: operationId } });
  if (!operation || operation.status !== 'CLOSED' || !operation.closedAt) {
    return;
  }

  const certificate = await prisma.certificate.upsert({
    where: { operationId },
    update: {
      status: CertificateStatus.ISSUED,
      issuedAt: new Date()
    },
    create: {
      operationId,
      certificateNumber: buildCertificateNumber(),
      publicVerificationCode: buildPublicCode(),
      pdfUrl: `/certificates/${operationId}.pdf`,
      status: CertificateStatus.ISSUED
    }
  });

  await addAuditEvent({
    entityType: 'CERTIFICATE',
    entityId: certificate.id,
    eventType: 'CERTIFICATE_ISSUED',
    payload: { operationId }
  });

  const payload = canonicalOperationPayload({
    operationId: operation.id,
    lotId: operation.lotId,
    collectedQuantityKg: operation.collectedQuantityKg,
    collectedAt: operation.collectedAt,
    closedAt: operation.closedAt
  });

  const hash = crypto.createHash('sha256').update(payload).digest('hex');

  // MVP: anclaje simulado. En produccion se reemplaza por adaptador de red blockchain.
  const txId = `mock_tx_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;

  await prisma.blockchainAnchor.upsert({
    where: { certificateId: certificate.id },
    update: {
      payloadHash: hash,
      txId,
      anchoredAt: new Date(),
      status: AnchorStatus.CONFIRMED
    },
    create: {
      certificateId: certificate.id,
      network: 'POLYGON',
      hashAlgorithm: HashAlgorithm.SHA256,
      payloadHash: hash,
      txId,
      anchoredAt: new Date(),
      status: AnchorStatus.CONFIRMED
    }
  });

  await prisma.certificate.update({
    where: { id: certificate.id },
    data: { status: CertificateStatus.VERIFIED }
  });

  await addAuditEvent({
    entityType: 'CERTIFICATE',
    entityId: certificate.id,
    eventType: 'HASH_ANCHORED',
    payload: { txId, hash }
  });
}
