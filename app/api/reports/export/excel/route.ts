import { NextRequest, NextResponse } from "next/server"
import writeXlsxFile from "write-excel-file/node"
import { getCurrentUser } from "@/app/lib/auth"
import { getSalesReportData } from "@/app/lib/reports"
import { reportQuerySchema } from "@/app/lib/validations"
import { formatCurrency } from "@/app/lib/currency"

const ALLOWED_ROLES = ["ADMIN", "MANAGER", "CASHIER"]

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = reportQuerySchema.safeParse({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  })
  const fromParam = query.success ? query.data.from : null
  const toParam = query.success ? query.data.to : null
  const from = fromParam ? new Date(fromParam) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const to = toParam ? new Date(toParam) : new Date()

  const data = await getSalesReportData(from, to)

  // Summary sheet
  const summaryData: (string | number)[][] = [
    ["Sales Report Summary"],
    ["Period", `${from.toLocaleDateString()} - ${data.to.toLocaleDateString()}`],
    [],
    ["Total Sales", formatCurrency(data.totalSales)],
    ["Total Orders", data.totalOrders],
    ["Best Seller", data.bestSeller ? `${data.bestSeller.name} (${data.bestSeller.sold} units)` : "N/A"],
  ]

  // Order history sheet
  const orderRows: (string | number)[][] = [
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

  // Top products sheet
  const productRows: (string | number)[][] = [
    ["Product", "Units Sold"],
    ...data.salesData.map((p) => [p.name, p.sold]),
  ]

  const buffer = await writeXlsxFile(
    [summaryData, orderRows, productRows],
    {
      sheets: ["Summary", "Order History", "Top Products"],
      buffer: true,
    }
  )
  const filename = `sales-report-${from.toISOString().slice(0, 10)}-to-${data.to.toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
