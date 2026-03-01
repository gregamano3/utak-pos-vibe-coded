import { prisma } from "@/app/lib/prisma"
import { createCategory, createProduct, deleteCategory } from "@/app/lib/actions/product"
import { formatCurrency } from "@/app/lib/currency"
import { requireRole } from "@/app/lib/auth"
import { Plus, Trash2, Download, LayoutGrid, UtensilsCrossed, Tag } from "lucide-react"
import { ProductTable } from "./ProductTable"
import { ProductImageUpload } from "@/app/components/ProductImageUpload"

export default async function ProductsPage() {
    await requireRole(["ADMIN", "MANAGER"]);
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

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-600 dark:selection:text-emerald-400">

            {/* Header Area */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 md:px-8 py-4 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Menu Catalog</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Manage categories, products, and pricing.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <button className="hidden sm:flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm active:scale-95">
                        <Download size={18} strokeWidth={2} />
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
                                    <LayoutGrid size={24} strokeWidth={2} />
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
                                    <UtensilsCrossed size={24} strokeWidth={2} />
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
                                    <Tag size={18} strokeWidth={2} className="text-[#10b981]" />
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
                                    <UtensilsCrossed size={18} strokeWidth={2} className="text-[#10b981]" />
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
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Price (₱)</label>
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

                                    <div className="md:col-span-6">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Product Image</label>
                                        <ProductImageUpload />
                                    </div>

                                    <div className="md:col-span-6 flex justify-end mt-2">
                                        <button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-lg transition-all font-bold text-sm flex items-center gap-2 shadow-md shadow-[#10b981]/20 hover:shadow-[#10b981]/30 active:translate-y-[1px]">
                                            <Plus size={18} strokeWidth={2} /> Save Item
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

                                <ProductTable products={products} categories={categories} />
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
