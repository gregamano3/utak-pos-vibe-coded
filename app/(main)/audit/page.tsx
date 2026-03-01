import { prisma } from "@/app/lib/prisma"
import { requireRole } from "@/app/lib/auth"
import { Calendar as CalendarIcon, Filter, ClipboardList } from "lucide-react"

const ACTION_LABELS: Record<string, string> = {
  ORDER_CREATED: "Order created",
  ORDER_VOIDED: "Order voided",
  USER_CREATED: "User created",
  USER_UPDATED: "User updated",
  USER_DELETED: "User deleted",
}

export default async function AuditPage(props: {
  searchParams?: Promise<{
    from?: string
    to?: string
    action?: string
  }>
}) {
  await requireRole(["ADMIN"])
  const searchParams = await props.searchParams

  const from = searchParams?.from
    ? new Date(searchParams.from)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const to = searchParams?.to ? new Date(searchParams.to) : new Date()
  to.setHours(23, 59, 59, 999)

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      ...(searchParams?.action ? { action: searchParams.action } : {}),
    },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <ClipboardList size={28} />
            Audit Trail
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Track all system actions and changes.
          </p>
        </div>

        <form
          action="/audit"
          method="get"
          className="bg-white dark:bg-zinc-950 p-2 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-2"
        >
          <CalendarIcon size={18} className="text-zinc-400 ml-2" />
          <input
            type="date"
            name="from"
            defaultValue={from.toISOString().split("T")[0]}
            className="bg-transparent border-0 text-sm text-zinc-900 dark:text-white focus:ring-0 cursor-pointer"
          />
          <span className="text-zinc-400">to</span>
          <input
            type="date"
            name="to"
            defaultValue={to.toISOString().split("T")[0]}
            className="bg-transparent border-0 text-sm text-zinc-900 dark:text-white focus:ring-0 cursor-pointer"
          />
          <select
            name="action"
            defaultValue={searchParams?.action ?? ""}
            className="bg-zinc-50 dark:bg-zinc-900 border-0 text-sm text-zinc-900 dark:text-white rounded-lg px-2 py-1"
          >
            <option value="">All actions</option>
            {Object.entries(ACTION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Filter size={14} /> Filter
          </button>
        </form>
      </header>

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {auditLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        log.action === "USER_DELETED" || log.action === "ORDER_VOIDED"
                          ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                          : log.action === "ORDER_CREATED"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                    {log.entity}
                    {log.entityId && (
                      <span className="text-zinc-400 font-mono text-xs ml-1">
                        ({log.entityId.slice(0, 8)}...)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                    {log.details ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                    {log.user?.username ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {auditLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
            <ClipboardList size={48} className="opacity-40 mb-4" />
            <p>No audit entries found for this period.</p>
          </div>
        )}
      </div>
    </div>
  )
}
