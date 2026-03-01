"use server"

import bcrypt from "bcryptjs"
import { prisma } from "../prisma"
import { checkoutItemsSchema, voidOrderSchema } from "../validations"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "../auth"
import { createAuditLog } from "../audit"

export async function checkoutOrder(
    items: { productId: string; quantity: number; price: number }[],
    totalAmount: number,
    paymentMethod: string = "CASH"
) {
    const parsed = checkoutItemsSchema.safeParse(items)
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid cart" }
    }

    try {
        const user = await getCurrentUser()
        let orderId: string | undefined
        const validItems = parsed.data

        await prisma.$transaction(async (tx) => {
            // 1. Create order
            const order = await tx.order.create({
                data: {
                    totalAmount,
                    paymentMethod,
                    userId: user?.id,
                    items: {
                        create: validItems.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                }
            })
            orderId = order.id

            // 2. Deduct inventory
            for (const item of validItems) {
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

        await createAuditLog({
            action: "ORDER_CREATED",
            entity: "order",
            entityId: orderId,
            details: JSON.stringify({ totalAmount, paymentMethod, itemCount: validItems.length }),
            userId: user?.id,
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

export async function voidOrder(orderId: string, password: string) {
    const user = await getCurrentUser()
    const allowed = ["ADMIN", "MANAGER", "CASHIER"]
    if (!user || !allowed.includes(user.role)) {
        return { success: false, error: "Unauthorized" }
    }
    const parsed = voidOrderSchema.safeParse({ orderId, password })
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
    }

    const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
    })
    if (!fullUser) return { success: false, error: "User not found" }

    const validPassword = await bcrypt.compare(password, fullUser.password)
    if (!validPassword) {
        return { success: false, error: "Incorrect password" }
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
    })
    if (!order) return { success: false, error: "Order not found" }
    if (order.status === "VOIDED") return { success: false, error: "Order is already voided" }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Restore inventory for each order item
            for (const item of order.items) {
                const productIngredients = await tx.productIngredient.findMany({
                    where: { productId: item.productId },
                })
                for (const recipe of productIngredients) {
                    const totalRestore = recipe.quantity * item.quantity
                    await tx.inventory.update({
                        where: { ingredientId: recipe.ingredientId },
                        data: { quantity: { increment: totalRestore } },
                    })
                }
            }
            // 2. Mark order as voided
            await tx.order.update({
                where: { id: orderId },
                data: { status: "VOIDED" },
            })
        })

        await createAuditLog({
            action: "ORDER_VOIDED",
            entity: "order",
            entityId: orderId,
            details: `Voided order ${orderId.slice(0, 8)}... total ${order.totalAmount}`,
            userId: user.id,
        })

        revalidatePath("/reports")
        revalidatePath("/dashboard")
        revalidatePath("/inventory")
        return { success: true }
    } catch (error) {
        console.error("Void order failed:", error)
        return { success: false, error: "Failed to void order" }
    }
}

export async function markOrderPrepared(orderId: string) {
    const user = await getCurrentUser()
    const allowed = ["ADMIN", "MANAGER", "KITCHEN"]
    if (!user || !allowed.includes(user.role)) {
        return { success: false, error: "Unauthorized" }
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return { success: false, error: "Order not found" }
    if (order.status === "VOIDED") return { success: false, error: "Order is voided" }
    if (order.preparedAt) return { success: true } // Already marked

    await prisma.order.update({
        where: { id: orderId },
        data: { preparedAt: new Date() },
    })

    revalidatePath("/kitchen")
    return { success: true }
}
