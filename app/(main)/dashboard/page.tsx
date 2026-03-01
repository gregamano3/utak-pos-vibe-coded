import { prisma } from "@/app/lib/prisma"
import { formatCurrency } from "@/app/lib/currency"
import { requireRole } from "@/app/lib/auth"
import Link from "next/link"
import {
    Bell,
    CreditCard,
    Wallet,
    Receipt,
    ShoppingCart,
    TrendingUp,
    MoreHorizontal,
    CheckCircle,
    AlertTriangle,
} from "lucide-react"

export default async function DashboardPage() {
    const user = await requireRole(["ADMIN", "MANAGER", "STAFF", "CASHIER"]);
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // 1. Today's Sales (exclude voided)
    const todaysOrders = await prisma.order.findMany({
        where: {
            createdAt: { gte: today },
            status: { not: "VOIDED" },
        },
    })
    const todaySales = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const todayCount = todaysOrders.length

    // Simplistic fake "Net Profit" and "Avg Order" logic for demo dashboard
    const netProfit = todaySales * 0.28
    const avgOrder = todayCount > 0 ? (todaySales / todayCount) : 0

    // 2. Low Stock Items
    const lowStockThreshold = 10
    const lowStockItems = await prisma.inventory.findMany({
        where: { quantity: { lte: lowStockThreshold } },
        include: { ingredient: true },
        take: 5
    })

    // 3. Best Selling Product Today (exclude voided orders)
    const topItems = await prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
            createdAt: { gte: today },
            order: { status: { not: "VOIDED" } },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 4
    })

    const productIds = topItems.map(t => t.productId)
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { category: true }
    })

    const topProductsWithNames = topItems.map(t => {
        const prod = products.find(p => p.id === t.productId)
        return {
            name: prod?.name || "Unknown",
            imageUrl: prod?.imageUrl ?? null,
            category: prod?.category.name || "N/A",
            price: prod?.price || 0,
            quantity: t._sum.quantity || 0,
            revenue: (prod?.price || 0) * (t._sum.quantity || 0)
        }
    })

    const getProductImage = (p: { imageUrl?: string | null; name: string }) => {
        if (p.imageUrl) return p.imageUrl
        const n = p.name.toLowerCase()
        if (n.includes("latte") || n.includes("coffee") || n.includes("cappuccino")) return "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop"
        if (n.includes("espresso")) return "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=400&auto=format&fit=crop"
        if (n.includes("tea")) return "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=400&auto=format&fit=crop"
        if (n.includes("burger")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop"
        if (n.includes("fries")) return "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=400&auto=format&fit=crop"
        if (n.includes("salad")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop"
        if (n.includes("cake")) return "https://images.unsplash.com/photo-1578985545062-69928b1ea383?q=80&w=400&auto=format&fit=crop"
        if (n.includes("ice cream") || n.includes("scoop")) return "https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?q=80&w=400&auto=format&fit=crop"
        if (n.includes("wing") || n.includes("chicken")) return "https://images.unsplash.com/photo-1524114664604-cd8133cd6771?q=80&w=400&auto=format&fit=crop"
        return "https://images.unsplash.com/photo-1546069901-ba6dfaec34a7?q=80&w=400&auto=format&fit=crop"
    }

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 font-sans selection:bg-emerald-500/20 selection:text-emerald-600 dark:selection:text-emerald-400">

            {/* Header */}
            <header className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-6 sticky top-0 bg-slate-50/80 dark:bg-zinc-900/80 backdrop-blur-md z-10 border-b border-slate-200 dark:border-zinc-800">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Dashboard Overview</h1>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1 font-medium">Welcome back, {user.username}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center justify-center h-10 w-10 rounded-full bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 shadow-sm transition-all relative">
                        <Bell size={20} />
                        {lowStockItems.length > 0 && (
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
                        )}
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-zinc-700">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{user.username}</p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium capitalize">{user.role.toLowerCase()}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-sm text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                            {user.username[0]?.toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-4 sm:px-6 md:px-8 pb-6 md:pb-10 flex flex-col gap-6 max-w-[1600px] w-full mx-auto mt-2">

                {/* Metric Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between h-36 group hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Today&apos;s Sales</span>
                                <span className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{formatCurrency(todaySales)}</span>
                            </div>
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <CreditCard size={24} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                            <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 border border-emerald-100 dark:border-emerald-800">
                                <TrendingUp size={14} />
                                12%
                            </span>
                            <span className="text-[#64748b] text-xs">vs yesterday</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between h-36 group hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Net Profit</span>
                                <span className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{formatCurrency(netProfit)}</span>
                            </div>
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                <Wallet size={24} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                            <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 border border-emerald-100 dark:border-emerald-800">
                                <TrendingUp size={14} />
                                5%
                            </span>
                            <span className="text-[#64748b] text-xs">vs yesterday</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between h-36 group hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Order Count</span>
                                <span className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{todayCount}</span>
                            </div>
                            <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                                <Receipt size={24} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                            <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 border border-emerald-100 dark:border-emerald-800">
                                <TrendingUp size={14} />
                                {todayCount > 0 ? "8%" : "0%"}
                            </span>
                            <span className="text-[#64748b] text-xs">vs yesterday</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between h-36 group hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Avg Order Value</span>
                                <span className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{formatCurrency(avgOrder)}</span>
                            </div>
                            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                                <ShoppingCart size={24} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                            <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 border border-emerald-100 dark:border-emerald-800">
                                <TrendingUp size={14} />
                                8%
                            </span>
                            <span className="text-[#64748b] text-xs">vs yesterday</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Activity Heatmap + Top Sellers */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Peak Hours Heatmap (Visual only placeholder as requested in design) */}
                        <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-none">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Peak Hours Activity</h3>
                                    <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Store traffic heatmap based on transaction volume</p>
                                </div>
                                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs font-medium">
                                    <button className="px-4 py-1.5 bg-white shadow-sm border border-slate-200 rounded-md text-[#1e293b] font-semibold transition-all">Today</button>
                                    <button className="px-4 py-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-white/50 rounded-md transition-all">Week</button>
                                </div>
                            </div>

                            <div className="flex items-end gap-2 sm:gap-4 md:gap-6 h-64 w-full px-1 sm:px-2 overflow-x-auto hide-scrollbar">
                                <div className="flex flex-col items-center flex-1 h-full justify-end gap-3 group">
                                    <div className="w-full bg-slate-100 rounded-xl relative overflow-hidden group-hover:bg-slate-200 transition-all h-full flex flex-col justify-end">
                                        <div className="bg-emerald-200 w-full rounded-xl" style={{ height: "40%" }}></div>
                                    </div>
                                    <span className="text-xs font-medium text-[#64748b]">10am</span>
                                </div>
                                <div className="flex flex-col items-center flex-1 h-full justify-end gap-3 group">
                                    <div className="w-full bg-slate-100 rounded-xl relative overflow-hidden group-hover:bg-slate-200 transition-all h-full flex flex-col justify-end">
                                        <div className="bg-emerald-300 w-full rounded-xl" style={{ height: "65%" }}></div>
                                    </div>
                                    <span className="text-xs font-medium text-[#64748b]">12pm</span>
                                </div>
                                <div className="flex flex-col items-center flex-1 h-full justify-end gap-3 group">
                                    <div className="w-full bg-slate-100 rounded-xl relative overflow-hidden group-hover:bg-slate-200 transition-all h-full flex flex-col justify-end">
                                        <div className="bg-emerald-200 w-full rounded-xl" style={{ height: "45%" }}></div>
                                    </div>
                                    <span className="text-xs font-medium text-[#64748b]">2pm</span>
                                </div>
                                <div className="flex flex-col items-center flex-1 h-full justify-end gap-3 group">
                                    <div className="w-full bg-slate-100 rounded-xl relative overflow-hidden group-hover:bg-slate-200 transition-all h-full flex flex-col justify-end">
                                        <div className="bg-emerald-200/60 w-full rounded-xl" style={{ height: "30%" }}></div>
                                    </div>
                                    <span className="text-xs font-medium text-[#64748b]">4pm</span>
                                </div>
                                <div className="flex flex-col items-center flex-1 h-full justify-end gap-3 group">
                                    <div className="w-full bg-slate-100 rounded-xl relative overflow-hidden group-hover:bg-slate-200 transition-all h-full flex flex-col justify-end">
                                        <div className="bg-[#10b981] w-full rounded-xl relative" style={{ height: "85%" }}>
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1e293b] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">Peak</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-[#059669]">6pm</span>
                                </div>
                                <div className="flex flex-col items-center flex-1 h-full justify-end gap-3 group">
                                    <div className="w-full bg-slate-100 rounded-xl relative overflow-hidden group-hover:bg-slate-200 transition-all h-full flex flex-col justify-end">
                                        <div className="bg-emerald-400 w-full rounded-xl" style={{ height: "95%" }}></div>
                                    </div>
                                    <span className="text-xs font-medium text-[#64748b]">8pm</span>
                                </div>
                                <div className="flex flex-col items-center flex-1 h-full justify-end gap-3 group">
                                    <div className="w-full bg-slate-100 rounded-xl relative overflow-hidden group-hover:bg-slate-200 transition-all h-full flex flex-col justify-end">
                                        <div className="bg-emerald-300 w-full rounded-xl" style={{ height: "60%" }}></div>
                                    </div>
                                    <span className="text-xs font-medium text-[#64748b]">10pm</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Selling Items Table */}
                        <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-none flex-1 overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Top Selling Items</h3>
                                <Link href="/reports" className="text-sm font-semibold text-[#10b981] hover:text-[#059669]">View Reports</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs font-semibold text-[#64748b] border-b border-[#f1f5f9] uppercase tracking-wider">
                                            <th className="py-4 px-3 pl-0">Item Name</th>
                                            <th className="py-4 px-3">Category</th>
                                            <th className="py-4 px-3 text-right">Orders</th>
                                            <th className="py-4 px-3 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {topProductsWithNames.map((p, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-50 transition-colors border-b border-[#f1f5f9]/50 last:border-0">
                                                <td className="py-4 px-3 pl-0 flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-zinc-700 bg-cover bg-center shadow-sm" style={{ backgroundImage: `url('${getProductImage(p)}')` }} />
                                                    <span className="font-semibold text-slate-800 dark:text-white">{p.name}</span>
                                                </td>
                                                <td className="py-4 px-3 text-slate-500 dark:text-zinc-400 font-medium">{p.category}</td>
                                                <td className="py-4 px-3 text-right text-slate-800 dark:text-white font-semibold">{p.quantity}</td>
                                                <td className="py-4 px-3 text-right text-slate-800 dark:text-white font-bold">{formatCurrency(p.revenue)}</td>
                                            </tr>
                                        ))}
                                        {topProductsWithNames.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="py-8 text-center text-[#64748b]">No sales data for today yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Food Cost & Alerts */}
                    <div className="flex flex-col gap-6">

                        {/* Food Cost Widget */}
                        <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-none">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Cost %</h3>
                                <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer text-slate-500 dark:text-zinc-400">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                            <p className="text-sm text-[#64748b] mb-8">Current cost vs revenue ratio</p>

                            <div className="flex items-center justify-center relative h-40 w-40 sm:h-52 sm:w-52 mx-auto mb-6">
                                <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                                    <path className="text-[#10b981] drop-shadow-md" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="28, 100" strokeLinecap="round" strokeWidth="2.5"></path>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-[#1e293b] tracking-tight">28%</span>
                                    <span className="text-xs text-[#64748b] font-medium mt-1 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">Target: 30%</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] ring-2 ring-emerald-100"></span>
                                    <span className="text-[#1e293b] font-medium">Status</span>
                                </div>
                                <span className="text-[#059669] font-bold bg-white px-2 py-0.5 rounded shadow-sm text-xs">Healthy</span>
                            </div>
                        </div>

                        {/* Low Stock Alerts */}
                        <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-none flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Low Stock Alerts</h3>
                                <Link href="/inventory" className="text-xs font-semibold text-[#10b981] hover:text-[#059669] hover:underline">View All</Link>
                            </div>

                            <div className="flex flex-col gap-4 flex-1">
                                {lowStockItems.map(item => {
                                    const isCritical = item.quantity <= 2;
                                    return (
                                        <div key={item.id} className={`flex items-center gap-4 p-4 bg-white rounded-xl border ${isCritical ? 'border-red-100' : 'border-orange-100'} hover:shadow-sm transition-shadow group`}>
                                            <div className={`${isCritical ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400'} p-2.5 rounded-lg transition-colors`}>
                                                <AlertTriangle size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="text-sm font-semibold text-[#1e293b] truncate uppercase">{item.ingredient.name}</h4>
                                                    <span className={`text-xs font-bold ${isCritical ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50'} px-1.5 py-0.5 rounded ml-2 whitespace-nowrap`}>
                                                        {item.quantity.toFixed(1)} {item.ingredient.unit}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                                                    <div className={`h-1.5 rounded-full ${isCritical ? 'bg-red-500' : 'bg-orange-400'}`} style={{ width: `${Math.min((item.quantity / lowStockThreshold) * 100, 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {lowStockItems.length === 0 && (
                                    <div className="flex flex-col items-center justify-center flex-1 text-slate-500 dark:text-zinc-400 h-32">
                                        <CheckCircle size={40} className="mb-2 text-emerald-500 dark:text-emerald-400 opacity-70" />
                                        <p className="text-sm">All stock levels look good!</p>
                                    </div>
                                )}
                            </div>

                            <button className="w-full mt-6 py-3 px-4 bg-[#10b981] text-white hover:bg-[#059669] font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
                                <Link href="/inventory" className="w-full h-full block">Go to Inventory</Link>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
