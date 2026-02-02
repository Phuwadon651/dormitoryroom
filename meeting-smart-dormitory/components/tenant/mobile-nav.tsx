"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Receipt, Wrench, FileText, User } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
    {
        label: "หน้าหลัก",
        href: "/tenant/dashboard",
        icon: Home
    },
    {
        label: "บิล/ชำระ",
        href: "/tenant/invoices",
        icon: Receipt
    },

    {
        label: "สัญญา",
        href: "/tenant/contract",
        icon: FileText
    },
    {
        label: "โปรไฟล์",
        href: "/tenant/profile",
        icon: User
    }
]

export function MobileNav() {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white pb-safe z-50">
            <div className="flex items-center justify-around h-16">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn("w-6 h-6", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
