"use client"

import { useState, useMemo } from "react"
import { Search, Plus, SearchX, User, UtensilsCrossed, Minus, Trash2, ShoppingCart, Printer, ArrowRight } from "lucide-react"
import { checkoutOrder } from "@/app/lib/actions/order"
import { formatCurrency } from "@/app/lib/currency"

type Product = { id: string; name: string; price: number; categoryId: string; imageUrl?: string | null }
type Category = { id: string; name: string; products: Product[] }
type CartItem = Product & { quantity: number; orderType?: "Dine-in" | "Takeout" | "Delivery" }

export function PosTerminal({ categories, allProducts }: { categories: Category[], allProducts: Product[] }) {
    const [activeCategory, setActiveCategory] = useState<string | null>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [cart, setCart] = useState<CartItem[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [orderType, setOrderType] = useState<"Dine-in" | "Takeout" | "Delivery">("Dine-in")

    const displayedProducts = useMemo(() => {
        if (searchQuery.trim()) {
            return allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        }
        if (activeCategory === "all") return allProducts
        return categories.find(c => c.id === activeCategory)?.products || []
    }, [searchQuery, activeCategory, categories, allProducts])

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
            }
            return [...prev, { ...product, quantity: 1, orderType }]
        })
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta
                return newQty > 0 ? { ...item, quantity: newQty } : item
            }
            return item
        }))
    }

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = totalAmount * 0.10 // Assuming 10% tax for the template visual
    const finalTotal = totalAmount + tax

    const handleCheckout = async () => {
        if (cart.length === 0 || isProcessing) return
        setIsProcessing(true)

        const items = cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
        }))

        // Still using the real totalAmount for the backend MVP logic to keep things simple
        const result = await checkoutOrder(items, totalAmount, "CASH")

        if (result.success) {
            setCart([])
            alert("Order completed successfully!")
        } else {
            alert(result.error || "Checkout failed")
        }

        setIsProcessing(false)
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


    return (
        <div className="flex h-full bg-slate-100 dark:bg-zinc-900 font-sans text-slate-800 dark:text-zinc-100 overflow-hidden antialiased">

            {/* Main Product Area */}
            <section className="flex flex-1 flex-col overflow-hidden">
                {/* Categories Scroll Nav */}
                <div className="flex w-full gap-3 overflow-x-auto whitespace-nowrap px-6 py-4 pb-2 hide-scrollbar bg-slate-100 dark:bg-zinc-900">
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={`flex h-10 min-w-[80px] items-center justify-center rounded-lg px-4 text-sm font-bold shadow-sm transition-all ${activeCategory === "all"
                            ? "bg-[#059669] text-white shadow-[#059669]/20 hover:bg-[#047857]"
                            : "bg-white text-[#4b5563] hover:text-[#059669] border border-[#e5e7eb]"
                            }`}
                    >
                        All
                    </button>
                    {categories.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setActiveCategory(c.id)}
                            className={`flex h-10 min-w-[80px] items-center justify-center rounded-lg px-4 text-sm font-medium shadow-sm transition-all capitalize border ${activeCategory === c.id
                                ? "bg-[#059669] text-white border-[#059669] hover:bg-[#047857]"
                                : "bg-white text-[#4b5563] border-[#e5e7eb] hover:text-[#059669]"
                                }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                {/* Search Bar - Moved from Header to here for ease of access in this restricted layout scope */}
                <div className="px-6 py-2">
                    <label className="relative flex h-10 w-full md:w-64 items-center">
                        <div className="absolute left-3 flex items-center justify-center text-[#4b5563] pointer-events-none">
                            <Search size={20} strokeWidth={2} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-full w-full rounded-lg border border-[#e5e7eb] bg-white pl-10 pr-4 text-sm text-[#1f2937] placeholder-[#9ca3af] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] shadow-sm transition-all"
                        />
                    </label>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pb-6">
                        {displayedProducts.map(p => (
                            <div
                                key={p.id}
                                onClick={() => addToCart(p)}
                                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white border border-transparent shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div
                                    className="aspect-[4/3] w-full bg-cover bg-center"
                                    style={{ backgroundImage: `url("${getProductImage(p)}")` }}
                                ></div>
                                <div className="flex flex-col p-4">
                                    <h3 className="line-clamp-1 font-bold text-[#1f2937] text-base">{p.name}</h3>
                                    <p className="mt-1 text-sm font-bold text-[#059669]">{formatCurrency(p.price)}</p>
                                </div>
                                <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#059669] shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                    <Plus size={20} strokeWidth={2} />
                                </div>
                            </div>
                        ))}
                        {displayedProducts.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center text-zinc-400 py-12">
                                <SearchX size={40} strokeWidth={2} className="mb-4" />
                                <p>No products found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Order Sidebar */}
            <aside className="flex w-[400px] shrink-0 flex-col bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.03)] dark:shadow-none z-10">

                {/* Order Header */}
                <div className="flex flex-col border-b border-[#e5e7eb] p-5 pb-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-[#1f2937]">Current Order</h2>
                        <span className="rounded-full bg-[#d1fae5] px-3 py-1 text-xs font-bold text-[#059669] uppercase tracking-wide">
                            {cart.length > 0 ? "Pending" : "Empty"}
                        </span>
                    </div>

                    {/* Order Type Selector */}
                    <div className="flex w-full rounded-lg bg-[#f3f4f6] p-1.5 border border-[#e5e7eb]">
                        {(["Dine-in", "Takeout", "Delivery"] as const).map(type => (
                            <label key={type} className="flex flex-1 cursor-pointer items-center justify-center rounded-md py-2 text-sm font-bold transition-all has-[:checked]:bg-white has-[:checked]:text-[#059669] has-[:checked]:shadow-sm text-[#4b5563] hover:text-[#1f2937]">
                                <input
                                    type="radio"
                                    name="order_type"
                                    className="hidden"
                                    checked={orderType === type}
                                    onChange={() => setOrderType(type)}
                                />
                                <span>{type}</span>
                            </label>
                        ))}
                    </div>

                    <div className="mt-4 flex justify-between text-xs font-medium text-[#4b5563] px-1">
                        <div className="flex items-center gap-1">
                            <User size={14} strokeWidth={2} />
                            <span>Server: Admin</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <UtensilsCrossed size={14} strokeWidth={2} />
                            <span>Register 1</span>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f9fafb]/30">
                    {cart.map(item => (
                        <div key={item.id} className="flex flex-col gap-2 rounded-xl bg-white p-4 border border-[#e5e7eb] shadow-sm hover:border-[#059669]/30 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col">
                                    <span className="font-bold text-[#1f2937] text-[15px]">{item.name}</span>
                                    <span className="text-xs font-medium text-[#4b5563] mt-0.5">{formatCurrency(item.price)} / ea</span>
                                </div>
                                <span className="font-bold text-[#1f2937] text-[15px]">
                                    {formatCurrency(item.price * item.quantity)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-gray-100">
                                <div className="flex flex-wrap gap-1.5">
                                    {/* Placeholder for modifiers if implemented later */}
                                </div>
                                <div className="flex items-center gap-3 rounded-md bg-gray-50 px-1 py-0.5 border border-[#e5e7eb] shadow-sm">
                                    <button
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="flex h-6 w-6 items-center justify-center rounded text-[#4b5563] hover:bg-white hover:text-red-500 hover:shadow-sm transition-all"
                                    >
                                        {item.quantity === 1 ? <Trash2 size={16} strokeWidth={2} /> : <Minus size={16} strokeWidth={2} />}
                                    </button>
                                    <span className="min-w-[16px] text-center text-sm font-bold text-[#1f2937]">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="flex h-6 w-6 items-center justify-center rounded text-[#4b5563] hover:bg-white hover:text-[#059669] hover:shadow-sm transition-all"
                                    >
                                        <Plus size={16} strokeWidth={2} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {cart.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-4 pt-12">
                            <ShoppingCart size={48} strokeWidth={2} className="opacity-40" />
                            <p>No items in current order.</p>
                        </div>
                    )}
                </div>

                {/* Checkout Summary Footer */}
                <div className="mt-auto border-t border-[#e5e7eb] bg-white p-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                    <div className="mb-5 space-y-2.5">
                        <div className="flex justify-between text-sm font-medium text-[#4b5563]">
                            <span>Subtotal</span>
                            <span className="text-[#1f2937]">{formatCurrency(totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-[#4b5563]">
                            <span>Tax (10% - display only)</span>
                            <span className="text-[#1f2937]">{formatCurrency(tax)}</span>
                        </div>
                        <div className="mt-3 flex justify-between border-t border-dashed border-[#e5e7eb] pt-3">
                            <span className="text-lg font-bold text-[#1f2937]">Total</span>
                            <span className="text-2xl font-extrabold text-[#059669]">{formatCurrency(finalTotal)}</span>
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setCart([])}
                            className="flex flex-col items-center justify-center rounded-lg bg-[#f9fafb] p-2.5 text-red-500 hover:bg-red-50 hover:shadow-md border border-[#e5e7eb] hover:border-red-200 transition-all duration-200"
                        >
                            <Trash2 size={22} strokeWidth={2} className="mb-1" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Clear</span>
                        </button>
                        <button className="flex flex-col items-center justify-center rounded-lg bg-[#f9fafb] p-2.5 text-[#4b5563] hover:bg-white hover:text-[#059669] hover:shadow-md border border-[#e5e7eb] transition-all duration-200">
                            <Printer size={22} strokeWidth={2} className="mb-1" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Print</span>
                        </button>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessing}
                        className="group flex w-full items-center justify-between rounded-xl bg-[#059669] px-6 py-4 font-bold text-white shadow-lg shadow-[#059669]/30 hover:bg-[#047857] hover:shadow-[#059669]/40 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-lg">{isProcessing ? "Processing..." : "Checkout"}</span>
                        {!isProcessing && (
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{formatCurrency(finalTotal)}</span>
                                <ArrowRight size={24} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </button>
                </div>
            </aside>
        </div>
    )
}
