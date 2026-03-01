"use client"

import { useState } from "react"
import { X, Lock } from "lucide-react"

type Props = {
  open: boolean
  title: string
  message: string
  onConfirm: (password: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function VoidConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}: Props) {
  const [password, setPassword] = useState("")

  function handleConfirm() {
    if (!password.trim()) return
    onConfirm(password)
    setPassword("")
  }

  function handleCancel() {
    setPassword("")
    onCancel()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleCancel}
    >
      <div
        className="mx-4 w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          {message}
        </p>
        <div className="mb-6">
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            Enter your password to confirm
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              placeholder="Your password"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              autoFocus
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!password.trim() || isLoading}
            className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Voiding..." : "Void"}
          </button>
        </div>
      </div>
    </div>
  )
}
