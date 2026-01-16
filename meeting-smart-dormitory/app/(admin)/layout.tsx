import Link from "next/link"
import { Sidebar } from "@/components/dashboard/sidebar"
import { getCurrentUser } from "@/lib/auth"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-slate-50">
            {/* Sidebar */}
            <Sidebar currentUser={user} />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                {children}
            </main>
        </div>
    )
}
