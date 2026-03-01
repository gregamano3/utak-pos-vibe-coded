import { prisma } from "@/app/lib/prisma"
import { createCategory, createProduct, deleteCategory, deleteProduct } from "@/app/lib/actions/product"
import { Plus, Trash2 } from "lucide-react"

export default async function ProductsPage() {
    const categories = await prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { products: true } } }
    })

    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            category: true,
            ingredients: {
                include: { ingredient: true }
            }
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
        return "https://images.unsplash.com/photo-1546069901-ba6dfaec34a7?q=80&w=400&auto=format&fit=crop" // fallback food
    }

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-slate-50 text-slate-800 font-sans antialiased selection:bg-[#10b981]/20 selection:text-[#059669]">

            {/* Header Area */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-8 py-4 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Menu Catalog</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Manage categories, products, and pricing.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <button className="hidden sm:flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm active:scale-95">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        <span>Export Menu</span>
                    </button>
                    <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden bg-cover bg-center border border-slate-200 shadow-sm" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=facearea&facepad=2')" }}></div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 flex justify-center">
                <div className="flex flex-col max-w-[1280px] w-full gap-8">

                    {/* Quick Stats / Overview row adapted from template styling */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <span className="material-symbols-outlined text-2xl">category</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total Categories</p>
                                    <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#10b981]/10 text-[#10b981] rounded-xl">
                                    <span className="material-symbols-outlined text-2xl">restaurant_menu</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Active Products</p>
                                    <p className="text-2xl font-bold text-slate-900">{products.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Categories Column */}
                        <div className="space-y-6">

                            {/* Add Category Form */}
                            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#10b981]">new_label</span>
                                    New Category
                                </h2>
                                <form action={createCategory} className="flex gap-3">
                                    <input
                                        name="name"
                                        placeholder="e.g. Specialty Drinks"
                                        required
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
                                    />
                                    <button type="submit" className="flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg transition-all shadow-sm active:scale-95">
                                        <Plus size={18} />
                                    </button>
                                </form>
                            </div>

                            {/* Category List */}
                            <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                                    <h2 className="font-bold text-slate-800 text-sm">Active Categories</h2>
                                </div>
                                <ul className="divide-y divide-slate-100 overflow-y-auto max-h-[500px]">
                                    {categories.map(c => (
                                        <li key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded bg-[#10b981]/10 text-[#10b981] flex items-center justify-center font-bold text-xs ring-1 ring-inset ring-[#10b981]/20">
                                                    {c.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
                                                    <p className="text-xs text-slate-500 font-medium mt-0.5">{c._count.products} mapped items</p>
                                                </div>
                                            </div>
                                            <form action={deleteCategory.bind(null, c.id)}>
                                                <button type="submit" className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                                    <Trash2 size={16} />
                                                </button>
                                            </form>
                                        </li>
                                    ))}
                                    {categories.length === 0 && (
                                        <li className="p-8 text-center text-sm text-slate-500">No categories found. Start by adding one.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Products Column */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Add Product Form */}
                            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 rounded-bl-[100px] pointer-events-none"></div>
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2 relative z-10">
                                    <span className="material-symbols-outlined text-[#10b981]">fastfood</span>
                                    New Menu Item
                                </h2>

                                <form action={createProduct} className="grid grid-cols-1 md:grid-cols-6 gap-4 relative z-10">
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Product Name</label>
                                        <input
                                            name="name"
                                            placeholder="e.g. Signature Burger"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Price (?)</label>
                                        <input
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all text-right font-medium"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Category</label>
                                        <select
                                            name="categoryId"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all cursor-pointer font-medium"
                                        >
                                            <option value="" className="text-slate-400">Select...</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-6 flex justify-end mt-2">
                                        <button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-lg transition-all font-bold text-sm flex items-center gap-2 shadow-md shadow-[#10b981]/20 hover:shadow-[#10b981]/30 active:translate-y-[1px]">
                                            <span className="material-symbols-outlined text-[18px]">add</span> Save Item
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Products List (Adapted to visual styling of the template's table) */}
                            <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Menu Catalog</h3>
                                        <p className="text-sm text-slate-500 mt-1">All available items for sale in the POS.</p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs tracking-wider border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold">Product Info</th>
                                                <th className="px-6 py-4 font-semibold">Category</th>
                                                <th className="px-6 py-4 font-semibold">Price</th>
                                                <th className="px-6 py-4 font-semibold text-center mt-0.5">Recipe Setup</th>
                                                <th className="px-6 py-4 font-semibold w-10 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {products.map(p => {
                                                const hasRecipe = p.ingredients.length > 0;
                                                return (
                                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                                        <td className="px-6 py-5 text-slate-900 font-medium">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold ring-1 ring-inset ring-slate-200 bg-cover bg-center shadow-sm" style={{ backgroundImage: `url('?{getProductImage(p.name)}')` }}></div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                                                                    <span className="text-xs text-slate-500 font-medium mt-0.5 w-[140px] truncate">ID: {p.id.split('-')[0].toUpperCase()}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200">
                                                                {p.category.name}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="text-lg font-bold text-slate-900">?{p.price.toFixed(2)}</span>
                                                        </td>
                                                        <td className="px-6 py-5 text-center">
                                                            {hasRecipe ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                                                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Configured
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                                    <span className="material-symbols-outlined text-[14px]">warning</span> Missing
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <form action={deleteProduct.bind(null, p.id)}>
                                                                <button type="submit" className="text-slate-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                                </button>
                                                            </form>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                            {products.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                                        <div className="flex flex-col items-center justify-center gap-2">
                                                            <span className="material-symbols-outlined text-4xl text-slate-300">restaurant</span>
                                                            <p>No products found. Add categories first to create products.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-6 py-4 bg-slate-50 rounded-b-xl border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
                                    <span>Showing <span className="font-bold text-slate-700">{products.length}</span> active items</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
