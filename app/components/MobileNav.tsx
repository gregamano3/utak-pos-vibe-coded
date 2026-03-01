"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  List,
  BarChart3,
  Store,
  Menu,
  X,
  Users,
  ChefHat,
  BookOpen,
  Settings,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/lib/actions/auth";
import { ThemeSwitcher } from "@/app/components/ThemeSwitcher";
import type { CurrentUser } from "@/app/lib/auth";
import { getAccessibleHrefs } from "@/app/lib/rbac";

const ALL_LINKS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS", href: "/pos", icon: ShoppingCart },
  { name: "Products", href: "/products", icon: List },
  { name: "Menu", href: "/menu", icon: BookOpen },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Kitchen", href: "/kitchen", icon: ChefHat },
  { name: "Audit Trail", href: "/audit", icon: ClipboardList },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav({ user }: { user: CurrentUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "";
  const allowedHrefs = user ? getAccessibleHrefs(user.role) : ["/dashboard", "/pos", "/products", "/inventory", "/reports"];
  const links = ALL_LINKS.filter((link) => allowedHrefs.includes(link.href));

  return (
    <>
      {/* Mobile top bar - visible only below md */}
      <div className="md:hidden h-14 shrink-0 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-20">
        <button
          onClick={() => setOpen(true)}
          className="p-2 -ml-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Store size={18} />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent">
            Utak POS
          </h1>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Overlay drawer */}
      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="md:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-50 shadow-xl animate-slide-in-left"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center text-white">
                  <Store size={18} />
                </div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent">
                  Utak POS
                </h1>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close menu"
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
              {links.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-end">
                <ThemeSwitcher />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-3 px-3 py-2 text-zinc-600 dark:text-zinc-400 rounded-xl overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm shrink-0">
                    {user?.username?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="flex-1 overflow-hidden min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{user?.username ?? "User"}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.role ?? "Admin"}</p>
                  </div>
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-zinc-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </form>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
