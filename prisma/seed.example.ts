/**
 * PLACEHOLDER / DEMO DATA - For development only.
 * Copy this file to prisma/seed.ts to customize locally.
 * seed.ts is gitignored so your data stays private.
 *
 * Quick login: admin, manager, cashier, kitchen, staff
 * Password for all: password123
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // 1. Clear existing data (optional, but good for pure seed)
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.shift.deleteMany()
    await prisma.inventory.deleteMany()
    await prisma.productIngredient.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.ingredient.deleteMany()
    await prisma.user.deleteMany()

    // 2. Create Demo Users (placeholder credentials)
    const hashedPassword = await bcrypt.hash('password123', 10)

    const admin = await prisma.user.create({
        data: { username: 'admin', password: hashedPassword, role: 'ADMIN', pin: '1111' }
    })

    const manager = await prisma.user.create({
        data: { username: 'manager', password: hashedPassword, role: 'MANAGER', pin: '2222' }
    })

    const cashier = await prisma.user.create({
        data: { username: 'cashier', password: hashedPassword, role: 'CASHIER', pin: '3333' }
    })

    const kitchen = await prisma.user.create({
        data: { username: 'kitchen', password: hashedPassword, role: 'KITCHEN', pin: '4444' }
    })

    await prisma.user.create({
        data: { username: 'staff', password: hashedPassword, role: 'STAFF', pin: '5555' }
    })

    console.log('Created Demo Users: admin, manager, cashier, kitchen, staff (password123 for all)')

    // 3. Create Categories (placeholder)
    const catCoffee = await prisma.category.create({ data: { name: 'Coffee' } })
    const catPastries = await prisma.category.create({ data: { name: 'Pastries' } })
    const catDrinks = await prisma.category.create({ data: { name: 'Cold Drinks' } })
    console.log('Created Categories')

    // 4. Create Ingredients & Inventory (placeholder)
    const coffeeBeans = await prisma.ingredient.create({ data: { name: 'Coffee Beans', unit: 'g' } })
    const milk = await prisma.ingredient.create({ data: { name: 'Whole Milk', unit: 'ml' } })
    const syrup = await prisma.ingredient.create({ data: { name: 'Vanilla Syrup', unit: 'ml' } })
    const flour = await prisma.ingredient.create({ data: { name: 'Flour', unit: 'g' } })
    const sugar = await prisma.ingredient.create({ data: { name: 'Sugar', unit: 'g' } })

    await prisma.inventory.createMany({
        data: [
            { ingredientId: coffeeBeans.id, quantity: 5000 },
            { ingredientId: milk.id, quantity: 10000 },
            { ingredientId: syrup.id, quantity: 1000 },
            { ingredientId: flour.id, quantity: 20000 },
            { ingredientId: sugar.id, quantity: 15000 },
        ]
    })
    console.log('Created Ingredients & Inventory Stock')

    // 5. Create Products & Recipes (placeholder)
    const espresso = await prisma.product.create({
        data: {
            name: 'Espresso',
            price: 3.50,
            categoryId: catCoffee.id,
            ingredients: {
                create: [{ ingredientId: coffeeBeans.id, quantity: 18 }]
            }
        }
    })

    const latte = await prisma.product.create({
        data: {
            name: 'Vanilla Latte',
            price: 5.50,
            categoryId: catCoffee.id,
            ingredients: {
                create: [
                    { ingredientId: coffeeBeans.id, quantity: 18 },
                    { ingredientId: milk.id, quantity: 200 },
                    { ingredientId: syrup.id, quantity: 15 }
                ]
            }
        }
    })

    const croissant = await prisma.product.create({
        data: {
            name: 'Butter Croissant',
            price: 4.00,
            categoryId: catPastries.id
        }
    })

    const icedTea = await prisma.product.create({
        data: {
            name: 'Iced Lemon Tea',
            price: 3.00,
            categoryId: catDrinks.id,
            ingredients: {
                create: [{ ingredientId: sugar.id, quantity: 30 }]
            }
        }
    })

    console.log('Created Products & Recipes')

    // 6. Sample orders (placeholder)
    console.log('Creating sample orders...')

    await prisma.order.create({
        data: {
            totalAmount: 11.00,
            paymentMethod: 'CASH',
            userId: cashier.id,
            items: {
                create: [{ productId: latte.id, quantity: 2, price: 5.50 }]
            }
        }
    })

    await prisma.order.create({
        data: {
            totalAmount: 7.50,
            paymentMethod: 'CASH',
            userId: manager.id,
            items: {
                create: [
                    { productId: espresso.id, quantity: 1, price: 3.50 },
                    { productId: croissant.id, quantity: 1, price: 4.00 }
                ]
            }
        }
    })

    console.log('Seeding complete! ✨')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
