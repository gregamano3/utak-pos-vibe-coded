import { prisma } from "@/app/lib/prisma"
import { requireRole } from "@/app/lib/auth"
import { createUser, updateUser, deleteUser } from "@/app/lib/actions/user"
import { UserSettingsClient } from "./UserSettingsClient"

export default async function SettingsPage() {
    await requireRole(["ADMIN"]);

    const users = await prisma.user.findMany({
        orderBy: { username: "asc" },
        select: {
            id: true,
            username: true,
            role: true,
            pin: true,
            createdAt: true,
        },
    });

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 font-sans">
            <header className="h-16 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-zinc-950 flex-shrink-0 z-10 sticky top-0 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">User Settings</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:block mt-0.5">Manage users and roles</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <UserSettingsClient
                        users={users}
                        createUser={createUser}
                        updateUser={updateUser}
                        deleteUser={deleteUser}
                    />
                </div>
            </div>
        </div>
    );
}
