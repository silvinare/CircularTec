import { prisma, AuditEntityType } from '@circulartec/db';

export async function addAuditEvent(input: {
  entityType: AuditEntityType;
  entityId: string;
  eventType: string;
  payload: unknown;
  createdBy?: string;
}): Promise<void> {
  await prisma.auditEvent.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      eventType: input.eventType,
      payloadJson: input.payload as object,
      createdBy: input.createdBy
    }
  });
}
