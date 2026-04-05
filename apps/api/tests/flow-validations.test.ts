import test from 'node:test';
import assert from 'node:assert/strict';
import { LotStatus, OperationStatus, prisma } from '@circulartec/db';
import { HttpError } from '../src/lib/errors';
import { issueCertificateForOperation } from '../src/services/certificates-service';
import { closeOperation, collectLot } from '../src/services/traceability-service';
import { UserContext } from '../src/types/auth';

type AnyFn = (...args: any[]) => any;

const actor: UserContext = {
  userId: 'user-1',
  email: 'test@circulartec.local',
  role: 'OPERADOR_RECOLECTOR',
  organizationId: 'collector-1'
};

const generatorActor: UserContext = {
  userId: 'user-2',
  email: 'generator@circulartec.local',
  role: 'OPERADOR_GENERADOR',
  organizationId: 'generator-1'
};

function mockMethod<T extends object, K extends keyof T>(obj: T, key: K, impl: T[K]) {
  const original = obj[key];
  obj[key] = impl;
  return () => {
    obj[key] = original;
  };
}

async function expectHttpError(
  fn: AnyFn,
  expectedStatusCode: number,
  expectedMessage: string
) {
  await assert.rejects(
    fn,
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.statusCode, expectedStatusCode);
      assert.equal(error.message, expectedMessage);
      return true;
    }
  );
}

test('collectLot rejects when existing operation is CLOSED', async () => {
  const restore = mockMethod(prisma, '$transaction', async (callback: AnyFn) =>
    callback({
      lot: {
        findUnique: async () => ({
          id: 'lot-1',
          status: LotStatus.ASSIGNED,
          assignments: [{ id: 'assignment-1', collectorOrgId: 'collector-1' }],
          operation: {
            id: 'operation-1',
            status: OperationStatus.CLOSED,
            collectorOrgId: 'collector-1'
          }
        })
      }
    })
  );

  try {
    await expectHttpError(
      () =>
        collectLot({
          lotId: 'lot-1',
          collectorOrgId: 'collector-1',
          collectedQuantityKg: 120,
          collectedAt: new Date('2026-04-03T10:00:00.000Z'),
          actor
        }),
      409,
      'La operacion del lote ya fue cerrada.'
    );
  } finally {
    restore();
  }
});

test('collectLot rejects when existing operation collector does not match active assignment', async () => {
  const restore = mockMethod(prisma, '$transaction', async (callback: AnyFn) =>
    callback({
      lot: {
        findUnique: async () => ({
          id: 'lot-1',
          status: LotStatus.ASSIGNED,
          assignments: [{ id: 'assignment-1', collectorOrgId: 'collector-1' }],
          operation: {
            id: 'operation-1',
            status: OperationStatus.PENDING_CONFIRMATION,
            collectorOrgId: 'collector-2'
          }
        })
      }
    })
  );

  try {
    await expectHttpError(
      () =>
        collectLot({
          lotId: 'lot-1',
          collectorOrgId: 'collector-1',
          collectedQuantityKg: 120,
          collectedAt: new Date('2026-04-03T10:00:00.000Z'),
          actor
        }),
      409,
      'La operacion existente no coincide con la asignacion activa del lote.'
    );
  } finally {
    restore();
  }
});

test('collectLot rejects when existing operation is CONFIRMED', async () => {
  const restore = mockMethod(prisma, '$transaction', async (callback: AnyFn) =>
    callback({
      lot: {
        findUnique: async () => ({
          id: 'lot-1',
          status: LotStatus.ASSIGNED,
          assignments: [{ id: 'assignment-1', collectorOrgId: 'collector-1' }],
          operation: {
            id: 'operation-1',
            status: OperationStatus.CONFIRMED,
            collectorOrgId: 'collector-1',
            confirmedByGeneratorUserId: 'user-2',
            closedByUserId: null,
            closedAt: null
          }
        })
      }
    })
  );

  try {
    await expectHttpError(
      () =>
        collectLot({
          lotId: 'lot-1',
          collectorOrgId: 'collector-1',
          collectedQuantityKg: 120,
          collectedAt: new Date('2026-04-03T10:00:00.000Z'),
          actor
        }),
      409,
      'La operacion del lote ya fue confirmada y no puede reabrirse.'
    );
  } finally {
    restore();
  }
});

test('collectLot rejects when existing operation already has confirmation or closing metadata', async () => {
  const restore = mockMethod(prisma, '$transaction', async (callback: AnyFn) =>
    callback({
      lot: {
        findUnique: async () => ({
          id: 'lot-1',
          status: LotStatus.ASSIGNED,
          assignments: [{ id: 'assignment-1', collectorOrgId: 'collector-1' }],
          operation: {
            id: 'operation-1',
            status: OperationStatus.PENDING_CONFIRMATION,
            collectorOrgId: 'collector-1',
            confirmedByGeneratorUserId: 'user-2',
            closedByUserId: null,
            closedAt: null
          }
        })
      }
    })
  );

  try {
    await expectHttpError(
      () =>
        collectLot({
          lotId: 'lot-1',
          collectorOrgId: 'collector-1',
          collectedQuantityKg: 120,
          collectedAt: new Date('2026-04-03T10:00:00.000Z'),
          actor
        }),
      409,
      'La operacion existente ya tiene metadatos de confirmacion o cierre.'
    );
  } finally {
    restore();
  }
});

test('closeOperation rejects when lot is already CLOSED', async () => {
  const restore = mockMethod(prisma, '$transaction', async (callback: AnyFn) =>
    callback({
      operation: {
        findUnique: async () => ({
          id: 'operation-1',
          lotId: 'lot-1',
          status: OperationStatus.CONFIRMED,
          lot: {
            id: 'lot-1',
            status: LotStatus.CLOSED,
            generatorOrgId: 'generator-1'
          },
          evidences: [{ id: 'evidence-1' }]
        })
      }
    })
  );

  try {
    await expectHttpError(
      () =>
        closeOperation({
          lotId: 'lot-1',
          operationId: 'operation-1',
          actor: generatorActor
        }),
      409,
      'El lote ya esta cerrado.'
    );
  } finally {
    restore();
  }
});

test('issueCertificateForOperation rejects when operation is not CLOSED', async () => {
  const restore = mockMethod(prisma.operation, 'findUnique', async () => ({
    id: 'operation-1',
    lotId: 'lot-1',
    collectedQuantityKg: 100,
    collectedAt: new Date('2026-04-03T10:00:00.000Z'),
    status: OperationStatus.CONFIRMED,
    closedAt: new Date('2026-04-03T12:00:00.000Z')
  }) as never);

  try {
    await expectHttpError(
      () => issueCertificateForOperation('operation-1', generatorActor),
      409,
      'La operacion debe estar cerrada antes de emitir certificado.'
    );
  } finally {
    restore();
  }
});

test('issueCertificateForOperation rejects when closedAt is missing', async () => {
  const restore = mockMethod(prisma.operation, 'findUnique', async () => ({
    id: 'operation-1',
    lotId: 'lot-1',
    collectedQuantityKg: 100,
    collectedAt: new Date('2026-04-03T10:00:00.000Z'),
    status: OperationStatus.CLOSED,
    closedAt: null
  }) as never);

  try {
    await expectHttpError(
      () => issueCertificateForOperation('operation-1', generatorActor),
      409,
      'La operacion cerrada debe tener closedAt para emitir certificado.'
    );
  } finally {
    restore();
  }
});

test('issueCertificateForOperation rejects when certificate already exists', async () => {
  const restoreOperation = mockMethod(prisma.operation, 'findUnique', async () => ({
    id: 'operation-1',
    lotId: 'lot-1',
    collectedQuantityKg: 100,
    collectedAt: new Date('2026-04-03T10:00:00.000Z'),
    status: OperationStatus.CLOSED,
    closedAt: new Date('2026-04-03T12:00:00.000Z')
  }) as never);
  const restoreCertificate = mockMethod(prisma.certificate, 'findUnique', async () => ({
    id: 'certificate-1',
    operationId: 'operation-1',
    certificateNumber: 'CT-2026-123456',
    publicVerificationCode: 'ABCDEF1234567890',
    pdfUrl: '/certificates/operation-1.pdf',
    issuedAt: new Date('2026-04-03T12:05:00.000Z'),
    status: 'VERIFIED'
  }) as never);
  let createCalled = false;
  let issuedAuditCalled = false;
  const restoreCreate = mockMethod(prisma.certificate, 'create', (async () => {
    createCalled = true;
    throw new Error('certificate.create should not be called');
  }) as typeof prisma.certificate.create);
  const restoreAudit = mockMethod(
    require('../src/services/audit-service'),
    'addStatusTransitionAuditEvent',
    (async (input: { eventType: string }) => {
      if (input.eventType === 'CERTIFICATE_ISSUED') {
        issuedAuditCalled = true;
      }
    }) as never
  );

  try {
    const certificate = await issueCertificateForOperation('operation-1', generatorActor);
    assert.equal(certificate.id, 'certificate-1');
    assert.equal(createCalled, false);
    assert.equal(issuedAuditCalled, false);
  } finally {
    restoreAudit();
    restoreCreate();
    restoreCertificate();
    restoreOperation();
  }
});
