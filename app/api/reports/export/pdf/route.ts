import { NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
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

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Title
  doc.setFontSize(20)
  doc.text("Sales Report", pageWidth / 2, 20, { align: "center" })
  doc.setFontSize(10)
  doc.text(
    `Period: ${from.toLocaleDateString()} - ${data.to.toLocaleDateString()}`,
    pageWidth / 2,
    28,
    { align: "center" }
  )

  // Summary
  doc.setFontSize(12)
  doc.text("Summary", 14, 42)
  doc.setFontSize(10)
  doc.text(`Total Sales: ${formatCurrency(data.totalSales)}`, 14, 50)
  doc.text(`Total Orders: ${data.totalOrders}`, 14, 56)
  doc.text(
    `Best Seller: ${data.bestSeller ? `${data.bestSeller.name} (${data.bestSeller.sold} units)` : "N/A"}`,
    14,
    62
  )

  // Order history table
  const orderTableData = data.orders.map((o) => [
    o.id.slice(0, 8) + "...",
    o.createdAt.toLocaleDateString(),
    o.createdAt.toLocaleTimeString(),
    String(o.items.reduce((acc, i) => acc + i.quantity, 0)),
    formatCurrency(o.totalAmount),
    o.paymentMethod,
  ])

  autoTable(doc, {
    startY: 72,
    head: [["Order ID", "Date", "Time", "Items", "Total", "Payment"]],
    body: orderTableData.length > 0 ? orderTableData : [["No orders in this period"]],
    theme: "striped",
    headStyles: { fillColor: [99, 102, 241] },
    margin: { left: 14, right: 14 },
  })

  const filename = `sales-report-${from.toISOString().slice(0, 10)}-to-${data.to.toISOString().slice(0, 10)}.pdf`
  const buffer = Buffer.from(doc.output("arraybuffer"))

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
