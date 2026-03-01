"use client"

import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { Search, Plus, SearchX, User, UtensilsCrossed, Minus, Trash2, ShoppingCart, Printer, ArrowRight, ChevronUp, X } from "lucide-react"
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

    // Hotkeys: 1-9 and 0 for first 10 products (keys work when not typing in search)
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const target = document.activeElement as HTMLElement
            if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT") return
            const key = e.key
            const idx = key === "0" ? 9 : key >= "1" && key <= "9" ? parseInt(key, 10) - 1 : -1
            if (idx >= 0 && displayedProducts[idx]) {
                e.preventDefault()
                addToCart(displayedProducts[idx])
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [displayedProducts, orderType])

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
        setCart(prev =>
            prev.flatMap(item => {
                if (item.id !== id) return [item]
                const newQty = item.quantity + delta
                return newQty > 0 ? [{ ...item, quantity: newQty }] : []
            })
        )
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
            toast.success("Order completed successfully!")
        } else {
            toast.error(result.error || "Checkout failed")
        }

        setIsProcessing(false)
    }

    const handlePrintReceipt = () => {
        if (cart.length === 0) {
            toast.error("Add items to order first")
            return
        }
        const doc = new jsPDF({ format: "a4", unit: "mm" })
        const pageWidth = doc.internal.pageSize.getWidth()
        let y = 20

        // Header
        doc.setFontSize(22)
        doc.setFont("helvetica", "bold")
        doc.text("OFFICIAL RECEIPT", pageWidth / 2, y, { align: "center" })
        y += 10

        doc.setFontSize(12)
        doc.setFont("helvetica", "normal")
        doc.text("Utak POS", pageWidth / 2, y, { align: "center" })
        y += 6

        doc.setFontSize(9)
        doc.text(`Date: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: "center" })
        y += 5
        doc.text(`Order Type: ${orderType} | Payment: CASH`, pageWidth / 2, y, { align: "center" })
        y += 12

        // Items table
        const tableData = cart.map((item) => [
            String(item.quantity),
            item.name,
            formatCurrency(item.price),
            formatCurrency(item.price * item.quantity),
        ])

        autoTable(doc, {
            startY: y,
            head: [["Qty", "Description", "Unit Price", "Amount"]],
            body: tableData,
            theme: "plain",
            headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold" },
            margin: { left: 14, right: 14 },
            columnStyles: {
                0: { cellWidth: 15 },
                1: { cellWidth: "auto" },
                2: { cellWidth: 35, halign: "right" },
                3: { cellWidth: 40, halign: "right" },
            },
        })

        y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 10

        // Totals
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.text(`Subtotal:`, pageWidth - 54, y)
        doc.text(formatCurrency(totalAmount), pageWidth - 14, y, { align: "right" })
        y += 6
        doc.text(`Tax (10%):`, pageWidth - 54, y)
        doc.text(formatCurrency(tax), pageWidth - 14, y, { align: "right" })
        y += 8
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.text("Total:", pageWidth - 54, y)
        doc.text(formatCurrency(finalTotal), pageWidth - 14, y, { align: "right" })
        y += 15

        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        doc.text("Thank you for your order!", pageWidth / 2, y, { align: "center" })
        y += 6
        doc.text("— This is a computer-generated receipt —", pageWidth / 2, y, { align: "center" })

        const blob = doc.output("blob")
        const url = URL.createObjectURL(blob)
        window.open(url, "_blank", "noopener,noreferrer")
        URL.revokeObjectURL(url)
        toast.success("Receipt opened in new tab")
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


    const [cartOpen, setCartOpen] = useState(false)

    return (
        <div className="flex flex-col lg:flex-row h-full bg-slate-100 dark:bg-zinc-900 font-sans text-slate-800 dark:text-zinc-100 overflow-hidden antialiased">

            {/* Main Product Area */}
            <section className="flex flex-1 flex-col overflow-hidden min-w-0">
                {/* Categories Scroll Nav */}
                <div className="flex w-full gap-3 overflow-x-auto whitespace-nowrap px-4 sm:px-6 py-4 pb-2 hide-scrollbar bg-slate-100 dark:bg-zinc-900">
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
                <div className="px-4 sm:px-6 py-2">
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
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-24 lg:pb-6">
                    <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pb-6">
                        {displayedProducts.map((p, idx) => {
                            const hotkey = idx < 9 ? String(idx + 1) : idx === 9 ? "0" : null
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => addToCart(p)}
                                    className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white dark:bg-zinc-800 border border-transparent shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div
                                        className="aspect-[4/3] w-full bg-cover bg-center"
                                        style={{ backgroundImage: `url("${getProductImage(p)}")` }}
                                    ></div>
                                    <div className="flex flex-col p-4">
                                        <h3 className="line-clamp-1 font-bold text-[#1f2937] dark:text-zinc-100 text-base">{p.name}</h3>
                                        <div className="mt-1 flex items-center justify-between gap-2">
                                            <p className="text-sm font-bold text-[#059669] dark:text-emerald-400">{formatCurrency(p.price)}</p>
                                            {hotkey && (
                                                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 rounded border border-zinc-200 dark:border-zinc-600">
                                                    {hotkey}
                                                </kbd>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-zinc-800 text-[#059669] shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                        <Plus size={20} strokeWidth={2} />
                                    </div>
                                </div>
                            )
                        })}
                        {displayedProducts.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center text-zinc-400 py-12">
                                <SearchX size={40} strokeWidth={2} className="mb-4" />
                                <p>No products found.</p>
                            </div>
                        )}
                    </div>
                    {displayedProducts.length > 0 && (
                        <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
                            Press <kbd className="px-1 py-0.5 font-mono bg-zinc-200 dark:bg-zinc-700 rounded text-[10px]">1</kbd>-<kbd className="px-1 py-0.5 font-mono bg-zinc-200 dark:bg-zinc-700 rounded text-[10px]">9</kbd> or <kbd className="px-1 py-0.5 font-mono bg-zinc-200 dark:bg-zinc-700 rounded text-[10px]">0</kbd> to add items (when not typing)
                        </p>
                    )}
                </div>
            </section>

            {/* Mobile cart FAB - visible on small screens */}
            <button
                onClick={() => setCartOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#059669] text-white shadow-lg shadow-[#059669]/40 hover:bg-[#047857] active:scale-95 transition-all"
                aria-label="Open cart"
            >
                <ShoppingCart size={24} strokeWidth={2} />
                {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#059669] text-xs font-bold shadow">
                        {cart.length}
                    </span>
                )}
            </button>

            {/* Mobile cart overlay */}
            {cartOpen && (
                <>
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setCartOpen(false)}
                        aria-hidden="true"
                    />
                    <aside className="lg:hidden fixed inset-x-0 bottom-0 top-1/4 z-50 flex flex-col bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 rounded-t-2xl shadow-2xl animate-slide-in-bottom overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-800 shrink-0">
                            <h2 className="text-lg font-bold text-[#1f2937] dark:text-zinc-100">Current Order ({cart.length})</h2>
                            <button
                                onClick={() => setCartOpen(false)}
                                className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                aria-label="Close cart"
                            >
                                <X size={24} strokeWidth={2} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
                            {/* Order Type + Server */}
                            <div className="flex w-full rounded-lg bg-[#f3f4f6] dark:bg-zinc-800 p-1.5 border border-[#e5e7eb] dark:border-zinc-700">
                                {(["Dine-in", "Takeout", "Delivery"] as const).map(type => (
                                    <label key={type} className="flex flex-1 cursor-pointer items-center justify-center rounded-md py-2 text-sm font-bold transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-zinc-700 has-[:checked]:text-[#059669] has-[:checked]:shadow-sm text-[#4b5563] dark:text-zinc-400">
                                        <input type="radio" name="order_type_mobile" className="hidden" checked={orderType === type} onChange={() => setOrderType(type)} />
                                        <span>{type}</span>
                                    </label>
                                ))}
                            </div>
                            {/* Cart items */}
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-3 rounded-xl bg-white dark:bg-zinc-800 p-3 border border-[#e5e7eb] dark:border-zinc-700">
                                    <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-700">
                                        <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between gap-2">
                                            <span className="font-bold text-sm truncate">{item.name}</span>
                                            <span className="font-bold text-sm shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <div className="flex items-center gap-2 rounded-md bg-gray-50 dark:bg-zinc-700 px-1.5 py-0.5">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="flex h-6 w-6 items-center justify-center rounded text-[#4b5563] hover:bg-white dark:hover:bg-zinc-600" type="button"><Minus size={14} /></button>
                                                <span className="min-w-[16px] text-center text-sm font-bold">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="flex h-6 w-6 items-center justify-center rounded text-[#4b5563] hover:bg-white dark:hover:bg-zinc-600" type="button"><Plus size={14} /></button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1" type="button"><Trash2 size={14} /> Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                                    <ShoppingCart size={40} className="opacity-40 mb-2" />
                                    <p className="text-sm">No items. Add from menu.</p>
                                </div>
                            )}
                            {/* Footer - only when cart has items */}
                            {cart.length > 0 && (
                                <div className="border-t border-[#e5e7eb] dark:border-zinc-700 pt-4 space-y-3">
                                    <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(totalAmount)}</span></div>
                                    <div className="flex justify-between text-sm"><span>Tax (10%)</span><span>{formatCurrency(tax)}</span></div>
                                    <div className="flex justify-between border-t border-dashed pt-3">
                                        <span className="font-bold">Total</span><span className="text-xl font-extrabold text-[#059669]">{formatCurrency(finalTotal)}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => setCart([])} className="flex items-center justify-center gap-1 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-bold" type="button"><Trash2 size={18} /> Clear</button>
                                        <button onClick={handlePrintReceipt} className="flex items-center justify-center gap-1 py-2.5 rounded-lg bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-sm font-bold" type="button"><Printer size={18} /> Print</button>
                                    </div>
                                    <button onClick={() => { handleCheckout(); setCartOpen(false); }} disabled={isProcessing} className="w-full flex items-center justify-between rounded-xl bg-[#059669] px-4 py-3.5 font-bold text-white disabled:opacity-50" type="button">
                                        <span>{isProcessing ? "Processing..." : "Checkout"}</span>
                                        <span className="text-lg">{formatCurrency(finalTotal)}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </aside>
                </>
            )}

            {/* Order Sidebar - desktop only */}
            <aside className="hidden lg:flex w-[360px] xl:w-[400px] shrink-0 flex-col bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.03)] dark:shadow-none z-10">

                {/* Order Header */}
                <div className="flex flex-col border-b border-[#e5e7eb] dark:border-zinc-800 p-5 pb-4 bg-white dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-[#1f2937] dark:text-zinc-100">Current Order</h2>
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
                        <div key={item.id} className="flex gap-3 rounded-xl bg-white p-3 border border-[#e5e7eb] shadow-sm hover:border-[#059669]/30 transition-colors">
                            <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800">
                                <img
                                    src={getProductImage(item)}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <span className="font-bold text-[#1f2937] dark:text-zinc-100 text-[15px] truncate">{item.name}</span>
                                    <span className="font-bold text-[#1f2937] dark:text-zinc-100 text-[15px] shrink-0">
                                        {formatCurrency(item.price * item.quantity)}
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-[#4b5563] dark:text-zinc-400">{formatCurrency(item.price)} / ea</span>

                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                                    title="Remove from order"
                                >
                                    <Trash2 size={14} strokeWidth={2} />
                                    Remove
                                </button>

                                <div className="flex items-center justify-between mt-1 pt-2 border-t border-dashed border-gray-100 dark:border-zinc-700">
                                    <div className="flex flex-wrap gap-1.5" />
                                    <div className="flex items-center gap-3 rounded-md bg-gray-50 dark:bg-zinc-800 px-1 py-0.5 border border-[#e5e7eb] dark:border-zinc-700 shadow-sm">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="flex h-6 w-6 items-center justify-center rounded text-[#4b5563] hover:bg-white hover:text-red-500 hover:shadow-sm transition-all"
                                        >
                                            <Minus size={16} strokeWidth={2} />
                                        </button>
                                        <span className="min-w-[16px] text-center text-sm font-bold text-[#1f2937] dark:text-zinc-100">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="flex h-6 w-6 items-center justify-center rounded text-[#4b5563] hover:bg-white hover:text-[#059669] hover:shadow-sm transition-all"
                                        >
                                            <Plus size={16} strokeWidth={2} />
                                        </button>
                                    </div>
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
                        <button
                            onClick={handlePrintReceipt}
                            disabled={cart.length === 0}
                            className="flex flex-col items-center justify-center rounded-lg bg-[#f9fafb] p-2.5 text-[#4b5563] hover:bg-white hover:text-[#059669] hover:shadow-md border border-[#e5e7eb] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
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
