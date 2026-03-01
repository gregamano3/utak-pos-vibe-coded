/**
 * Runs at server startup. Schedules a daily reset at midnight when ENABLE_DAILY_RESET is set.
 * Set ENABLE_DAILY_RESET=true in .env for demo deployments.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  if (process.env.ENABLE_DAILY_RESET !== "true") return

  const cron = await import("node-cron")
  cron.default.schedule("0 0 * * *", async () => {
    try {
      const { runDemoReset } = await import("./app/lib/demo-reset")
      await runDemoReset()
      console.log("[demo-reset] Daily reset completed at midnight")
    } catch (err) {
      console.error("[demo-reset] Failed:", err)
    }
  })
}
