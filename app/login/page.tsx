"use client"

import { login } from "@/app/lib/actions/auth"
import { useState } from "react"
import { Store, Shield, UserCog, CreditCard, ChefHat, User, Loader2 } from "lucide-react"
import { ThemeSwitcher } from "@/app/components/ThemeSwitcher"

const DEMO_ACCOUNTS = [
    { username: "admin", password: "password123", role: "Admin", icon: Shield, color: "bg-violet-500 hover:bg-violet-600 border-violet-200 dark:border-violet-800" },
    { username: "manager", password: "password123", role: "Manager", icon: UserCog, color: "bg-blue-500 hover:bg-blue-600 border-blue-200 dark:border-blue-800" },
    { username: "cashier", password: "password123", role: "Cashier", icon: CreditCard, color: "bg-emerald-500 hover:bg-emerald-600 border-emerald-200 dark:border-emerald-800" },
    { username: "kitchen", password: "password123", role: "Kitchen", icon: ChefHat, color: "bg-amber-500 hover:bg-amber-600 border-amber-200 dark:border-amber-800" },
    { username: "staff", password: "password123", role: "Staff", icon: User, color: "bg-slate-500 hover:bg-slate-600 border-slate-200 dark:border-slate-700" },
] as const

export default function LoginPage() {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState<string | null>(null)

    async function handleSubmit(formData: FormData, account?: string) {
        setLoading(account ?? "form")
        setError("")
        try {
            const res = await login(formData)
            if (res?.error) setError(res.error)
        } catch (err) {
            if ((err as Error).message !== "NEXT_REDIRECT") {
                setError("An error occurred during login")
            }
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 font-sans px-4 py-8">
            <div className="absolute top-4 right-4">
                <ThemeSwitcher />
            </div>
            <div className="w-full max-w-md space-y-6">
                <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-zinc-800">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-4">
                            <Store size={24} />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Utak POS</h1>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">Sign in to continue</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 px-2">
                            Demo: data resets every 12 MN
                        </p>
                    </div>

                    <form action={(fd) => handleSubmit(fd, "form")} className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-lg">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Username</label>
                        <input
                            name="username"
                            required
                            className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!!loading}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading === "form" ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>
                </div>

                <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
                    <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-3 text-center">Quick login (demo)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {DEMO_ACCOUNTS.map((acc) => {
                            const Icon = acc.icon
                            const isLoading = loading === acc.username
                            return (
                                <form key={acc.username} action={(fd) => handleSubmit(fd, acc.username)}>
                                    <input type="hidden" name="username" value={acc.username} />
                                    <input type="hidden" name="password" value={acc.password} />
                                    <button
                                        type="submit"
                                        disabled={!!loading}
                                        className={`w-full flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${acc.color} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                        title={`Login as ${acc.role}`}
                                    >
                                        {isLoading ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <Icon size={20} />
                                        )}
                                        <span className="text-xs font-medium capitalize">{acc.role}</span>
                                    </button>
                                </form>
                            )
                        })}
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 text-center mt-2">All use password: password123</p>
                </div>
            </div>
            <footer className="absolute bottom-4 flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-sm">
                <span>Theme</span>
                <ThemeSwitcher />
            </footer>
        </div>
    )
}
