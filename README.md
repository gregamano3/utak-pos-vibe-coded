# Utak POS

A Point-of-Sale (POS) and inventory management system for restaurants. Built with Next.js 16, PostgreSQL, and Prisma. Supports role-based access, product catalog, order management, inventory tracking, sales reporting, and staff management.

---

## What This App Does

**Utak POS** is a full-stack restaurant POS that enables:

- **Point of Sale (POS)** — Create orders, add products, adjust quantities, record payments (cash), and complete checkouts
- **Product Catalog** — Manage categories and products with names, prices, and images
- **Recipe & Inventory** — Map products to ingredients (recipes), track stock, and auto-deduct on sale
- **Menu & Recipe Costing** — View product costs based on ingredient usage
- **Sales Reports** — Filter by date range, view totals, order history, and export to PDF/Excel
- **Kitchen Display** — View today's orders for preparation
- **Staff & Shifts** — User management, roles, and shift tracking (Admin only)
- **User Settings** — Create/edit users and roles (Admin only)

---

## Implemented Features

| Feature | Description |
|--------|-------------|
| **Authentication** | Login with bcrypt-hashed passwords, session via cookie |
| **Role-Based Access (RBAC)** | 5 roles: Admin, Manager, Cashier, Kitchen, Staff — each with route-level permissions |
| **POS Terminal** | Category filters, search, cart with qty adjustment, order types (Dine-in/Takeout/Delivery) |
| **Products** | Create, edit, delete products; categories; optional image upload |
| **Inventory** | Add ingredients, track quantity, update stock; recipe mapping per product |
| **Order Checkout** | Records order, deducts ingredients per recipe, links to user |
| **Dashboard** | Today's sales, net profit, order count, low stock, top-selling products |
| **Reports** | Date filter, total sales/orders, best seller, order history |
| **Report Export** | Download PDF or Excel with summary, orders, and top products |
| **Kitchen** | Today's orders grouped by order ID |
| **Menu/Recipe Costing** | Product cost breakdown based on ingredient usage |
| **Staff Management** | User list, create/edit users, assign roles |
| **Theme Toggle** | Light/dark mode via `next-themes` |
| **Currency** | Philippine Peso (₱) formatting |
| **Image Upload** | Product images (JPEG, PNG, WebP, GIF, max 5MB) |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Styling:** Tailwind CSS v4
- **Auth:** Cookie-based session, bcrypt
- **Icons:** Lucide React
- **Reports:** jsPDF, jspdf-autotable, write-excel-file
- **Deployment:** Docker (standalone output)

---

## Practices & Standards

### Code Structure

- **App Router** — Routes under `app/(main)/` with shared layout
- **Server Components** — Default; client components only when needed (forms, state)
- **Server Actions** — Form handling via `"use server"` in `app/lib/actions/`
- **Flat structure** — No deep domain layers, no repository pattern
- **Shared utilities** — `app/lib/` for auth, currency, RBAC, upload, reports

### Naming & Conventions

- Clear, descriptive function and variable names
- TypeScript for type safety
- Consistent file layout: imports, types, component, export

### Database

- 9 tables (within scope): User, Category, Product, Ingredient, ProductIngredient, Inventory, Order, OrderItem, Shift
- UUIDs for primary keys
- Cascade deletes where appropriate (e.g. ProductIngredient on product delete)

### UI

- Tailwind utility classes
- Responsive layout
- Accessible markup (labels, ARIA where relevant)
- No heavy design systems; clean and usable UI

---

## Security

### Authentication

- **Passwords:** Hashed with bcrypt (cost factor 10)
- **Session:** `auth_token` cookie stores user ID (no JWT)
- **Logout:** `/api/auth/clear` clears cookie and redirects to login

### Authorization

- **Middleware:** Protects routes; unauthenticated users redirect to `/login`
- **RBAC:** `requireRole()` on pages; API routes validate role before actions
- **Route matrix:**
  - Dashboard, POS: Admin, Manager, Staff, Cashier
  - Products, Menu, Inventory, Reports: role-specific
  - Staff, Settings: Admin only

### HTTP Headers

- **Strict-Transport-Security** — HSTS for HTTPS
- **X-Frame-Options:** SAMEORIGIN
- **X-Content-Type-Options:** nosniff
- **X-XSS-Protection:** 1; mode=block
- **Content-Security-Policy** — Restricts script, style, img, font sources

### API Security

- **Upload API:** Role check (Admin/Manager), file type whitelist, 5MB limit
- **Report Export:** Role check (Admin, Manager, Cashier)
- **Auth Clear:** No auth needed (logout helper)

### Data

- `.env` and `prisma/seed.ts` in `.gitignore` to avoid committing secrets/seeds
- `public/uploads` ignored — uploads stored outside repo

### Recommendations for Production

- Use HTTPS
- Set `Secure` and `HttpOnly` on auth cookie
- Rotate database credentials
- Consider rate limiting on login and upload

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- npm or pnpm

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL to your PostgreSQL connection string

# Initialize database
npx prisma migrate dev

# Seed with demo data (optional)
cp prisma/seed.example.ts prisma/seed.ts   # if seed.ts is gitignored
npm run seed
```

### Demo Accounts

After seeding, use:

| Username | Password | Role |
|----------|----------|------|
| admin    | password123 | Admin |
| manager  | password123 | Manager |
| cashier  | password123 | Cashier |
| kitchen  | password123 | Kitchen |
| staff    | password123 | Staff |

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Docker

### Build & Run

```bash
docker-compose up -d
```

- **App:** http://localhost:3000  
- **PostgreSQL:** localhost:5432 (user: root, db: utak_pos)

### Volumes

- `db_data` — PostgreSQL data
- `uploads_data` — Product images (mounted at `/app/public/uploads`)

### Environment

Override `DATABASE_URL` in `docker-compose.yml` for production.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database (creates `prisma/seed.ts` from example if missing) |
| `npm run seed:init` | Reset seed from `prisma/seed.example.ts` |

---

## Project Structure

```
app/
├── (main)/           # Protected routes
│   ├── dashboard/
│   ├── pos/
│   ├── products/
│   ├── inventory/
│   ├── menu/
│   ├── reports/
│   ├── kitchen/
│   ├── staff/
│   └── settings/
├── api/              # Route handlers
│   ├── auth/clear/
│   ├── upload/
│   └── reports/export/
├── components/
├── lib/              # Auth, actions, utilities
│   └── actions/
├── login/
└── providers/
prisma/
├── schema.prisma
├── seed.example.ts   # Template (committed)
└── seed.ts           # Local seed (gitignored)
```

---

## License

Private. For internal or evaluation use.
