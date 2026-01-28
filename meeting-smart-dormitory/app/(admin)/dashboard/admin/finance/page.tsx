import { Suspense } from "react"
import { getContracts, getInvoices, getPayments } from "@/actions/finance-actions"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, CreditCard } from "lucide-react"
import { FinanceView } from "@/components/finance/finance-view"

export default async function FinancePage() {
    const currentUser = await getCurrentUser()
    const allowedRoles = ['Admin', 'DormAdmin', 'Manager']
    if (!allowedRoles.includes(currentUser.role)) {
        redirect('/dashboard')
    }

    const contracts = await getContracts()
    const invoices = await getInvoices()
    const payments = await getPayments()

    // Key Stats
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // Total Revenue (This Month ONLY)
    const totalRevenue = invoices
        .filter(i => i.status === 'Paid' && i.month === currentMonth && i.year === currentYear)
        .reduce((sum, i) => sum + i.total_amount, 0)
    const pendingAmount = invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.total_amount, 0)
    const activeContracts = contracts.filter(c => c.isActive).length

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-athiti text-slate-800">ระบบการเงิน (Finance)</h1>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">รายรับรวม (เดือนนี้)</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">จากใบแจ้งหนี้ที่ชำระแล้ว</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">รอการชำระ</CardTitle>
                        <CreditCard className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{pendingAmount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">ใบแจ้งหนี้สถานะ Pending</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">สัญญาเช่าที่ใช้งาน</CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeContracts}</div>
                        <p className="text-xs text-muted-foreground">สัญญา Active ทั้งหมด</p>
                    </CardContent>
                </Card>
            </div>

            {/* Client Component for View Management */}
            <FinanceView
                contracts={contracts}
                invoices={invoices}
                payments={payments}
                currentUser={currentUser}
            />
        </div>
    )
}
