import { prisma } from "@/app/lib/prisma"
import { PosTerminal } from "./PosTerminal"
import { requireRole } from "@/app/lib/auth"

export default async function PosPage() {
    await requireRole(["ADMIN", "MANAGER", "STAFF", "CASHIER"]);
    const categories = await prisma.category.findMany({
        include: { products: true },
        orderBy: { name: 'asc' }
    })

    const allProducts = categories.flatMap(c => c.products)

    return (
        <div className="h-full">
            <PosTerminal categories={categories} allProducts={allProducts} />
        </div>
    )
}
