import { prisma } from "@/app/lib/prisma"
import { requireRole } from "@/app/lib/auth"
import { formatCurrency } from "@/app/lib/currency"
import Link from "next/link"
import { Package, UtensilsCrossed } from "lucide-react"

export default async function KitchenPage() {
    await requireRole(["ADMIN", "MANAGER", "KITCHEN"]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
        where: { createdAt: { gte: todayStart } },
        include: {
            items: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 font-sans">
            <header className="h-16 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 flex-shrink-0 z-10 sticky top-0 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Kitchen Display</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:block mt-0.5">Orders to prepare</p>
                </div>
                <Link
                    href="/inventory"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
                >
                    <Package size={18} strokeWidth={2} />
                    View Inventory
                </Link>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50">
                                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                                        #{order.id.slice(0, 8)}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                                        {order.createdAt.toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="p-4 space-y-2">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-zinc-800/50 last:border-0"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                                                    {item.quantity}
                                                </span>
                                                <span className="font-medium text-slate-900 dark:text-white text-sm">
                                                    {item.product.name}
                                                </span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-600 dark:text-zinc-400">
                                                {formatCurrency(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-100 dark:border-emerald-900/30">
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                        Total: {formatCurrency(order.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {orders.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-zinc-400">
                            <UtensilsCrossed size={60} strokeWidth={2} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">No orders today yet</p>
                            <p className="text-sm mt-1">New orders will appear here when placed from POS</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
