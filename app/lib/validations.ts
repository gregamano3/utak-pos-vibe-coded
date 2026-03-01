import { z } from "zod"

// Image upload
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"]
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MIN_IMAGE_SIZE = 100 // 100 bytes - reject empty/corrupt

export const imageUploadSchema = z.object({
  file: z.instanceof(File, { message: "File is required" }),
})
  .refine((f) => f.file.size <= MAX_IMAGE_SIZE, {
    message: `File too large. Max ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`,
  })
  .refine((f) => f.file.size >= MIN_IMAGE_SIZE, {
    message: "File appears empty or corrupt.",
  })
  .refine((f) => ALLOWED_IMAGE_TYPES.includes(f.file.type), {
    message: "Invalid file type. Use JPEG, PNG, WebP, or GIF.",
  })
  .refine((f) => {
    const ext = "." + (f.file.name.split(".").pop() || "").toLowerCase()
    return ALLOWED_EXTENSIONS.includes(ext)
  }, {
    message: "Invalid file extension.",
  })

// Category
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").trim(),
})

// Product
export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long").trim(),
  price: z.coerce.number().positive("Price must be positive"),
  categoryId: z.string().uuid("Invalid category"),
  imageUrl: z.string().max(500).optional().nullable().or(z.literal("")),
}).transform((d) => ({ ...d, imageUrl: d.imageUrl?.trim() || undefined }))

// User
export const userCreateSchema = z.object({
  username: z.string().min(1, "Username required").max(50).trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER", "KITCHEN", "STAFF"]),
  pin: z.string().max(4).optional().nullable().transform((v) => v || null),
})

export const userUpdateSchema = z.object({
  username: z.string().min(1, "Username required").max(50).trim(),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER", "KITCHEN", "STAFF"]),
  pin: z.string().max(4).optional().nullable().transform((v) => v || null),
  newPassword: z.string().min(6).optional().or(z.literal("")),
})

// Inventory
export const ingredientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  unit: z.enum(["g", "ml", "pcs"], { error: "Select a unit" }),
})

export const inventoryUpdateSchema = z.object({
  ingredientId: z.string().uuid("Invalid ingredient"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  batchNumber: z.string().max(100).optional().nullable().or(z.literal("")).transform((v) => (v && v.trim()) || null),
  expiresAt: z.string().optional().or(z.literal("")).transform((v) => (v && v.trim() ? new Date(v) : null)),
})

export const recipeIngredientSchema = z.object({
  productId: z.string().uuid("Invalid product"),
  ingredientId: z.string().uuid("Invalid ingredient"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
})

// Order
export const checkoutItemsSchema = z.array(z.object({
  productId: z.string().uuid("Invalid product"),
  quantity: z.number().int().positive("Invalid quantity"),
  price: z.number().nonnegative("Invalid price"),
})).min(1, "Cart is empty")

export const voidOrderSchema = z.object({
  orderId: z.string().uuid("Invalid order"),
  password: z.string().min(1, "Password required"),
})

// Report export query params (date strings YYYY-MM-DD)
export const reportQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

// Audit query
export const auditQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  action: z.string().optional(),
})
