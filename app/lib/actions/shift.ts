"use server";

import { prisma } from "../prisma";
import { requireAuth } from "../auth";

export async function clockIn() {
  const user = await requireAuth();
  const activeShift = await prisma.shift.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
  });
  if (activeShift) return { error: "Already clocked in" };

  await prisma.shift.create({
    data: { userId: user.id, status: "ACTIVE" },
  });
  return { success: true };
}

export async function clockOut() {
  const user = await requireAuth();
  const activeShift = await prisma.shift.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
  });
  if (!activeShift) return { error: "No active shift to clock out" };

  await prisma.shift.update({
    where: { id: activeShift.id },
    data: { clockOut: new Date(), status: "COMPLETED" },
  });
  return { success: true };
}
