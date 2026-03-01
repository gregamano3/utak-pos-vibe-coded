import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import { getUploadDir } from "@/app/lib/upload"

/**
 * Serves uploaded product images from the uploads directory.
 * Added to debug 404s: logs each request and whether file exists.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path: pathSegments } = await params
  const filename = pathSegments?.join("/")

  console.log("[uploads] GET request:", { pathSegments, filename, url: request.url })

  if (!filename || pathSegments?.length !== 1) {
    console.log("[uploads] 400: invalid path")
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Prevent path traversal (e.g. ../etc/passwd)
  if (filename.includes("..") || path.isAbsolute(filename)) {
    console.log("[uploads] 400: path traversal attempt")
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const uploadDir = getUploadDir()
  const filepath = path.join(uploadDir, filename)

  console.log("[uploads] Looking for file:", {
    uploadDir,
    filepath,
    exists: fs.existsSync(filepath),
  })

  if (!fs.existsSync(filepath)) {
    console.log("[uploads] 404: file not found")
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const content = fs.readFileSync(filepath)
    return new NextResponse(content, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (err) {
    console.error("[uploads] Error reading file:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
