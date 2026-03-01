import type { Role } from "@prisma/client";

export interface CurrentUser {
  id: string;
  username: string;
  role: Role;
}

const ROUTE_ROLES: Record<string, Role[]> = {
  "/dashboard": ["ADMIN", "MANAGER", "STAFF", "CASHIER"],
  "/pos": ["ADMIN", "MANAGER", "STAFF", "CASHIER"],
  "/products": ["ADMIN", "MANAGER"],
  "/menu": ["ADMIN", "MANAGER"],
  "/inventory": ["ADMIN", "MANAGER", "KITCHEN"],
  "/reports": ["ADMIN", "MANAGER", "CASHIER"],
  "/staff": ["ADMIN"],
  "/kitchen": ["ADMIN", "MANAGER", "KITCHEN"],
  "/settings": ["ADMIN"],
};

export function canAccessRoute(pathname: string, role: Role): boolean {
  for (const [path, roles] of Object.entries(ROUTE_ROLES)) {
    if (pathname.startsWith(path)) return roles.includes(role);
  }
  return false;
}

export function getAccessibleHrefs(role: Role): string[] {
  return Object.entries(ROUTE_ROLES)
    .filter(([, roles]) => roles.includes(role))
    .map(([path]) => path);
}
