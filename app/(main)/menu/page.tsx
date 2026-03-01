import { prisma } from "@/app/lib/prisma"
import { requireRole } from "@/app/lib/auth"
import { formatCurrency } from "@/app/lib/currency"
import Link from "next/link"
import { Pencil, UtensilsCrossed } from "lucide-react"

const PLACEHOLDER_COST_PER_UNIT = 0.05; // Demo placeholder - add costPerUnit to Ingredient schema for real data

export default async function MenuPage() {
    await requireRole(["ADMIN", "MANAGER"]);

    const products = await prisma.product.findMany({
        orderBy: { name: "asc" },
        include: {
            category: true,
            ingredients: {
                include: {
                    ingredient: {
                        include: { inventory: true },
                    },
                },
            },
        },
    });

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 font-sans">
            <header className="h-16 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 flex-shrink-0 z-10 sticky top-0 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Menu & Recipe Costing</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:block mt-0.5">View recipe costs and ingredient breakdown</p>
                </div>
                <Link
                    href="/products"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-sm font-semibold transition-colors"
                >
                    <Pencil size={18} strokeWidth={2} />
                    Edit Products
                </Link>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {products.map((product) => {
                        const foodCost = product.ingredients.reduce(
                            (sum, pi) => sum + pi.quantity * PLACEHOLDER_COST_PER_UNIT,
                            0
                        );
                        const grossProfit = product.price - foodCost;
                        const marginPercent = product.price > 0 ? (grossProfit / product.price) * 100 : 0;
                        const costPercent = product.price > 0 ? (foodCost / product.price) * 100 : 0;

                        return (
                            <div
                                key={product.id}
                                className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden"
                            >
                                <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{product.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">{product.category.name}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 border-b border-slate-100 dark:border-zinc-800">
                                    <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-4">
                                        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Selling Price</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(product.price)}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-4">
                                        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Food Cost (Est.)</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(foodCost)}</p>
                                        <div className="mt-2 w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-1.5">
                                            <div
                                                className="bg-amber-500 h-1.5 rounded-full"
                                                style={{ width: `${Math.min(costPercent, 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 text-right">{costPercent.toFixed(1)}% of price</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-4">
                                        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Gross Profit</p>
                                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(grossProfit)}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-4">
                                        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Margin</p>
                                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{marginPercent.toFixed(1)}%</p>
                                        <div className="mt-2 w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-1.5">
                                            <div
                                                className="bg-emerald-500 h-1.5 rounded-full"
                                                style={{ width: `${Math.min(marginPercent, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Ingredient Breakdown</h4>
                                    {product.ingredients.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="text-slate-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-zinc-700">
                                                        <th className="py-3 px-4">Ingredient</th>
                                                        <th className="py-3 px-4">Qty</th>
                                                        <th className="py-3 px-4 text-right">Est. Cost</th>
                                                        <th className="py-3 px-4">Stock</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                                    {product.ingredients.map((pi) => {
                                                        const stock = pi.ingredient.inventory?.quantity ?? 0;
                                                        const estCost = pi.quantity * PLACEHOLDER_COST_PER_UNIT;
                                                        const stockStatus =
                                                            stock <= 10 ? "Low" : stock <= 50 ? "Medium" : "High";
                                                        const stockColor =
                                                            stockStatus === "Low"
                                                                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                                                : stockStatus === "Medium"
                                                                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                                                                : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400";
                                                        return (
                                                            <tr key={pi.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                                                                <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">
                                                                    {pi.ingredient.name}
                                                                </td>
                                                                <td className="py-4 px-4 text-slate-600 dark:text-zinc-400">
                                                                    {pi.quantity} {pi.ingredient.unit}
                                                                </td>
                                                                <td className="py-4 px-4 text-right font-semibold text-slate-900 dark:text-white">
                                                                    {formatCurrency(estCost)}
                                                                </td>
                                                                <td className="py-4 px-4">
                                                                    <span
                                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stockColor}`}
                                                                    >
                                                                        {stock} {pi.ingredient.unit} ({stockStatus})
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 dark:text-zinc-400 text-sm py-4">No recipe configured. Add ingredients in Inventory.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {products.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-zinc-400">
                        <UtensilsCrossed size={60} strokeWidth={2} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium">No products yet</p>
                        <Link href="/products" className="mt-2 text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                            Add products first
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
