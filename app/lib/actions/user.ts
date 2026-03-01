"use server";

import { prisma } from "../prisma";
import { requireRole } from "../auth";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

export async function createUser(formData: FormData) {
  await requireRole(["ADMIN"]);
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
  await prisma.user.create({
    data: {
      username: username.trim(),
      password: hashed,
      role: role || "CASHIER",
      pin: pin?.trim() || null,
    },
  });
  return { success: true };
}

export async function updateUser(userId: string, formData: FormData) {
  await requireRole(["ADMIN"]);
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

  await prisma.user.update({ where: { id: userId }, data });
  return { success: true };
}

export async function deleteUser(userId: string) {
  const current = await requireRole(["ADMIN"]);
  if (current.id === userId) return { error: "Cannot delete your own account" };

  await prisma.shift.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  return { success: true };
}
