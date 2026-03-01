import { prisma } from "@/app/lib/prisma"
import { Calendar as CalendarIcon, Filter } from "lucide-react"

export default async function ReportsPage(props: {
    searchParams?: Promise<{
        from?: string;
        to?: string;
    }>;
}) {
    const searchParams = await props.searchParams;

    const from = searchParams?.from ? new Date(searchParams.from) : new Date(new Date().setHours(0, 0, 0, 0) - (7 * 24 * 60 * 60 * 1000))
    const to = searchParams?.to ? new Date(searchParams.to) : new Date()

    // Set to end of day for 'to' date
    to.setHours(23, 59, 59, 999)

    const orders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: from,
                lte: to,
            }
        },
        include: { items: true },
        orderBy: { createdAt: 'desc' }
    })

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const totalOrders = orders.length

    // Calculate Best Selling Product
    const productCounts: Record<string, number> = {}
    orders.forEach(order => {
        order.items.forEach(item => {
            productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity
        })
    })

    // We need names for these products
    const productIds = Object.keys(productCounts)
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } }
    })

    const salesData = products.map(p => ({
        name: p.name,
        category: p.categoryId,
        sold: productCounts[p.id]
    })).sort((a, b) => b.sold - a.sold)

    const bestSeller = salesData[0]

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Sales Reports</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">View revenue, popular items, and order history.</p>
                </div>

                {/* Simple Date Filter Form */}
                <form className="bg-white dark:bg-zinc-950 p-2 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                    <CalendarIcon size={18} className="text-zinc-400 ml-2" />
                    <input
                        type="date"
                        name="from"
                        defaultValue={from.toISOString().split('T')[0]}
                        className="bg-transparent border-0 text-sm text-zinc-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                    <span className="text-zinc-400">to</span>
                    <input
                        type="date"
                        name="to"
                        defaultValue={to.toISOString().split('T')[0]}
                        className="bg-transparent border-0 text-sm text-zinc-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                        <Filter size={14} /> Filter
                    </button>
                </form>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Sales</h3>
                    <p className="text-3xl font-bold mt-2 text-zinc-900 dark:text-white">?{totalSales.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Orders</h3>
                    <p className="text-3xl font-bold mt-2 text-zinc-900 dark:text-white">{totalOrders}</p>
                </div>
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Best Seller</h3>
                    {bestSeller ? (
                        <div className="mt-2">
                            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 truncate">{bestSeller.name}</p>
                            <p className="text-sm text-zinc-500">{bestSeller.sold} units sold</p>
                        </div>
                    ) : (
                        <p className="text-xl font-bold mt-2 text-zinc-500">N/A</p>
                    )}
                </div>
            </div>

            {/* Order History Table */}
            <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Order History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-3 font-medium">Order ID</th>
                                <th className="px-6 py-3 font-medium">Date & Time</th>
                                <th className="px-6 py-3 font-medium">Items</th>
                                <th className="px-6 py-3 font-medium">Total Amount</th>
                                <th className="px-6 py-3 font-medium">Payment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">{order.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4">
                                        <span className="text-zinc-900 dark:text-white font-medium block">{order.createdAt.toLocaleDateString()}</span>
                                        <span className="text-zinc-500 text-xs">{order.createdAt.toLocaleTimeString()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-medium">{order.items.reduce((acc, i) => acc + i.quantity, 0)} items</td>
                                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">?{order.totalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                            CASH
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No orders found for this date range.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
