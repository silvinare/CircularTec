import {
  AssignmentStatus,
  AuditEntityType,
  LotStatus,
  OperationStatus,
  Prisma,
  prisma
} from '@circulartec/db';
import { HttpError } from '../lib/errors';
import { UserContext } from '../types/auth';
import { addAuditEvent, addStatusTransitionAuditEvent } from './audit-service';

type Tx = Prisma.TransactionClient;

function ensureLotReadableByUser(input: {
  lot: {
    generatorOrgId: string;
    assignments: Array<{ collectorOrgId: string; status?: AssignmentStatus }>;
  };
  user: UserContext;
}): void {
  if (input.user.role === 'ADMIN_MUNICIPIO') {
    return;
  }

  if (input.user.role === 'OPERADOR_GENERADOR' && input.lot.generatorOrgId !== input.user.organizationId) {
    throw new HttpError(403, 'No tenes acceso a este lote.');
  }

  if (
    input.user.role === 'OPERADOR_RECOLECTOR' &&
    !input.lot.assignments.some(
      (assignment) =>
        assignment.collectorOrgId === input.user.organizationId &&
        assignment.status !== AssignmentStatus.RELEASED
    )
  ) {
    throw new HttpError(403, 'No tenes acceso a este lote.');
  }
}

export async function ensureOperationReadableByUser(operationId: string, user: UserContext) {
  const operation = await prisma.operation.findUnique({
    where: { id: operationId },
    include: {
      lot: {
        select: {
          id: true,
          generatorOrgId: true,
          assignments: {
            select: {
              collectorOrgId: true,
              status: true
            }
          }
        }
      }
    }
  });

  if (!operation) {
    throw new HttpError(404, 'Operacion no encontrada.');
  }

  ensureLotReadableByUser({ lot: operation.lot, user });
  return operation;
}

export async function assignLot(input: {
  lotId: string;
  collectorOrgId: string;
  assignedBy: string;
  actor: UserContext;
}) {
  return prisma.$transaction(async (tx) => {
    if (!input.collectorOrgId) {
      throw new HttpError(400, 'collectorOrgId es obligatorio para asignar el lote.');
    }

    const lot = await tx.lot.findUnique({
      where: { id: input.lotId },
      include: {
        assignments: {
          where: { status: AssignmentStatus.ACTIVE },
          select: { id: true }
        }
      }
    });

    if (!lot) {
      throw new HttpError(404, 'Lote no encontrado.');
    }
    if (lot.status !== LotStatus.PUBLISHED) {
      throw new HttpError(409, 'El lote no esta disponible para asignar.');
    }
    if (lot.assignments.length > 0) {
      throw new HttpError(409, 'El lote ya tiene una asignacion activa.');
    }

    const collectorOrganization = await tx.organization.findFirst({
      where: {
        id: input.collectorOrgId,
        type: 'RECOLECTOR',
        status: 'ACTIVE'
      },
      select: { id: true }
    });
    if (!collectorOrganization) {
      throw new HttpError(404, 'Organizacion recolectora no encontrada o inactiva.');
    }

    const assignment = await tx.lotAssignment.create({
      data: {
        lotId: input.lotId,
        collectorOrgId: input.collectorOrgId,
        assignedBy: input.assignedBy
      }
    });

    const updatedLot = await tx.lot.update({
      where: { id: input.lotId },
      data: { status: LotStatus.ASSIGNED }
    });

    await addStatusTransitionAuditEvent({
      tx,
      entityType: AuditEntityType.LOT,
      entityId: updatedLot.id,
      eventType: 'LOT_ASSIGNED',
      fromStatus: lot.status,
      toStatus: updatedLot.status,
      actor: input.actor,
      payload: {
        assignmentId: assignment.id,
        collectorOrgId: input.collectorOrgId
      }
    });

    return { assignment, lot: updatedLot };
  });
}

export async function collectLot(input: {
  lotId: string;
  collectorOrgId: string;
  collectedQuantityKg: number;
  collectedAt: Date;
  actor: UserContext;
}) {
  return prisma.$transaction(async (tx) => {
    const lot = await tx.lot.findUnique({
      where: { id: input.lotId },
      include: {
        assignments: {
          where: { status: AssignmentStatus.ACTIVE },
          orderBy: { assignedAt: 'desc' }
        },
        operation: true
      }
    });

    if (!lot) {
      throw new HttpError(404, 'Lote no encontrado.');
    }
    if (lot.status !== LotStatus.ASSIGNED) {
      throw new HttpError(409, 'El lote no esta asignado para recoleccion.');
    }

    const activeAssignment = lot.assignments[0];
    if (!activeAssignment || activeAssignment.collectorOrgId !== input.collectorOrgId) {
      throw new HttpError(403, 'Tu organizacion no tiene una asignacion activa sobre este lote.');
    }
    if (lot.operation?.status === OperationStatus.CLOSED) {
      throw new HttpError(409, 'La operacion del lote ya fue cerrada.');
    }
    if (lot.operation?.status === OperationStatus.CONFIRMED) {
      throw new HttpError(409, 'La operacion del lote ya fue confirmada y no puede reabrirse.');
    }
    if (lot.operation && lot.operation.collectorOrgId !== activeAssignment.collectorOrgId) {
      throw new HttpError(409, 'La operacion existente no coincide con la asignacion activa del lote.');
    }
    if (
      lot.operation &&
      (
        lot.operation.confirmedByGeneratorUserId !== null
        || lot.operation.closedByUserId !== null
        || lot.operation.closedAt !== null
      )
    ) {
      throw new HttpError(409, 'La operacion existente ya tiene metadatos de confirmacion o cierre.');
    }

    const previousOperationStatus = lot.operation?.status ?? null;
    const operation = await tx.operation.upsert({
      where: { lotId: input.lotId },
      update: {
        collectedQuantityKg: input.collectedQuantityKg,
        collectedAt: input.collectedAt,
        collectorOrgId: input.collectorOrgId,
        status: OperationStatus.PENDING_CONFIRMATION,
        confirmedByGeneratorUserId: null,
        closedByUserId: null,
        closedAt: null
      },
      create: {
        lotId: input.lotId,
        collectorOrgId: input.collectorOrgId,
        collectedQuantityKg: input.collectedQuantityKg,
        collectedAt: input.collectedAt,
        status: OperationStatus.PENDING_CONFIRMATION
      }
    });

    const updatedLot = await tx.lot.update({
      where: { id: input.lotId },
      data: { status: LotStatus.COLLECTED }
    });

    await addStatusTransitionAuditEvent({
      tx,
      entityType: AuditEntityType.LOT,
      entityId: updatedLot.id,
      eventType: 'LOT_COLLECTED',
      fromStatus: lot.status,
      toStatus: updatedLot.status,
      actor: input.actor,
      payload: {
        operationId: operation.id,
        collectedQuantityKg: input.collectedQuantityKg,
        collectedAt: input.collectedAt.toISOString()
      }
    });

    await addStatusTransitionAuditEvent({
      tx,
      entityType: AuditEntityType.OPERATION,
      entityId: operation.id,
      eventType: previousOperationStatus ? 'OPERATION_COLLECTION_UPDATED' : 'OPERATION_COLLECTED',
      fromStatus: previousOperationStatus ?? 'NOT_CREATED',
      toStatus: operation.status,
      actor: input.actor,
      payload: {
        lotId: input.lotId,
        assignmentId: activeAssignment.id,
        collectedQuantityKg: input.collectedQuantityKg,
        collectedAt: input.collectedAt.toISOString()
      }
    });

    return operation;
  });
}

export async function confirmOperation(input: {
  lotId: string;
  operationId: string;
  actor: UserContext;
}) {
  return prisma.$transaction(async (tx) => {
    const operation = await tx.operation.findUnique({
      where: { id: input.operationId },
      include: {
        lot: {
          select: {
            id: true,
            status: true,
            generatorOrgId: true
          }
        }
      }
    });

    if (!operation || operation.lotId !== input.lotId) {
      throw new HttpError(404, 'Operacion no encontrada para el lote.');
    }
    if (input.actor.role === 'OPERADOR_GENERADOR' && operation.lot.generatorOrgId !== input.actor.organizationId) {
      throw new HttpError(403, 'No tenes acceso para confirmar esta operacion.');
    }
    if (operation.lot.status !== LotStatus.COLLECTED) {
      throw new HttpError(409, 'El lote debe estar retirado antes de confirmar la operacion.');
    }
    if (operation.status !== OperationStatus.PENDING_CONFIRMATION) {
      throw new HttpError(409, 'La operacion no esta pendiente de confirmacion.');
    }

    const confirmed = await tx.operation.update({
      where: { id: input.operationId },
      data: {
        status: OperationStatus.CONFIRMED,
        confirmedByGeneratorUserId: input.actor.userId
      }
    });

    await addStatusTransitionAuditEvent({
      tx,
      entityType: AuditEntityType.OPERATION,
      entityId: confirmed.id,
      eventType: 'OPERATION_CONFIRMED',
      fromStatus: operation.status,
      toStatus: confirmed.status,
      actor: input.actor,
      payload: {
        lotId: input.lotId
      }
    });

    return confirmed;
  });
}

export async function closeOperation(input: {
  lotId: string;
  operationId: string;
  actor: UserContext;
}) {
  return prisma.$transaction(async (tx) => {
    const operation = await tx.operation.findUnique({
      where: { id: input.operationId },
      include: {
        lot: {
          select: {
            id: true,
            status: true,
            generatorOrgId: true
          }
        },
        evidences: {
          select: { id: true }
        }
      }
    });

    if (!operation || operation.lotId !== input.lotId) {
      throw new HttpError(404, 'Operacion no encontrada para el lote.');
    }
    if (
      input.actor.role === 'OPERADOR_GENERADOR' &&
      operation.lot.generatorOrgId !== input.actor.organizationId
    ) {
      throw new HttpError(403, 'No tenes acceso para cerrar esta operacion.');
    }
    if (operation.lot.status === LotStatus.CLOSED) {
      throw new HttpError(409, 'El lote ya esta cerrado.');
    }
    if (operation.status !== OperationStatus.CONFIRMED) {
      throw new HttpError(409, 'La operacion debe estar confirmada antes de cerrar.');
    }
    if (operation.evidences.length < 1) {
      throw new HttpError(422, 'Se requiere al menos una evidencia para cerrar la operacion.');
    }

    const closedAt = new Date();
    const closedOperation = await tx.operation.update({
      where: { id: input.operationId },
      data: {
        status: OperationStatus.CLOSED,
        closedByUserId: input.actor.userId,
        closedAt
      }
    });

    const updatedLot = await tx.lot.update({
      where: { id: input.lotId },
      data: { status: LotStatus.CLOSED }
    });

    await tx.lotAssignment.updateMany({
      where: {
        lotId: input.lotId,
        status: AssignmentStatus.ACTIVE
      },
      data: {
        status: AssignmentStatus.COMPLETED
      }
    });

    await addStatusTransitionAuditEvent({
      tx,
      entityType: AuditEntityType.OPERATION,
      entityId: closedOperation.id,
      eventType: 'OPERATION_CLOSED',
      fromStatus: operation.status,
      toStatus: closedOperation.status,
      actor: input.actor,
      payload: {
        lotId: input.lotId,
        evidenceCount: operation.evidences.length,
        closedAt: closedAt.toISOString()
      }
    });

    await addStatusTransitionAuditEvent({
      tx,
      entityType: AuditEntityType.LOT,
      entityId: updatedLot.id,
      eventType: 'LOT_CLOSED',
      fromStatus: operation.lot.status,
      toStatus: updatedLot.status,
      actor: input.actor,
      payload: {
        operationId: closedOperation.id
      }
    });

    return closedOperation;
  });
}

export async function buildLotTraceability(lotId: string, user: UserContext) {
  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    include: {
      wasteType: true,
      generator: {
        select: {
          id: true,
          displayName: true,
          legalName: true,
          type: true,
          address: true
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
              type: true,
              address: true
            }
          }
        }
      },
      operation: {
        include: {
          evidences: true,
          certificate: {
            include: {
              anchor: true
            }
          }
        }
      }
    }
  });

  if (!lot) {
    throw new HttpError(404, 'Lote no encontrado.');
  }

  ensureLotReadableByUser({ lot, user });

  const entityRefs = [
    { entityType: AuditEntityType.LOT, entityId: lot.id },
    ...(lot.operation ? [{ entityType: AuditEntityType.OPERATION, entityId: lot.operation.id }] : []),
    ...(lot.operation?.certificate
      ? [{ entityType: AuditEntityType.CERTIFICATE, entityId: lot.operation.certificate.id }]
      : [])
  ];

  const auditEvents = await prisma.auditEvent.findMany({
    where: {
      OR: entityRefs
    },
    orderBy: { createdAt: 'asc' }
  });

  const timeline = auditEvents.map((event) => ({
    id: event.id,
    entityType: event.entityType,
    entityId: event.entityId,
    eventType: event.eventType,
    payload: event.payloadJson,
    createdBy: event.createdBy,
    createdAt: event.createdAt
  }));

  return {
    lot,
    traceability: {
      lotStatus: lot.status,
      operationStatus: lot.operation?.status ?? null,
      certificateStatus: lot.operation?.certificate?.status ?? null,
      anchorStatus: lot.operation?.certificate?.anchor?.status ?? null,
      timeline
    }
  };
}

export async function addEvidenceAuditEvent(input: {
  operationId: string;
  lotId: string;
  evidenceId: string;
  fileType: string;
  fileUrl: string;
  actor: UserContext;
}) {
  await addAuditEvent({
    entityType: AuditEntityType.OPERATION,
    entityId: input.operationId,
    eventType: 'OPERATION_EVIDENCE_ADDED',
    createdBy: input.actor.userId,
    payload: {
      lotId: input.lotId,
      evidenceId: input.evidenceId,
      fileType: input.fileType,
      fileUrl: input.fileUrl,
      actorRole: input.actor.role,
      actorOrganizationId: input.actor.organizationId
    }
  });
}
