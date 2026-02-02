"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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

function CollapsibleFinanceMenu({ pathname }: { pathname: string }) {
    const searchParams = useSearchParams()
    const view = searchParams.get('view')

    // Auto-open if we are in finance section
    const [isOpen, setIsOpen] = useState(pathname.includes('/finance'))

    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${pathname.includes('/finance') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5" />
                    การเงิน
                </div>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {isOpen && (
                <div className="pl-11 space-y-1">
                    <Link
                        href="/dashboard/admin/finance?view=contracts"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${view === 'contracts' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        สัญญาเช่า
                    </Link>
                    <Link
                        href="/dashboard/admin/finance?view=invoices"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${view === 'invoices' || (pathname.includes('/finance') && !view) ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        ใบแจ้งหนี้
                    </Link>
                    <Link
                        href="/dashboard/admin/finance?view=payments"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${view === 'payments' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        ตรวจสอบการชำระ
                    </Link>
                </div>
            )}
        </div>
    )
}

function CollapsibleSettingsMenu({ pathname }: { pathname: string }) {
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab')

    // Auto-open if we are in settings section
    const [isOpen, setIsOpen] = useState(pathname.includes('/settings'))

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
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'general' || (pathname.includes('/settings') && !tab) ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        ข้อมูลหอพัก
                    </Link>
                    <Link
                        href="/dashboard/settings?tab=finance"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'finance' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        การเงินและบัญชี
                    </Link>
                    <Link
                        href="/dashboard/settings?tab=notification"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'notification' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        การแจ้งเตือน
                    </Link>
                </div>
            )}
        </div>
    )
}

function CollapsibleMaintenanceMenu({ pathname }: { pathname: string }) {
    const searchParams = useSearchParams()
    const status = searchParams.get('status')
    const [isOpen, setIsOpen] = useState(pathname.includes('/maintenance'))

    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${pathname.includes('/maintenance') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <Wrench className="h-5 w-5" />
                    รายการแจ้งซ่อม
                </div>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {isOpen && (
                <div className="pl-11 space-y-1">
                    <Link
                        href="/dashboard/maintenance?status=all"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${status === 'all' || (pathname.includes('/maintenance') && !status) ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        แสดงรายการทั้งหมด
                    </Link>
                    <Link
                        href="/dashboard/maintenance?status=pending"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${status === 'pending' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        รอแจ้งซ่อม
                    </Link>
                    <Link
                        href="/dashboard/maintenance?status=in_progress"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${status === 'in_progress' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        กำลังซ่อม
                    </Link>
                    <Link
                        href="/dashboard/maintenance?status=completed"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${status === 'completed' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        ซ่อมเสร็จสิ้น
                    </Link>
                </div>
            )}
        </div>
    )
}

interface SidebarNavProps {
    currentUser: User
    onLinkClick?: () => void
}

export function SidebarNav({ currentUser, onLinkClick }: SidebarNavProps) {
    const pathname = usePathname()

    return (
        <nav className="flex-1 overflow-y-auto p-4 space-y-1" onClick={(e) => {
            // If a link was clicked, trigger onLinkClick
            if ((e.target as HTMLElement).tagName === 'A' || (e.target as HTMLElement).closest('a')) {
                onLinkClick?.()
            }
        }}>
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

                    {currentUser.permissions?.accessTenants !== false && (
                        <Link href="/dashboard/dorm-admin/tenants" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${pathname.includes('/tenants') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                            <Users className="h-5 w-5" />
                            ข้อมูลผู้เช่า
                        </Link>
                    )}

                    {currentUser.permissions?.accessUtilities !== false && (
                        <Link href="/dashboard/dorm-admin/utilities" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${pathname.includes('/utilities') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                            <ClipboardList className="h-5 w-5" />
                            จดมิเตอร์น้ำ/ไฟ
                        </Link>
                    )}

                    {currentUser.permissions?.accessFinance !== false && (
                        <CollapsibleFinanceMenu pathname={pathname} />
                    )}

                    {/* Repair Menu - Visible to Everyone */}
                    <CollapsibleMaintenanceMenu pathname={pathname} />

                    {currentUser.permissions?.accessSettings !== false && (
                        <CollapsibleSettingsMenu pathname={pathname} />
                    )}
                </>
            )}

            {/* 3. Technician: Repair Only */}
            {currentUser.role === 'Technician' && (
                <Link href="/dashboard/maintenance" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${pathname.includes('/maintenance') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <Wrench className="h-5 w-5" />
                    งานซ่อมที่ได้รับมอบหมาย
                </Link>
            )}
        </nav>
    )
}
