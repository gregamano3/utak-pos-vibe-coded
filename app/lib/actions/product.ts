"use server"

import { prisma } from "../prisma"
import { revalidatePath } from "next/cache"

export async function createCategory(formData: FormData) {
    const name = formData.get("name") as string
    if (!name) return

    await prisma.category.create({
        data: { name }
    })

    revalidatePath("/products")
}

export async function createProduct(formData: FormData) {
    const name = formData.get("name") as string
    const priceStr = formData.get("price") as string
    const categoryId = formData.get("categoryId") as string

    if (!name || !priceStr || !categoryId) return

    await prisma.product.create({
        data: {
            name,
            price: parseFloat(priceStr),
            categoryId
        }
    })

    revalidatePath("/products")
}

export async function deleteCategory(id: string) {
    await prisma.category.delete({ where: { id } })
    revalidatePath("/products")
}

export async function deleteProduct(id: string) {
    await prisma.product.delete({ where: { id } })
    revalidatePath("/products")
}
