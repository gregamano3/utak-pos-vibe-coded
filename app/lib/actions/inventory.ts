"use server"

import { prisma } from "../prisma"
import { revalidatePath } from "next/cache"

export async function createIngredient(formData: FormData) {
    const name = formData.get("name") as string
    const unit = formData.get("unit") as string

    if (!name || !unit) return

    await prisma.ingredient.create({
        data: { name, unit }
    })

    revalidatePath("/inventory")
}

export async function deleteIngredient(id: string) {
    await prisma.ingredient.delete({ where: { id } })
    revalidatePath("/inventory")
}

export async function updateInventory(formData: FormData) {
    const ingredientId = formData.get("ingredientId") as string
    const quantityStr = formData.get("quantity") as string

    if (!ingredientId || !quantityStr) return

    await prisma.inventory.upsert({
        where: { ingredientId },
        create: { ingredientId, quantity: parseFloat(quantityStr) },
        update: { quantity: parseFloat(quantityStr) }
    })

    revalidatePath("/inventory")
}

export async function addRecipeIngredient(formData: FormData) {
    const productId = formData.get("productId") as string
    const ingredientId = formData.get("ingredientId") as string
    const quantityStr = formData.get("quantity") as string

    if (!productId || !ingredientId || !quantityStr) return

    try {
        await prisma.productIngredient.create({
            data: {
                productId,
                ingredientId,
                quantity: parseFloat(quantityStr)
            }
        })
    } catch (error) {
        // Ignore duplicate inserts due to unique constraint
    }

    revalidatePath("/inventory")
}

export async function deleteRecipeIngredient(id: string) {
    await prisma.productIngredient.delete({ where: { id } })
    revalidatePath("/inventory")
}
