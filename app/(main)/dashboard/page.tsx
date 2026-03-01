import { prisma } from "@/app/lib/prisma"
import Link from "next/link"

export default async function DashboardPage() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // 1. Today's Sales
    const todaysOrders = await prisma.order.findMany({
        where: { createdAt: { gte: today } }
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

    // 3. Best Selling Product Today
    const topItems = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: { createdAt: { gte: today } },
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
            category: prod?.category.name || "N/A",
            price: prod?.price || 0,
            quantity: t._sum.quantity || 0,
            revenue: (prod?.price || 0) * (t._sum.quantity || 0)
        }
    })

    const getProductImage = (productName: string) => {
        const p = productName.toLowerCase()
        if (p.includes("latte") || p.includes("coffee") || p.includes("cappuccino")) return "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop"
        if (p.includes("espresso")) return "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=400&auto=format&fit=crop"
        if (p.includes("tea")) return "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=400&auto=format&fit=crop"
        if (p.includes("burger")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop"
        if (p.includes("fries")) return "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=400&auto=format&fit=crop"
        if (p.includes("salad")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop"
        if (p.includes("cake")) return "https://images.unsplash.com/photo-1578985545062-69928b1ea383?q=80&w=400&auto=format&fit=crop"
        if (p.includes("ice cream") || p.includes("scoop")) return "https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?q=80&w=400&auto=format&fit=crop"
        if (p.includes("wing") || p.includes("chicken")) return "https://images.unsplash.com/photo-1524114664604-cd8133cd6771?q=80&w=400&auto=format&fit=crop"
        return "https://images.unsplash.com/photo-1546069901-ba6dfaec34a7?q=80&w=400&auto=format&fit=crop"
    }

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-[#f8fafc] text-[#1e293b] font-sans selection:bg-[#10b981]/20 selection:text-[#059669]">

            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6 sticky top-0 bg-[#f8fafc]/80 backdrop-blur-md z-10 border-b border-[#f1f5f9]">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">Dashboard Overview</h1>
                    <p className="text-[#64748b] text-sm mt-1 font-medium">Welcome back, Admin</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center justify-center h-10 w-10 rounded-full bg-white text-[#64748b] hover:text-[#10b981] hover:bg-slate-50 border border-[#e2e8f0] shadow-sm transition-all relative">
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                        {lowStockItems.length > 0 && (
                            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                        )}
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-[#e2e8f0]">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-[#1e293b]">Admin User</p>
                            <p className="text-xs text-[#64748b] font-medium">Store Manager</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden bg-cover bg-center border border-[#e2e8f0] shadow-sm" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=facearea&facepad=2')" }}></div>
                    </div>
                </div>
            </header>

            <div className="px-8 pb-10 flex flex-col gap-6 max-w-[1600px] w-full mx-auto mt-2">

                {/* Metric Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between h-36 group hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-2">Today's Sales</span>
                                <span className="text-3xl font-bold text-[#1e293b] tracking-tight">?{todaySales.toFixed(2)}</span>
                            </div>
                            <div className="p-2.5 bg-emerald-50 rounded-xl text-[#10b981]">
                                <span className="material-symbols-outlined text-[24px]">payments</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 border border-emerald-100">
                                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                12%
                            </span>
                            <span className="text-[#64748b] text-xs">vs yesterday</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between h-36 group hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-2">Net Profit</span>
                                <span className="text-3xl font-bold text-[#1e293b] tracking-tight">?{netProfit.toFixed(2)}</span>
                            </div>
                            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                                <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 border border-emerald-100">
                                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                5%
                            </span>
                            <span className="text-[#64748b] text-xs">vs yesterday</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between h-36 group hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-2">Order Count</span>
                                <span className="text-3xl font-bold text-[#1e293b] tracking-tight">{todayCount}</span>
                            </div>
                            <div className="p-2.5 bg-orange-50 rounded-xl text-orange-600">
                                <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 border border-emerald-100">
                                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                {todayCount > 0 ? "8%" : "0%"}
                            </span>
                            <span className="text-[#64748b] text-xs">vs yesterday</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between h-36 group hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-2">Avg Order Value</span>
                                <span className="text-3xl font-bold text-[#1e293b] tracking-tight">?{avgOrder.toFixed(2)}</span>
                            </div>
                            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                                <span className="material-symbols-outlined text-[24px]">shopping_basket</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 border border-emerald-100">
                                <span className="material-symbols-outlined text-[14px]">trending_up</span>
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
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-[#1e293b]">Peak Hours Activity</h3>
                                    <p className="text-[#64748b] text-sm mt-1">Store traffic heatmap based on transaction volume</p>
                                </div>
                                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs font-medium">
                                    <button className="px-4 py-1.5 bg-white shadow-sm border border-slate-200 rounded-md text-[#1e293b] font-semibold transition-all">Today</button>
                                    <button className="px-4 py-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-white/50 rounded-md transition-all">Week</button>
                                </div>
                            </div>

                            <div className="flex items-end gap-6 h-64 w-full px-2">
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
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex-1">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-[#1e293b]">Top Selling Items</h3>
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
                                                    <div className="h-10 w-10 rounded-lg bg-slate-200 bg-cover bg-center shadow-sm" style={{ backgroundImage: `url('?{getProductImage(p.name)}')` }}></div>
                                                    <span className="font-semibold text-[#1e293b]">{p.name}</span>
                                                </td>
                                                <td className="py-4 px-3 text-[#64748b] font-medium">{p.category}</td>
                                                <td className="py-4 px-3 text-right text-[#1e293b] font-semibold">{p.quantity}</td>
                                                <td className="py-4 px-3 text-right text-[#1e293b] font-bold">?{p.revenue.toFixed(2)}</td>
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
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-[#1e293b]">Cost %</h3>
                                <div className="p-1 rounded-full hover:bg-slate-50 cursor-pointer">
                                    <span className="material-symbols-outlined text-[#64748b] text-[20px]">more_horiz</span>
                                </div>
                            </div>
                            <p className="text-sm text-[#64748b] mb-8">Current cost vs revenue ratio</p>

                            <div className="flex items-center justify-center relative h-52 w-52 mx-auto mb-6">
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
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-[#1e293b]">Low Stock Alerts</h3>
                                <Link href="/inventory" className="text-xs font-semibold text-[#10b981] hover:text-[#059669] hover:underline">View All</Link>
                            </div>

                            <div className="flex flex-col gap-4 flex-1">
                                {lowStockItems.map(item => {
                                    // Assign a dynamic color/icon based on how low it is for visual appeal
                                    const isCritical = item.quantity <= 2;
                                    const colorClass = isCritical ? "red" : "orange";
                                    const themeColorHex = isCritical ? "#ef4444" : "#f97316";

                                    return (
                                        <div key={item.id} className={`flex items-center gap-4 p-4 bg-white rounded-xl border ?{isCritical ? 'border-red-100' : 'border-orange-100'} hover:shadow-sm transition-shadow group`}>
                                            <div className={`?{isCritical ? 'bg-red-50 text-red-500 group-hover:bg-red-100' : 'bg-orange-50 text-orange-500 group-hover:bg-orange-100'} p-2.5 rounded-lg transition-colors`}>
                                                <span className="material-symbols-outlined text-[20px]">warning</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="text-sm font-semibold text-[#1e293b] truncate uppercase">{item.ingredient.name}</h4>
                                                    <span className={`text-xs font-bold ?{isCritical ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50'} px-1.5 py-0.5 rounded ml-2 whitespace-nowrap`}>
                                                        {item.quantity.toFixed(1)} {item.ingredient.unit}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                                                    <div className={`h-1.5 rounded-full ?{isCritical ? 'bg-red-500' : 'bg-orange-400'}`} style={{ width: `?{Math.min((item.quantity / lowStockThreshold) * 100, 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {lowStockItems.length === 0 && (
                                    <div className="flex flex-col items-center justify-center flex-1 text-[#64748b] h-32">
                                        <span className="material-symbols-outlined text-4xl opacity-50 mb-2">check_circle</span>
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
