"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { formatCurrency } from "@/app/lib/currency"
import { voidOrder } from "@/app/lib/actions/order"
import { VoidConfirmDialog } from "@/app/components/VoidConfirmDialog"
import { Ban } from "lucide-react"

type Order = {
    id: string
    totalAmount: number
    paymentMethod: string
    status: string
    createdAt: Date
    items: { quantity: number }[]
}

type Props = {
    orders: Order[]
}

export function ReportsOrderTable({ orders }: Props) {
    const router = useRouter()
    const [voidConfirm, setVoidConfirm] = useState<string | null>(null)
    const [isVoiding, setIsVoiding] = useState(false)

    async function handleVoid(password: string) {
        if (!voidConfirm) return
        const orderId = voidConfirm
        setIsVoiding(true)
        const result = await voidOrder(orderId, password)
        setIsVoiding(false)
        if (result.success) {
            setVoidConfirm(null)
            toast.success("Order voided")
            router.refresh()
        } else {
            toast.error(result.error ?? "Failed to void order")
        }
    }

    return (
        <>
            <VoidConfirmDialog
                open={!!voidConfirm}
                title="Void transaction"
                message="Void this order? Inventory will be restored. This cannot be undone."
                onConfirm={handleVoid}
                onCancel={() => setVoidConfirm(null)}
                isLoading={isVoiding}
            />
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                        <th className="px-6 py-3 font-medium">Order ID</th>
                        <th className="px-6 py-3 font-medium">Date & Time</th>
                        <th className="px-6 py-3 font-medium">Items</th>
                        <th className="px-6 py-3 font-medium">Total Amount</th>
                        <th className="px-6 py-3 font-medium">Payment</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {orders.map((order) => (
                        <tr
                            key={order.id}
                            className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                                order.status === "VOIDED" ? "opacity-60" : ""
                            }`}
                        >
                            <td className="px-6 py-4 font-mono text-xs text-zinc-500">{order.id.slice(0, 8)}...</td>
                            <td className="px-6 py-4">
                                <span className="text-zinc-900 dark:text-white font-medium block">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                                <span className="text-zinc-500 text-xs">
                                    {new Date(order.createdAt).toLocaleTimeString()}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-medium">
                                {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                            </td>
                            <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                                {formatCurrency(order.totalAmount)}
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    {order.paymentMethod}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {order.status === "VOIDED" ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                                        VOIDED
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        COMPLETED
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                {order.status === "COMPLETED" && (
                                    <button
                                        onClick={() => setVoidConfirm(order.id)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 dark:text-rose-400 transition-colors"
                                        title="Void this order"
                                    >
                                        <Ban size={14} />
                                        Void
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                No orders found for this date range.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    )
}
