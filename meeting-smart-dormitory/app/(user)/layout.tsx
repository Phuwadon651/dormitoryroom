import Link from "next/link"
import { LogoutButton } from "@/components/auth/logout-button"

export default function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            {/* Top Bar */}
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-lg font-bold">SmartDorm <span className="text-xs text-slate-500">พอร์ทัล</span></h1>
                <nav className="hidden md:flex space-x-4 items-center">
                    <LogoutButton className="text-sm font-medium text-red-600 hover:underline border px-3 py-1 rounded-md hover:bg-red-50">
                        ออกจากระบบ
                    </LogoutButton>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto p-4 md:p-6 mb-16 md:mb-0">
                {children}
            </main>

            {/* Mobile Bottom Nav (Visible on small screens) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-end p-4 shadow-top pb-6">
                <LogoutButton className="flex flex-col items-center text-xs text-red-600 w-auto p-0 border-none bg-transparent hover:bg-transparent px-4">
                    <span className="mb-1 text-lg">🚪</span>
                    ออก
                </LogoutButton>
            </nav>
        </div>
    )
}
