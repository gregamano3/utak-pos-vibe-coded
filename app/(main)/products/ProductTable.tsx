"use client"

import { useState } from "react"
import { Trash2, Pencil, X, CheckCircle, TriangleAlert, UtensilsCrossed } from "lucide-react"
import { formatCurrency } from "@/app/lib/currency"
import { updateProduct, deleteProduct } from "@/app/lib/actions/product"
import { ProductImageUpload } from "@/app/components/ProductImageUpload"

type Category = { id: string; name: string }
type Product = {
  id: string
  name: string
  price: number
  categoryId: string
  category: Category
  ingredients: { ingredientId: string }[]
  imageUrl?: string | null
}

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

export function ProductTable({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs tracking-wider border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 font-semibold">Product Info</th>
            <th className="px-6 py-4 font-semibold">Category</th>
            <th className="px-6 py-4 font-semibold">Price</th>
            <th className="px-6 py-4 font-semibold text-center">Recipe Setup</th>
            <th className="px-6 py-4 font-semibold w-10 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {products.map((p) => {
            const hasRecipe = p.ingredients.length > 0
            const isEditing = editingId === p.id

            return (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                {isEditing ? (
                  <td colSpan={5} className="px-6 py-4 bg-slate-50 dark:bg-zinc-900/50">
                    <form
                      action={(fd) => {
                        updateProduct(p.id, fd)
                        setEditingId(null)
                      }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
                    >
                      <div className="md:col-span-4">
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Product Name</label>
                        <input
                          name="name"
                          defaultValue={p.name}
                          required
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Price (₱)</label>
                        <input
                          name="price"
                          type="number"
                          step="0.01"
                          defaultValue={p.price}
                          required
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-right"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Category</label>
                        <select
                          name="categoryId"
                          defaultValue={p.categoryId}
                          required
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-12">
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Product Image</label>
                        <ProductImageUpload defaultValue={p.imageUrl} />
                      </div>
                      <div className="md:col-span-12 flex gap-2">
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
                        >
                          <X size={16} /> Cancel
                        </button>
                      </div>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-6 py-5 text-slate-900 font-medium">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold ring-1 ring-inset ring-slate-200 bg-cover bg-center shadow-sm"
                          style={{ backgroundImage: `url('${getProductImage(p)}')` }}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                          <span className="text-xs text-slate-500 font-medium mt-0.5 w-[140px] truncate">ID: {p.id.split("-")[0].toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200">
                        {p.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-lg font-bold text-slate-900">{formatCurrency(p.price)}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {hasRecipe ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle size={14} strokeWidth={2} /> Configured
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <TriangleAlert size={14} strokeWidth={2} /> Missing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingId(p.id)}
                          className="p-1.5 rounded-md text-slate-300 hover:text-[#10b981] hover:bg-emerald-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Edit"
                        >
                          <Pencil size={18} strokeWidth={2} />
                        </button>
                        <form action={deleteProduct.bind(null, p.id)}>
                          <button
                            type="submit"
                            className="p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete"
                          >
                            <Trash2 size={20} strokeWidth={2} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            )
          })}
          {products.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <UtensilsCrossed size={40} strokeWidth={2} className="text-slate-300" />
                  <p>No products found. Add categories first to create products.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
