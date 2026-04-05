import { prisma, AuditEntityType, Prisma } from '@circulartec/db';

type AuditClient = Prisma.TransactionClient | typeof prisma;

export type AuditActor = {
  userId?: string;
  role?: string;
  organizationId?: string;
};

export async function addAuditEvent(input: {
  entityType: AuditEntityType;
  entityId: string;
  eventType: string;
  payload: unknown;
  createdBy?: string;
  tx?: AuditClient;
}): Promise<void> {
  const client = input.tx ?? prisma;

  await client.auditEvent.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      eventType: input.eventType,
      payloadJson: input.payload as object,
      createdBy: input.createdBy
    }
  });
}

export async function addStatusTransitionAuditEvent(input: {
  entityType: AuditEntityType;
  entityId: string;
  eventType: string;
  fromStatus: string;
  toStatus: string;
  actor?: AuditActor;
  payload?: Record<string, unknown>;
  tx?: AuditClient;
}): Promise<void> {
  await addAuditEvent({
    entityType: input.entityType,
    entityId: input.entityId,
    eventType: input.eventType,
    createdBy: input.actor?.userId,
    tx: input.tx,
    payload: {
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      actorRole: input.actor?.role ?? null,
      actorOrganizationId: input.actor?.organizationId ?? null,
      ...input.payload
    }
  });
}
