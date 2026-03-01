"use client";

import { formatCurrency } from "@/app/lib/currency";
import { clockIn, clockOut } from "@/app/lib/actions/shift";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UserWithShifts = {
  id: string;
  username: string;
  role: string;
  shifts: { id: string; clockIn: Date; clockOut: Date | null; status: string }[];
  orders: { totalAmount: number }[];
};

export function StaffShiftTable({ users, currentUserId }: { users: UserWithShifts[]; currentUserId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleClockIn() {
    setLoading("in");
    try {
      await clockIn();
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleClockOut() {
    setLoading("out");
    try {
      await clockOut();
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-zinc-800">
            <th className="px-6 py-4 w-14"></th>
            <th className="px-6 py-4">Name & Role</th>
            <th className="px-6 py-4">Clock In</th>
            <th className="px-6 py-4 text-right">Sales Today</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
          {users.map((user) => {
            const activeShift = user.shifts[0];
            const isClockedIn = activeShift?.status === "ACTIVE";
            const salesToday = user.orders.reduce((s, o) => s + o.totalAmount, 0);
            const isCurrentUser = currentUserId === user.id;

            return (
              <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="px-6 py-4 pl-6">
                  <div
                    className="size-10 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 font-bold text-sm"
                  >
                    {user.username[0]?.toUpperCase() ?? "?"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-slate-900 dark:text-white font-semibold text-sm">{user.username}</span>
                    <span className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5">{user.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {activeShift ? (
                    <div className="flex flex-col">
                      <span className="text-slate-700 dark:text-zinc-300 text-sm font-medium">
                        {new Date(activeShift.clockIn).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-medium bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded w-fit mt-0.5">
                        {isClockedIn ? "On time" : "Clocked out"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-zinc-500 text-sm">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-slate-900 dark:text-white font-mono font-medium bg-slate-50 dark:bg-zinc-800 px-2 py-1 rounded">
                    {formatCurrency(salesToday)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isClockedIn
                        ? "bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700"
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${isClockedIn ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                    {isClockedIn ? "Clocked In" : "Off"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {isCurrentUser &&
                    (isClockedIn ? (
                      <button
                        onClick={handleClockOut}
                        disabled={!!loading}
                        className="px-3 py-1.5 text-xs font-semibold bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/30 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loading ? "..." : "Clock Out"}
                      </button>
                    ) : (
                      <button
                        onClick={handleClockIn}
                        disabled={!!loading}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/30 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loading ? "..." : "Clock In"}
                      </button>
                    ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="px-6 py-12 text-center text-slate-500 dark:text-zinc-400">No staff found.</div>
      )}
    </div>
  );
}
