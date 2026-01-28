"use client"

import { useState } from "react"
import { Menu, X, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "./sidebar-nav"
import { User } from "@/types/user"
import { LogoutButton } from "@/components/auth/logout-button"

interface MobileNavProps {
    currentUser: User
}

export function MobileNav({ currentUser }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-white sticky top-0 z-50">
            <div className="flex items-center gap-2 font-bold text-lg">
                <Building2 className="text-emerald-600 h-6 w-6" />
                <span>SmartDorm</span>
            </div>

            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
                <Menu className="h-6 w-6" />
            </Button>

            {/* Overlay / Drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Sidebar Content */}
                    <div className="relative w-[300px] h-full bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
                        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <Building2 className="text-emerald-600" />
                                    เมนูหลัก
                                </h2>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {currentUser.name} ({currentUser.role})
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <SidebarNav currentUser={currentUser} onLinkClick={() => setIsOpen(false)} />

                        <div className="p-4 border-t bg-slate-50">
                            <LogoutButton className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
