"use server"

import { prisma } from "../prisma"
import { revalidatePath } from "next/cache"
import { ingredientSchema, inventoryUpdateSchema, recipeIngredientSchema } from "../validations"

export async function createIngredient(formData: FormData) {
    const raw = {
        name: formData.get("name"),
        unit: formData.get("unit"),
    }
    const parsed = ingredientSchema.safeParse(raw)
    if (!parsed.success) return

    await prisma.ingredient.create({
        data: parsed.data,
    })
    revalidatePath("/inventory")
}

export async function deleteIngredient(id: string) {
    if (!id || typeof id !== "string") return
    await prisma.ingredient.delete({ where: { id } })
    revalidatePath("/inventory")
}

export async function updateInventory(formData: FormData) {
    const raw = {
        ingredientId: formData.get("ingredientId"),
        quantity: formData.get("quantity"),
        batchNumber: formData.get("batchNumber") ?? "",
        expiresAt: formData.get("expiresAt") ?? "",
    }
    const parsed = inventoryUpdateSchema.safeParse(raw)
    if (!parsed.success) return

    const { ingredientId, quantity, batchNumber, expiresAt } = parsed.data
    await prisma.inventory.upsert({
        where: { ingredientId },
        create: { ingredientId, quantity, batchNumber, expiresAt },
        update: { quantity, batchNumber, expiresAt },
    })
    revalidatePath("/inventory")
}

export async function addRecipeIngredient(formData: FormData) {
    const raw = {
        productId: formData.get("productId"),
        ingredientId: formData.get("ingredientId"),
        quantity: formData.get("quantity"),
    }
    const parsed = recipeIngredientSchema.safeParse(raw)
    if (!parsed.success) return

    try {
        await prisma.productIngredient.create({
            data: parsed.data,
        })
    } catch {
        // Ignore duplicate inserts due to unique constraint
    }
    revalidatePath("/inventory")
}

export async function deleteRecipeIngredient(id: string) {
    if (!id || typeof id !== "string") return
    await prisma.productIngredient.delete({ where: { id } })
    revalidatePath("/inventory")
}
