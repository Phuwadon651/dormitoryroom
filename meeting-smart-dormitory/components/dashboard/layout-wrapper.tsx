'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/dashboard/sidebar'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { User } from '@/types/user'

export function LayoutWrapper({
    currentUser,
    children
}: {
    currentUser: User
    children: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-slate-50">
            {/* Mobile Navigation */}
            <MobileNav currentUser={currentUser} />

            {/* Desktop Sidebar */}
            <div className={`hidden md:block border-r bg-slate-50 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-0 overflow-hidden border-none'}`}>
                <div className="w-64">
                    <Sidebar currentUser={currentUser} onToggle={() => setIsOpen(!isOpen)} />
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen relative">
                {/* Floating Toggle Button (Only when closed) */}
                {!isOpen && (
                    <div className="hidden md:block absolute top-4 left-4 z-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(true)}
                            title="Open Sidebar"
                            className="bg-white hover:bg-slate-100 shadow-sm border text-slate-500 hover:text-slate-900"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>
                )}

                {/* Content Container */}
                <div className={!isOpen ? "pt-12 pl-2" : ""}>
                    {children}
                </div>
            </main>
        </div>
    )
}
