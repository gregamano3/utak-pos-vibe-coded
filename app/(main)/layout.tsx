import { Sidebar } from "@/app/components/Sidebar";
import { getCurrentUser } from "@/app/lib/auth";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();
    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-500/30">
            <Sidebar user={user} />
            <main className="flex-1 overflow-y-auto w-full">
                {children}
            </main>
        </div>
    );
}
