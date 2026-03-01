/**
 * Daily demo reset: clears all data and re-seeds with demo content.
 * Used by the midnight cron job and optionally by /api/cron/daily-reset.
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function runDemoReset(): Promise<void> {
  // 1. Clear existing data (respect FK order)
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.productIngredient.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.ingredient.deleteMany()
  await prisma.user.deleteMany()

  // 2. Create demo users
  const hashedPassword = await bcrypt.hash("password123", 10)

  const admin = await prisma.user.create({
    data: { username: "admin", password: hashedPassword, role: "ADMIN", pin: "1111" },
  })
  const manager = await prisma.user.create({
    data: { username: "manager", password: hashedPassword, role: "MANAGER", pin: "2222" },
  })
  const cashier = await prisma.user.create({
    data: { username: "cashier", password: hashedPassword, role: "CASHIER", pin: "3333" },
  })
  const kitchen = await prisma.user.create({
    data: { username: "kitchen", password: hashedPassword, role: "KITCHEN", pin: "4444" },
  })
  await prisma.user.create({
    data: { username: "staff", password: hashedPassword, role: "STAFF", pin: "5555" },
  })

  // 3. Categories
  const catCoffee = await prisma.category.create({ data: { name: "Coffee" } })
  const catPastries = await prisma.category.create({ data: { name: "Pastries" } })
  const catDrinks = await prisma.category.create({ data: { name: "Cold Drinks" } })

  // 4. Ingredients & inventory
  const coffeeBeans = await prisma.ingredient.create({ data: { name: "Coffee Beans", unit: "g" } })
  const milk = await prisma.ingredient.create({ data: { name: "Whole Milk", unit: "ml" } })
  const syrup = await prisma.ingredient.create({ data: { name: "Vanilla Syrup", unit: "ml" } })
  const flour = await prisma.ingredient.create({ data: { name: "Flour", unit: "g" } })
  const sugar = await prisma.ingredient.create({ data: { name: "Sugar", unit: "g" } })

  await prisma.inventory.createMany({
    data: [
      { ingredientId: coffeeBeans.id, quantity: 5000 },
      { ingredientId: milk.id, quantity: 10000 },
      { ingredientId: syrup.id, quantity: 1000 },
      { ingredientId: flour.id, quantity: 20000 },
      { ingredientId: sugar.id, quantity: 15000 },
    ],
  })

  // 5. Products & recipes
  const espresso = await prisma.product.create({
    data: {
      name: "Espresso",
      price: 3.5,
      categoryId: catCoffee.id,
      ingredients: {
        create: [{ ingredientId: coffeeBeans.id, quantity: 18 }],
      },
    },
  })

  const latte = await prisma.product.create({
    data: {
      name: "Vanilla Latte",
      price: 5.5,
      categoryId: catCoffee.id,
      ingredients: {
        create: [
          { ingredientId: coffeeBeans.id, quantity: 18 },
          { ingredientId: milk.id, quantity: 200 },
          { ingredientId: syrup.id, quantity: 15 },
        ],
      },
    },
  })

  const croissant = await prisma.product.create({
    data: {
      name: "Butter Croissant",
      price: 4,
      categoryId: catPastries.id,
    },
  })

  await prisma.product.create({
    data: {
      name: "Iced Lemon Tea",
      price: 3,
      categoryId: catDrinks.id,
      ingredients: {
        create: [{ ingredientId: sugar.id, quantity: 30 }],
      },
    },
  })

  // 6. Sample orders
  await prisma.order.create({
    data: {
      totalAmount: 11,
      paymentMethod: "CASH",
      userId: cashier.id,
      items: {
        create: [{ productId: latte.id, quantity: 2, price: 5.5 }],
      },
    },
  })

  await prisma.order.create({
    data: {
      totalAmount: 7.5,
      paymentMethod: "CASH",
      userId: manager.id,
      items: {
        create: [
          { productId: espresso.id, quantity: 1, price: 3.5 },
          { productId: croissant.id, quantity: 1, price: 4 },
        ],
      },
    },
  })
}
