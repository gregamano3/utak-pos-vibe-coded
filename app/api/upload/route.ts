import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import sharp from "sharp"
import { getCurrentUser } from "@/app/lib/auth"
import { ensureUploadDir, getUploadDir } from "@/app/lib/upload"

const ALLOWED_ROLES = ["ADMIN", "MANAGER"]
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_WIDTH = 1200
const MAX_HEIGHT = 1200
const WEBP_QUALITY = 85

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
    return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 })
  }

  const filename = `${crypto.randomUUID()}.webp`
  ensureUploadDir()
  const dir = getUploadDir()
  const filepath = path.join(dir, filename)

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const resized = await sharp(buffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true, // Don't upscale small images
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()

    fs.writeFileSync(filepath, resized)
  } catch (err) {
    console.error("Image processing failed:", err)
    return NextResponse.json(
      { error: "Image processing failed. Please try another file." },
      { status: 500 }
    )
  }

  const url = `/uploads/${filename}`
  return NextResponse.json({ url })
}
