# MVP CONSTRAINT BLUEPRINT
**Project:** Restaurant POS + Inventory System
**Purpose:** MVP

## Core Objective Rule
The goal is to demonstrate a working POS + Inventory system, not to build a production SaaS.
Prioritize clarity, functionality, and simplicity over scalability and completeness.

## Hard Scope Limit
The system must include ONLY:
- POS screen (create order, add items, calculate total, record payment)
- Basic product management
- Basic inventory tracking (deduct stock when item is sold)
- Simple dashboard (today’s sales, total revenue, low stock list)
- Basic sales report (filter by date range)

Everything else is **out of scope**.
**No:**
- Multi-branch
- Multi-tenant
- Advanced accounting
- AI forecasting
- Supplier management
- Staff roles beyond basic login
- Kitchen display system
- Offline sync engine

## Technology Lock Rule
Stack is fixed:
- Next.js (App Router)
- PostgreSQL
- Prisma ORM
- Server Actions or Route Handlers
- No additional backend framework

**Do not introduce:**
- Microservices
- Separate API servers
- Message queues
- Redis
- WebSockets
- Background workers

## Database Table Limit
Maximum 8 tables.
**Recommended structure:**
1. User
2. Product
3. Category
4. Ingredient
5. ProductIngredient (recipe mapping)
6. Inventory
7. Order
8. OrderItem

Do not exceed this unless absolutely required.

## File Structure Simplicity Rule
Keep structure flat and readable.
**Example:**
`/app`
`/pos`
`/dashboard`
`/products`
`/reports`
`/lib`
`/prisma`

- No deep nested domain layers.
- No repository pattern.
- No service abstraction layers unless very small.

## Feature Depth Limitation
**POS must support:**
- Add/remove items
- Quantity adjustment
- Total calculation
- Record payment (cash only is acceptable)
- Save order

**Inventory must:**
- Deduct ingredient quantity when order is saved
- Show low stock flag

**No:**
- Split bills
- Discounts
- E-wallet integration
- Tax engine
- Refund system
- Partial payments

## UI Constraint Rule
Use simple Tailwind or basic styling.
**No:**
- Complex animations
- Advanced design systems
- Custom component libraries
- Drag-and-drop builders

**UI goal:** clean and usable, not beautiful.

## Performance Rule
Assume:
- Single restaurant
- Fewer than 200 products
- Fewer than 50 daily orders

Do not optimize for large-scale traffic. No caching layers.

## Reporting Rule
Reports only need:
- Total sales by date range
- Total number of orders
- Best-selling product (simple count)

**No charts required** (unless easy to add). Tables are acceptable.

## Authentication Rule
Simple login only.
**No:**
- OAuth
- Multi-role permissions
- Complex access control
- Password reset flows (unless required)

## Time Budget Rule
Design the system so it can be completed in **2–4 weeks maximum**.
If a feature would significantly increase development time, remove or simplify it.

## Code Quality Rule (For Exam)
- Clear naming
- Simple functions
- No unnecessary abstractions
- Comments explaining business logic
- Easy to explain during defense
- You must be able to explain every table and feature in under 2 minutes.

## Final Guardrail Rule
If a feature does not directly help demonstrate:
- Order creation
- Inventory deduction
- Sales reporting
Do not implement it.
