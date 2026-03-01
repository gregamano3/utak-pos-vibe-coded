"use client"

import { useState, useRef } from "react"
import { ImagePlus, X } from "lucide-react"

type Props = {
  name?: string
  defaultValue?: string | null
  className?: string
}

export function ProductImageUpload({ name = "imageUrl", defaultValue, className = "" }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(defaultValue ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setImageUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  function handleRemove() {
    setImageUrl(null)
    setError(null)
    inputRef.current?.value && (inputRef.current.value = "")
  }

  return (
    <div className={className}>
      <input type="hidden" name={name} value={imageUrl ?? ""} />
      <div className="flex items-center gap-3">
        <div className="relative w-20 h-20 rounded-lg bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <label className="cursor-pointer w-full h-full flex items-center justify-center hover:bg-slate-50 transition-colors">
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleChange}
                disabled={uploading}
                className="hidden"
              />
              {uploading ? (
                <span className="text-xs text-slate-500">Uploading...</span>
              ) : (
                <ImagePlus size={24} className="text-slate-400" />
              )}
            </label>
          )}
        </div>
        <div className="text-xs text-slate-500">
          {imageUrl ? "Click × to remove" : "JPEG, PNG, WebP, GIF. Max 5MB"}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
