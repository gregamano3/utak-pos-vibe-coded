"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, List, BarChart3, Store, LogOut, Users, ChefHat, BookOpen, Settings, ClipboardList } from "lucide-react";
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

export function Sidebar({ user }: { user: CurrentUser | null }) {
    const pathname = usePathname() || "";
    const allowedHrefs = user ? getAccessibleHrefs(user.role) : ["/dashboard", "/pos", "/products", "/inventory", "/reports"];
    const links = ALL_LINKS.filter((link) => allowedHrefs.includes(link.href));

    return (
        <div className="w-64 h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col hidden md:flex shrink-0 shadow-sm transition-all duration-300">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 dark:shadow-emerald-600/30">
                    <Store size={18} />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent">
                    Utak POS
                </h1>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                {links.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group ${isActive
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                }`}
                        >
                            <Icon size={18} className={isActive ? "" : "group-hover:scale-110 transition-transform duration-200"} />
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
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold text-sm shrink-0">
                            U
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{user?.username ?? "User"}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.role ?? "Admin"}</p>
                        </div>
                    </div>
                    <form action={logout}>
                        <button type="submit" className="text-zinc-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors" title="Logout">
                            <LogOut size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
