"use server"

import { prisma } from "../prisma"
import { revalidatePath } from "next/cache"
import { categorySchema, productSchema } from "../validations"

export async function createCategory(formData: FormData) {
    const parsed = categorySchema.safeParse({ name: formData.get("name") })
    if (!parsed.success) return
    await prisma.category.create({ data: parsed.data })
    revalidatePath("/products")
}

export async function createProduct(formData: FormData) {
    const raw = {
        name: formData.get("name"),
        price: formData.get("price"),
        categoryId: formData.get("categoryId"),
        imageUrl: formData.get("imageUrl") || "",
    }
    const parsed = productSchema.safeParse(raw)
    if (!parsed.success) return
    await prisma.product.create({
        data: {
            name: parsed.data.name,
            price: parsed.data.price,
            categoryId: parsed.data.categoryId,
            imageUrl: parsed.data.imageUrl,
        },
    })
    revalidatePath("/products")
}

export async function deleteCategory(id: string) {
    if (!id || typeof id !== "string") return
    await prisma.category.delete({ where: { id } })
    revalidatePath("/products")
}

export async function updateProduct(id: string, formData: FormData) {
    if (!id || typeof id !== "string") return
    const raw = {
        name: formData.get("name"),
        price: formData.get("price"),
        categoryId: formData.get("categoryId"),
        imageUrl: formData.get("imageUrl") || "",
    }
    const parsed = productSchema.safeParse(raw)
    if (!parsed.success) return
    await prisma.product.update({
        where: { id },
        data: {
            name: parsed.data.name,
            price: parsed.data.price,
            categoryId: parsed.data.categoryId,
            imageUrl: parsed.data.imageUrl,
        },
    })
    revalidatePath("/products")
}

export async function deleteProduct(id: string) {
    if (!id || typeof id !== "string") return
    await prisma.product.delete({ where: { id } })
    revalidatePath("/products")
}
