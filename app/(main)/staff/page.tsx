import { prisma } from "@/app/lib/prisma"
import { requireRole, getCurrentUser } from "@/app/lib/auth"
import { formatCurrency } from "@/app/lib/currency"
import { StaffShiftTable } from "./StaffShiftTable"
import { Bell, Users, CreditCard, Calendar } from "lucide-react"

export default async function StaffPage() {
    const user = await requireRole(["ADMIN"]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const users = await prisma.user.findMany({
        orderBy: { username: "asc" },
        include: {
            shifts: {
                where: { clockIn: { gte: todayStart } },
                orderBy: { clockIn: "desc" },
                take: 1,
            },
            orders: {
                where: { createdAt: { gte: todayStart } },
            },
        },
    });

    const activeShifts = await prisma.shift.count({
        where: { status: "ACTIVE" },
    });

    const todayShifts = await prisma.shift.findMany({
        where: {
            clockIn: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
    });

    const totalHoursToday = todayShifts.reduce((acc, s) => {
        const end = s.clockOut ?? new Date();
        const hours = (end.getTime() - s.clockIn.getTime()) / (1000 * 60 * 60);
        return acc + hours;
    }, 0);

    const laborCostEst = totalHoursToday * 150; // placeholder rate

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 font-sans">
            <header className="h-16 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-zinc-950 flex-shrink-0 z-10 sticky top-0 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Staff & Shift Management</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:block mt-0.5">Manage shifts, roles, and staff access</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-700 transition-colors relative">
                        <Bell size={20} strokeWidth={2} />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Active Staff</span>
                                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                    <Users size={18} strokeWidth={2} />
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{activeShifts}</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Currently clocked in</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Labor Cost (Est.)</span>
                                <span className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                    <CreditCard size={18} strokeWidth={2} />
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(laborCostEst)}</p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Based on clocked hours</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Total Hours</span>
                                <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                    <Calendar size={18} strokeWidth={2} />
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                {Math.floor(totalHoursToday)}h {Math.round((totalHoursToday % 1) * 60)}m
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Today&apos;s aggregate</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Total Staff</span>
                                <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                    <Users size={18} strokeWidth={2} />
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{users.length}</p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Registered users</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Current Shift Status</h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Real-time overview of staff activity.</p>
                            </div>
                        </div>
                        <StaffShiftTable users={users} currentUserId={user.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
