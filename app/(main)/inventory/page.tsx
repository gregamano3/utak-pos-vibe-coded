import { prisma } from "@/app/lib/prisma"
import { createIngredient, deleteIngredient, updateInventory, addRecipeIngredient, deleteRecipeIngredient } from "@/app/lib/actions/inventory"
import { Plus, Trash2, Save, Search, Download } from "lucide-react"

export default async function InventoryPage() {
    const ingredients = await prisma.ingredient.findMany({
        orderBy: { name: 'asc' },
        include: { inventory: true }
    })

    const products = await prisma.product.findMany({
        orderBy: { name: 'asc' },
        include: {
            ingredients: {
                include: { ingredient: true }
            }
        }
    })

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#f8fafc] text-[#0f172a] font-sans selection:bg-[#13ec80]/20 selection:text-[#0fb863]">
            <header className="h-16 flex items-center justify-between px-6 border-b border-[#e2e8f0] bg-white sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-800 hidden md:block">Stock Management & Recipes</h2>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-[1400px] mx-auto space-y-6 flex flex-col items-start gap-4">

                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Ingredient Stock</h1>
                            <p className="text-slate-500 max-w-2xl font-medium">Manage your daily inventory, track stock levels, and assign recipes to products.</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center justify-center h-10 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-sm font-semibold transition-all shadow-sm">
                                <Download className="text-lg mr-2 text-slate-500" size={18} /> Export
                            </button>
                        </div>
                    </div>

                    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-8">

                        {/* Ingredients Table Section */}
                        <div className="flex flex-col gap-6">

                            {/* Add New Ingredient Form */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Add New Item</h3>
                                <form action={createIngredient} className="flex gap-3 flex-wrap sm:flex-nowrap">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-lg">category</span>
                                        </div>
                                        <input
                                            name="name"
                                            placeholder="Ingredient Name..."
                                            required
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#13ec80] focus:border-transparent shadow-sm transition-all"
                                        />
                                    </div>
                                    <select name="unit" required className="w-full sm:w-auto block py-2.5 px-4 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-[#13ec80] focus:border-transparent shadow-sm font-medium">
                                        <option value="g">Grams (g)</option>
                                        <option value="ml">Milliliters (ml)</option>
                                        <option value="pcs">Pieces (pcs)</option>
                                    </select>
                                    <button type="submit" className="flex items-center justify-center h-[46px] px-6 rounded-lg bg-[#13ec80] hover:bg-[#0fb863] text-[#0a1a12] text-sm font-bold transition-all shadow-md active:scale-95 whitespace-nowrap">
                                        <Plus size={18} className="mr-1" /> Add
                                    </button>
                                </form>
                            </div>

                            {/* Inventory List */}
                            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex-1 max-h-[600px] flex flex-col">
                                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Current Stock</h3>
                                </div>
                                <div className="overflow-x-auto overflow-y-auto flex-1">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm border-b border-slate-200">
                                            <tr>
                                                <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50">Ingredient</th>
                                                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 text-right w-32">Qty</th>
                                                <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 text-center w-16">Unit</th>
                                                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 text-right w-24">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {ingredients.map(ing => (
                                                <tr key={ing.id} className="group hover:bg-slate-50 transition-colors bg-white">
                                                    <td className="py-3 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100 shrink-0">
                                                                <span className="material-symbols-outlined text-sm">kitchen</span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-slate-900 truncate">{ing.name}</p>
                                                                <p className="text-xs text-slate-500 font-medium">Stock</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <form action={updateInventory} className="flex items-center justify-end">
                                                            <input type="hidden" name="ingredientId" value={ing.id} />
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                name="quantity"
                                                                defaultValue={ing.inventory?.quantity || 0}
                                                                className={`w-20 bg-white border ?{(ing.inventory?.quantity || 0) <= 10 ? "border-orange-300 text-orange-600" : "border-slate-200 text-slate-800"
                                                                    } rounded px-2 py-1.5 text-sm text-right font-bold shadow-sm focus:ring-2 focus:ring-[#13ec80]`}
                                                            />
                                                            <button type="submit" className="ml-1 text-slate-400 hover:text-[#0fb863] p-1.5 transition-colors rounded hover:bg-emerald-50">
                                                                <Save size={16} />
                                                            </button>
                                                        </form>
                                                    </td>
                                                    <td className="py-3 px-2 text-center text-sm text-slate-500 font-medium">
                                                        {ing.unit}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <form action={deleteIngredient.bind(null, ing.id)}>
                                                            <button type="submit" className="text-slate-400 hover:text-red-500 p-1.5 transition-colors rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </form>
                                                    </td>
                                                </tr>
                                            ))}
                                            {ingredients.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">No ingredients found. Add one above.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>


                        {/* Recipes / Product Costing Section */}
                        <div className="flex flex-col gap-6">
                            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex-1 flex flex-col">
                                <div className="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
                                    <h3 className="text-lg font-bold text-slate-900">Product Deduction Recipes</h3>
                                    <p className="text-sm text-slate-500 mt-1">Configure which ingredients to deduct from inventory when a product is sold.</p>
                                </div>

                                <div className="flex-1 overflow-y-auto bg-slate-50/30 p-4">
                                    <ul className="space-y-4">
                                        {products.map(p => (
                                            <li key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-[#13ec80]/50 transition-colors">
                                                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                                                    <span className="font-bold text-slate-800 text-base">{p.name}</span>
                                                    <span className="text-xs font-bold text-[#0fb863] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                                                        {p.ingredients.length} item(s) mapped
                                                    </span>
                                                </div>

                                                <div className="p-5 flex flex-col gap-4">
                                                    {/* Existing Mappings */}
                                                    {p.ingredients.length > 0 ? (
                                                        <ul className="flex flex-col gap-2">
                                                            {p.ingredients.map(pi => (
                                                                <li key={pi.id} className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="material-symbols-outlined text-slate-400 text-[18px]">subdirectory_arrow_right</span>
                                                                        <span className="font-semibold text-slate-700 text-sm">{pi.ingredient.name}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 shadow-sm">
                                                                            -{pi.quantity} {pi.ingredient.unit}
                                                                        </span>
                                                                        <form action={deleteRecipeIngredient.bind(null, pi.id)}>
                                                                            <button type="submit" className="text-slate-400 hover:text-red-500 transition-colors rounded p-1">
                                                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                                                            </button>
                                                                        </form>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <div className="text-sm text-slate-400 italic py-2 border border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50/50">
                                                            No deduction set. Selling won't affect stock.
                                                        </div>
                                                    )}

                                                    {/* Add Mapping Form */}
                                                    <form action={addRecipeIngredient} className="flex gap-2 text-sm pt-4 border-t border-slate-100 mt-1">
                                                        <input type="hidden" name="productId" value={p.id} />
                                                        <select name="ingredientId" required className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-[#13ec80] focus:border-transparent font-medium shadow-sm">
                                                            <option value="" className="text-slate-400">Select ingredient to add...</option>
                                                            {ingredients.map(ing => (
                                                                <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            name="quantity"
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="Qty"
                                                            required
                                                            className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-[#13ec80] focus:border-transparent shadow-sm placeholder-slate-400"
                                                        />
                                                        <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-sm active:scale-95">
                                                            Save
                                                        </button>
                                                    </form>
                                                </div>
                                            </li>
                                        ))}
                                        {products.length === 0 && (
                                            <li className="p-8 text-center text-slate-500 text-sm">Add products on the Menu/Products page first before assigning recipes.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
