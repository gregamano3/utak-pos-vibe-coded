import { prisma } from "@/app/lib/prisma"
import { requireRole } from "@/app/lib/auth"
import Link from "next/link"
import { Package, UtensilsCrossed, RefreshCw } from "lucide-react"
import { KitchenRefreshWrapper } from "@/app/components/KitchenRefreshWrapper"
import { KitchenOrderCard } from "./KitchenOrderCard"

export default async function KitchenPage() {
    await requireRole(["ADMIN", "MANAGER", "KITCHEN"])

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const orders = await prisma.order.findMany({
        where: {
            createdAt: { gte: todayStart },
            status: { not: "VOIDED" },
        },
        include: {
            items: { include: { product: true } },
        },
        orderBy: [
            { preparedAt: { sort: "asc", nulls: "first" } },
            { createdAt: "desc" },
        ],
        take: 30,
    })

    return (
        <KitchenRefreshWrapper>
            <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 font-sans">
                <header className="h-16 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-zinc-950 flex-shrink-0 z-10 sticky top-0 shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Kitchen Display
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:flex items-center gap-1 mt-0.5">
                            <RefreshCw size={12} />
                            Auto-refreshes every 15s
                        </p>
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
                                <KitchenOrderCard key={order.id} order={order} />
                            ))}
                        </div>
                        {orders.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-zinc-400">
                                <UtensilsCrossed
                                    size={60}
                                    strokeWidth={2}
                                    className="mb-4 opacity-50"
                                />
                                <p className="text-lg font-medium">No orders today yet</p>
                                <p className="text-sm mt-1">
                                    New orders appear here when placed from POS
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </KitchenRefreshWrapper>
    )
}
