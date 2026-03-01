import { prisma } from "@/app/lib/prisma"
import { PosTerminal } from "./PosTerminal"

export default async function PosPage() {
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
