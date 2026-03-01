"use client"

import { formatCurrency } from "@/app/lib/currency"
import { markOrderPrepared } from "@/app/lib/actions/order"
import { useState } from "react"
import { Check } from "lucide-react"

type Order = {
    id: string
    totalAmount: number
    preparedAt: Date | null
    createdAt: Date
    items: { id: string; quantity: number; price: number; product: { name: string } }[]
}

export function KitchenOrderCard({ order }: { order: Order }) {
    const [loading, setLoading] = useState(false)
    const isPrepared = !!order.preparedAt

    async function handleMarkPrepared() {
        if (isPrepared) return
        setLoading(true)
        await markOrderPrepared(order.id)
        setLoading(false)
    }

    return (
        <div
            className={`rounded-xl border overflow-hidden transition-all ${
                isPrepared
                    ? "bg-slate-100 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 opacity-75"
                    : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md"
            }`}
        >
            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50">
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    #{order.id.slice(0, 8)}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                        {order.createdAt.toLocaleTimeString()}
                    </span>
                    {!isPrepared && (
                        <button
                            type="button"
                            onClick={handleMarkPrepared}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                            <Check size={14} strokeWidth={2.5} />
                            {loading ? "..." : "Done"}
                        </button>
                    )}
                    {isPrepared && (
                        <span className="px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                            Prepared
                        </span>
                    )}
                </div>
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
    )
}
