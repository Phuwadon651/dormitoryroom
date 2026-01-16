import { Suspense } from "react"
import { getContracts, getInvoices, getPayments } from "@/actions/finance-actions"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ContractList } from "@/components/finance/contract-list"
import { InvoiceList } from "@/components/finance/invoice-list"
import { PaymentList } from "@/components/finance/payment-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, CreditCard } from "lucide-react"

export default async function FinancePage() {
    const currentUser = await getCurrentUser()
    if (!['Admin', 'DormAdmin', 'Manager'].includes(currentUser.role)) {
        redirect('/dashboard')
    }

    const contracts = await getContracts()
    const invoices = await getInvoices()
    const payments = await getPayments()

    // Key Stats
    const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total_amount, 0)
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

            {/* Tabs */}
            <Tabs defaultValue="invoices" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="contracts">สัญญาเช่า (Contracts)</TabsTrigger>
                    <TabsTrigger value="invoices">ใบแจ้งหนี้ (Invoices)</TabsTrigger>
                    <TabsTrigger value="payments">ตรวจสอบการชำระ (Transactions)</TabsTrigger>
                </TabsList>

                <TabsContent value="contracts" className="space-y-4">
                    <ContractList initialContracts={contracts} />
                </TabsContent>

                <TabsContent value="invoices" className="space-y-4">
                    <InvoiceList initialInvoices={invoices} contracts={contracts} />
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                    <PaymentList initialPayments={payments} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
