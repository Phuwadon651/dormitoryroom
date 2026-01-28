import { MobileNav } from "@/components/tenant/mobile-nav"

export default function TenantLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-athiti">
            {/* Main Content Area */}
            <main className="container max-w-md mx-auto min-h-screen bg-white shadow-sm overflow-hidden relative">
                {children}
            </main>

            {/* Bottom Navigation */}
            <MobileNav />
        </div>
    )
}
