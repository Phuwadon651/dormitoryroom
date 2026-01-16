'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogoutButton } from "@/components/auth/logout-button"
import { User } from "@/types/user"
import {
    LayoutDashboard,
    Users,
    Building2,
    Wrench,
    ClipboardList,
    Wallet,
    Settings,
    ChevronDown,
    ChevronRight,
    UserCog
} from "lucide-react"
import { switchRole } from "@/lib/auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

function CollapsibleUserMenu({ pathname }: { pathname: string }) {
    const [isOpen, setIsOpen] = useState(pathname.includes('/users'))

    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${pathname.includes('/users') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    จัดการผู้ใช้งาน
                </div>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {isOpen && (
                <div className="pl-11 space-y-1">
                    <Link
                        href="/dashboard/admin/users/list"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.includes('/users/list') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        รายชื่อผู้ใช้
                    </Link>
                    <Link
                        href="/dashboard/admin/users/roles"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.includes('/users/roles') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        จัดการบทบาท
                    </Link>
                </div>
            )}
        </div>
    )
}

function CollapsibleSettingsMenu({ pathname }: { pathname: string }) {
    const [isOpen, setIsOpen] = useState(pathname.includes('/settings'))

    // Auto-open if visiting a settings page but not manually closed (simplified logic)
    // Actually, just syncing with pathname is enough for auto-open on load
    // But we want toggle behavior. 
    // Let's stick to simple state initialized by pathname

    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${pathname.includes('/settings') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    ตั้งค่า
                </div>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {isOpen && (
                <div className="pl-11 space-y-1">
                    <Link
                        href="/dashboard/settings?tab=general"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.includes('/settings') && (pathname.includes('tab=general') || !pathname.includes('tab=')) ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        ข้อมูลหอพัก
                    </Link>
                    <Link
                        href="/dashboard/settings?tab=finance"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.includes('tab=finance') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        การเงินและบัญชี
                    </Link>
                    <Link
                        href="/dashboard/settings?tab=notification"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.includes('tab=notification') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        การแจ้งเตือน
                    </Link>
                </div>
            )}
        </div>
    )
}

interface SidebarProps {
    currentUser: User
}

export function Sidebar({ currentUser }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const isTechnician = currentUser.role === 'Technician'

    const handleRoleChange = async (role: string) => {
        await switchRole(role)
        router.refresh()
    }

    return (
        <aside className="w-full md:w-64 bg-slate-50 border-r flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b bg-white">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Building2 className="text-emerald-600" />
                    SmartDorm
                </h1>
                <div className="mt-2 text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-1 rounded inline-block">
                    {currentUser.name} ({currentUser.role})
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {/* 1. Super Admin Only: User Management */}
                {currentUser.role === 'Admin' && currentUser.permissions?.accessUserManagement !== false && (
                    <Link href="/dashboard/admin/users" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${pathname.includes('/users') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                        <Users className="h-5 w-5" />
                        จัดการผู้ใช้งาน
                    </Link>
                )}

                {/* 2. Ops Group (Admin, DormAdmin, Manager): Full Operations */}
                {['Admin', 'DormAdmin', 'Manager'].includes(currentUser.role) && (
                    <>
                        {currentUser.permissions?.accessOverview !== false && (
                            <Link href="/dashboard/admin" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${pathname === '/dashboard/admin' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                                <LayoutDashboard className="h-5 w-5" />
                                ภาพรวม
                            </Link>
                        )}

                        {currentUser.permissions?.accessRoomManagement !== false && (
                            <Link href="/dashboard/dorm-admin/rooms" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${pathname.includes('/rooms') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                                <Building2 className="h-5 w-5" />
                                ผังห้องพัก
                            </Link>
                        )}

                        {currentUser.permissions?.accessRoomManagement !== false && (
                            <Link href="/dashboard/dorm-admin/tenants" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${pathname.includes('/tenants') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                                <Users className="h-5 w-5" />
                                ข้อมูลผู้เช่า
                            </Link>
                        )}



                        {currentUser.permissions?.accessFinance !== false && (
                            <Link href="/dashboard/admin/finance" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${pathname.includes('/finance') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                                <Wallet className="h-5 w-5" />
                                การเงิน
                            </Link>
                        )}

                        {currentUser.permissions?.accessRepair !== false && (
                            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md font-medium text-slate-600 hover:bg-slate-100">
                                <Wrench className="h-5 w-5" />
                                รายการแจ้งซ่อม
                            </Link>
                        )}

                        <CollapsibleSettingsMenu pathname={pathname} />
                    </>
                )}

                {/* 3. Technician: Repair Only */}
                {currentUser.role === 'Technician' && (
                    <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md font-medium text-slate-600 hover:bg-slate-100">
                        <Wrench className="h-5 w-5" />
                        งานซ่อมที่ได้รับมอบหมาย
                    </Link>
                )}
            </nav>

            <div className="p-4 border-t bg-white space-y-4">
                {/* Debug Role Switcher */}


                <LogoutButton className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700" />
            </div>
        </aside>
    )
}
