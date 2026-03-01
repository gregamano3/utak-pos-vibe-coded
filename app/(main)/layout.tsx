import { Sidebar } from "@/app/components/Sidebar";
import { MobileNav } from "@/app/components/MobileNav";
import { getCurrentUser } from "@/app/lib/auth";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();
    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-500/30 overflow-hidden">
            <Sidebar user={user} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <MobileNav user={user} />
                <main className="flex-1 overflow-y-auto w-full min-h-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
