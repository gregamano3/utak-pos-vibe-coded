"use server";

import { prisma } from "./prisma";

type AuditParams = {
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  userId?: string | null;
};

export async function createAuditLog({
  action,
  entity,
  entityId,
  details,
  userId,
}: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId: entityId ?? null,
        details: details ?? null,
        userId: userId ?? null,
      },
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}
