'use client'

import { User } from "@/types/user"
import { Building2 } from "lucide-react"
import { SidebarNav } from "./sidebar-nav"
import { LogoutButton } from "@/components/auth/logout-button"

interface SidebarProps {
    currentUser: User
    onToggle?: () => void
}

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar({ currentUser, onToggle }: SidebarProps) {
    return (
        <aside className="w-full md:w-64 bg-slate-50 border-r flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b bg-white flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Building2 className="text-emerald-600" />
                    SmartDorm
                </h1>
                {onToggle && (
                    <Button variant="ghost" size="icon" onClick={onToggle} className="-mr-2 text-slate-500 hover:text-slate-900">
                        <Menu className="h-6 w-6" />
                    </Button>
                )}
            </div>

            <div className="mt-2 text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-1 rounded inline-block mx-6 w-fit">
                {currentUser.name} ({currentUser.role})
            </div>

            <SidebarNav currentUser={currentUser} />

            <div className="p-4 border-t bg-white space-y-4">
                <LogoutButton className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700" />
            </div>
        </aside>
    )
}
