import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import type { Role } from "@prisma/client";
import type { CurrentUser } from "@/app/lib/rbac";

export type { Role, CurrentUser };

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const user = await prisma.user.findUnique({
    where: { id: token },
    select: { id: true, username: true, role: true },
  });
  return user as CurrentUser | null;
}

export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/api/auth/clear");
  return user;
}

export async function requireRole(allowedRoles: Role[]): Promise<CurrentUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    redirect(getDefaultRouteForRole(user.role));
  }
  return user;
}

export function getDefaultRouteForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
    case "MANAGER":
    case "STAFF":
      return "/dashboard";
    case "CASHIER":
      return "/pos";
    case "KITCHEN":
      return "/kitchen";
    default:
      return "/dashboard";
  }
}
