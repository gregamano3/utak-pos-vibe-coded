# Restaurant POS + Inventory System Plan

## 1. Product Perspective (Merchant Pain Points)
Merchants in small cafes/restaurants usually struggle with:
1. **Slow Checkout / Clunky POS:** They need a fast, intuitive way to punch in orders. The POS screen must clearly show items, quantities, and a quick "Pay Cash" flow.
2. **Hidden Stock Discrepancies:** Running out of an ingredient mid-service is a nightmare. They need automatic deduction of ingredients when a product is sold, and a clear "Low Stock" indicator on the dashboard.
3. **End-of-Day Reconciliation:** Calculating the day's total accurately. They need a simple, clear report of today's sales and total orders to match against the cash drawer.
4. **Complexity:** Existing systems have too many features. They just want a simple login, and immediate access to selling and tracking without convoluted training.

These correspond exactly with the constraints laid out in your [MVP_RULES.md](file:///c:/Dev/utak-pos/utak-pos-vibe-coded/MVP_RULES.md).

## 2. Technical Architecture & Constraints
Based on the rules, we will adhere strictly to a lightweight stack:
- **Framework:** Next.js (App Router) using Server Actions.
- **Database:** PostgreSQL (Neon connection) accessed via Prisma ORM.
- **Deployment:** Self-hosted using Docker. A `Dockerfile` and `docker-compose.yml` will be provided for seamless setup. 

## 3. Database Schema (Strict 8-Table Limit)
1. `User`: Simple authentication.
2. `Product`: Items sold to customers (e.g., "Latte").
3. `Category`: Groupings for products (e.g., "Coffee").
4. `Ingredient`: Raw materials tracked in inventory (e.g., "Coffee Beans", "Milk").
5. `ProductIngredient`: Mapping a product to its ingredients (Recipe).
6. `Inventory`: Current stock levels for ingredients.
7. `Order`: Transaction record.
8. `OrderItem`: Specific products within an order.

## 4. Proposed File Structure
Keeping it flat and domain-driven to optimize for your review constraints:
- `/app/pos` - Point of Sale UI
- `/app/dashboard` - Overview & Low Stock
- `/app/products` - Manage products and categories
- `/app/inventory` - Manage ingredients and stock
- `/app/reports` - Simple sales reporting
- `/lib` - Reusable server actions and helpers
- `/prisma/schema.prisma` - DB schema definition
- `Dockerfile` - Next.js containerization setup
- `docker-compose.yml` - App + PGDB configuration

## 5. Implementation Phases
1. **Infrastructure:** Write `Dockerfile`, `docker-compose.yml`, and `schema.prisma`.
2. **Setup:** Scaffold basic UI layout (Sidebar + Main content view) with basic Tailwind.
3. **Inventory & Products:** Build UI/actions for handling categories, products, ingredients, and recipes.
4. **POS Core:** Build the register (click to add, quantity adjust, submit order, automatically deduct inventory based on recipe).
5. **Dashboard, Reports & Auth:** Build simple login, today's metrics, low stock UI module, and basic reports page.

## User Review Required
- Please review this plan to verify it satisfies your requirements and stays within the 2-4 week time budget bounds you set.
- Let me know if you are ready to proceed with **Phase 1: Infrastructure**, where we will create the Dockerfile, docker-compose configuration, and Prisma schema.
