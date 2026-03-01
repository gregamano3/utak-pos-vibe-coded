import path from "path"
import fs from "fs"

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads")

// Log upload dir at module load (helps debug path issues)
if (typeof process !== "undefined") {
  console.log("[upload] UPLOAD_DIR:", UPLOAD_DIR, "cwd:", process.cwd())
}

export function getUploadDir(): string {
  return UPLOAD_DIR
}

export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}
