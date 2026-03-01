"use server"

import { prisma } from "../prisma"
import { revalidatePath } from "next/cache"

export async function checkoutOrder(
    items: { productId: string; quantity: number; price: number }[],
    totalAmount: number,
    paymentMethod: string = "CASH"
) {
    if (!items.length) return { success: false, error: "Cart is empty" }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create order
            await tx.order.create({
                data: {
                    totalAmount,
                    paymentMethod,
                    items: {
                        create: items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                }
            })

            // 2. Deduct inventory
            for (const item of items) {
                const productIngredients = await tx.productIngredient.findMany({
                    where: { productId: item.productId }
                })

                for (const recipe of productIngredients) {
                    const totalDeduction = recipe.quantity * item.quantity

                    await tx.inventory.update({
                        where: { ingredientId: recipe.ingredientId },
                        data: {
                            quantity: {
                                decrement: totalDeduction
                            }
                        }
                    })
                }
            }
        })

        revalidatePath("/pos")
        revalidatePath("/inventory")
        revalidatePath("/dashboard")
        revalidatePath("/reports")

        return { success: true }
    } catch (error) {
        console.error("Checkout failed:", error)
        return { success: false, error: "Checkout failed. Missing inventory record or stock." }
    }
}
