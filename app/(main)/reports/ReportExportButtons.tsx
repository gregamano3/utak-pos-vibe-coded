"use client"

import { FileSpreadsheet, FileText } from "lucide-react"

type Props = {
  from: string // YYYY-MM-DD
  to: string
}

export function ReportExportButtons({ from, to }: Props) {
  const base = "/api/reports/export"
  const params = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`

  return (
    <div className="flex items-center gap-2">
      <a
        href={`${base}/pdf?${params}`}
        download
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
      >
        <FileText size={18} strokeWidth={2} />
        Download PDF
      </a>
      <a
        href={`${base}/excel?${params}`}
        download
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
      >
        <FileSpreadsheet size={18} strokeWidth={2} />
        Download Excel
      </a>
    </div>
  )
}
