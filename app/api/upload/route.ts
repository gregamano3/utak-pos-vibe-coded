import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import { getCurrentUser } from "@/app/lib/auth"
import { ensureUploadDir, getUploadDir } from "@/app/lib/upload"

const ALLOWED_ROLES = ["ADMIN", "MANAGER"]
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 })
  }

  const ext = path.extname(file.name) || ".jpg"
  const filename = `${crypto.randomUUID()}${ext}`
  ensureUploadDir()
  const dir = getUploadDir()
  const filepath = path.join(dir, filename)

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  fs.writeFileSync(filepath, buffer)

  const url = `/uploads/${filename}`
  return NextResponse.json({ url })
}
