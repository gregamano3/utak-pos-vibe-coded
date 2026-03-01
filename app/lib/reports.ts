import { prisma } from "./prisma"

export async function getSalesReportData(from: Date, to: Date) {
  const toEnd = new Date(to)
  toEnd.setHours(23, 59, 59, 999)

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: from, lte: toEnd },
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  })

  const activeOrders = orders.filter((o) => o.status !== "VOIDED")
  const totalSales = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0)
  const totalOrders = activeOrders.length

  const productCounts: Record<string, number> = {}
  activeOrders.forEach((order) => {
    order.items.forEach((item) => {
      productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity
    })
  })

  const productIds = Object.keys(productCounts)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })

  const salesData = products
    .map((p) => ({
      name: p.name,
      sold: productCounts[p.id],
    }))
    .sort((a, b) => b.sold - a.sold)
  const bestSeller = salesData[0]

  return {
    from,
    to: toEnd,
    orders: activeOrders, // Exclude voided for exports (PDF/Excel)
    totalSales,
    totalOrders,
    bestSeller,
    salesData,
  }
}
