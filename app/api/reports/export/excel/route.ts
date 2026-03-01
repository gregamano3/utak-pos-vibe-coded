import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { getCurrentUser } from "@/app/lib/auth"
import { getSalesReportData } from "@/app/lib/reports"
import { formatCurrency } from "@/app/lib/currency"

const ALLOWED_ROLES = ["ADMIN", "MANAGER", "CASHIER"]

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")

  const from = fromParam ? new Date(fromParam) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const to = toParam ? new Date(toParam) : new Date()

  const data = await getSalesReportData(from, to)

  const wb = XLSX.utils.book_new()

  // Summary sheet
  const summaryData = [
    ["Sales Report Summary"],
    ["Period", `${from.toLocaleDateString()} - ${data.to.toLocaleDateString()}`],
    [],
    ["Total Sales", formatCurrency(data.totalSales)],
    ["Total Orders", data.totalOrders],
    ["Best Seller", data.bestSeller ? `${data.bestSeller.name} (${data.bestSeller.sold} units)` : "N/A"],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary")

  // Order history sheet
  const orderRows = [
    ["Order ID", "Date", "Time", "Items", "Total Amount", "Payment"],
    ...data.orders.map((o) => [
      o.id.slice(0, 8) + "...",
      o.createdAt.toLocaleDateString(),
      o.createdAt.toLocaleTimeString(),
      o.items.reduce((acc, i) => acc + i.quantity, 0),
      o.totalAmount,
      o.paymentMethod,
    ]),
  ]
  const wsOrders = XLSX.utils.aoa_to_sheet(orderRows)
  XLSX.utils.book_append_sheet(wb, wsOrders, "Order History")

  // Top products sheet
  const productRows = [
    ["Product", "Units Sold"],
    ...data.salesData.map((p) => [p.name, p.sold]),
  ]
  const wsProducts = XLSX.utils.aoa_to_sheet(productRows)
  XLSX.utils.book_append_sheet(wb, wsProducts, "Top Products")

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
  const filename = `sales-report-${from.toISOString().slice(0, 10)}-to-${data.to.toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
