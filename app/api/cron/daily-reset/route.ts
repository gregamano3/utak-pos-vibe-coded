import { NextRequest, NextResponse } from "next/server"
import { runDemoReset } from "@/app/lib/demo-reset"

/**
 * POST /api/cron/daily-reset
 * Triggers a full demo reset. Protected by CRON_SECRET header.
 * Use with external cron (e.g. cron-job.org) if you prefer over built-in instrumentation.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret") ?? request.nextUrl.searchParams.get("secret")
  const expected = process.env.CRON_SECRET
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await runDemoReset()
    return NextResponse.json({ ok: true, message: "Demo reset completed" })
  } catch (err) {
    console.error("[daily-reset] Error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Reset failed" },
      { status: 500 }
    )
  }
}
