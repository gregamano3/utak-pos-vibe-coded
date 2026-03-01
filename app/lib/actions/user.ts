"use server";

import { prisma } from "../prisma";
import { requireRole } from "../auth";
import { createAuditLog } from "../audit";
import { userCreateSchema, userUpdateSchema } from "../validations";
import bcrypt from "bcryptjs";

export async function createUser(formData: FormData) {
  const current = await requireRole(["ADMIN"]);
  const raw = {
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role"),
    pin: formData.get("pin") || null,
  };
  const parsed = userCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { username, password, role, pin } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: "Username already exists" };

  const hashed = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      username,
      password: hashed,
      role: role || "CASHIER",
      pin,
    },
  });
  await createAuditLog({
    action: "USER_CREATED",
    entity: "user",
    entityId: newUser.id,
    details: `Created user "${username}" with role ${role}`,
    userId: current.id,
  });
  return { success: true };
}

export async function updateUser(userId: string, formData: FormData) {
  const current = await requireRole(["ADMIN"]);
  if (!userId || typeof userId !== "string") return { error: "Invalid user" };
  const raw = {
    username: formData.get("username"),
    role: formData.get("role"),
    pin: formData.get("pin") || null,
    newPassword: formData.get("newPassword") || "",
  };
  const parsed = userUpdateSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { username, role, pin, newPassword } = parsed.data;
  const existing = await prisma.user.findFirst({
    where: { username, NOT: { id: userId } },
  });
  if (existing) return { error: "Username already taken" };

  const data: Parameters<typeof prisma.user.update>[0]["data"] = {
    username,
    role: (role || "CASHIER") as "ADMIN" | "MANAGER" | "CASHIER",
    pin,
  };
  if (newPassword?.length && newPassword.length >= 6) {
    data.password = await bcrypt.hash(newPassword, 10);
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
  await prisma.user.update({ where: { id: userId }, data });
  await createAuditLog({
    action: "USER_UPDATED",
    entity: "user",
    entityId: userId,
    details: `Updated user "${target?.username ?? userId}"`,
    userId: current.id,
  });
  return { success: true };
}

export async function deleteUser(userId: string) {
  const current = await requireRole(["ADMIN"]);
  if (current.id === userId) return { error: "Cannot delete your own account" };

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
  await prisma.shift.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  await createAuditLog({
    action: "USER_DELETED",
    entity: "user",
    entityId: userId,
    details: `Deleted user "${target?.username ?? userId}"`,
    userId: current.id,
  });
  return { success: true };
}
