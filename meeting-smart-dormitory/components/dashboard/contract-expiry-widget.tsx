"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ChevronRight } from "lucide-react"
import Link from "next/link"
import { ExpiringContract } from "@/actions/contract-actions"

interface ContractExpiryWidgetProps {
    contracts: ExpiringContract[]
}

export function ContractExpiryWidget({ contracts }: ContractExpiryWidgetProps) {
    // Logic to determine urgency color
    // If any contract is expiring in less than 7 days -> Red
    // Else -> Yellow
    const hasUrgent = contracts.some(c => c.remainingDays <= 7)
    const bgColor = hasUrgent ? "bg-red-50 border-red-100" : "bg-yellow-50 border-yellow-100"
    const textColor = hasUrgent ? "text-red-800" : "text-yellow-800"
    const iconColor = hasUrgent ? "text-red-600" : "text-yellow-600"
    const subTextColor = hasUrgent ? "text-red-600" : "text-yellow-600"

    if (contracts.length === 0) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">แจ้งเตือนสัญญา</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-slate-300" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-300">0</div>
                    <p className="text-xs text-muted-foreground">
                        ไม่มีสัญญาใกล้หมดอายุ
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Link href="/dashboard/dorm-admin/tenants?tab=expiring">
            <Card className={`cursor-pointer transition-all hover:opacity-90 ${bgColor} border`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${textColor}`}>สัญญาใกล้หมดอายุ</CardTitle>
                    <AlertTriangle className={`h-4 w-4 ${iconColor}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${textColor}`}>
                        {contracts.length}
                    </div>
                    <div className="flex items-center justify-between">
                        <p className={`text-xs ${subTextColor}`}>
                            {hasUrgent ? "มีรายการเร่งด่วน (< 7 วัน)" : "ภายใน 30 วัน"}
                        </p>
                        <ChevronRight className={`h-4 w-4 ${iconColor}`} />
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
