"use server";

import { prisma } from "../prisma";
import { requireRole } from "../auth";
import { createAuditLog } from "../audit";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

export async function createUser(formData: FormData) {
  const current = await requireRole(["ADMIN"]);
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;
  const pin = (formData.get("pin") as string) || null;

  if (!username?.trim() || !password) {
    return { error: "Username and password required" };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (existing) return { error: "Username already exists" };

  const hashed = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      username: username.trim(),
      password: hashed,
      role: role || "CASHIER",
      pin: pin?.trim() || null,
    },
  });
  await createAuditLog({
    action: "USER_CREATED",
    entity: "user",
    entityId: newUser.id,
    details: `Created user "${username.trim()}" with role ${role}`,
    userId: current.id,
  });
  return { success: true };
}

export async function updateUser(userId: string, formData: FormData) {
  const current = await requireRole(["ADMIN"]);
  const username = formData.get("username") as string;
  const role = formData.get("role") as Role;
  const pin = (formData.get("pin") as string) || null;
  const newPassword = formData.get("newPassword") as string | null;

  if (!username?.trim()) return { error: "Username required" };

  const existing = await prisma.user.findFirst({
    where: { username: username.trim(), NOT: { id: userId } },
  });
  if (existing) return { error: "Username already taken" };

  const data: { username: string; role: Role; pin: string | null; password?: string } = {
    username: username.trim(),
    role: role || "CASHIER",
    pin: pin?.trim() || null,
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
