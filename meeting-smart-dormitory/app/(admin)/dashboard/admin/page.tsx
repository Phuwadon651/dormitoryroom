import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRooms } from "@/actions/room-actions"
import { getUsers } from "@/actions/user-actions"
import { getRevenueStats, getPayments, getInvoices } from "@/actions/finance-actions"
import { getMaintenanceRequests } from "@/actions/maintenance-actions"
import { getExpiringContracts } from "@/actions/contract-actions"
import { Users, Building, Wallet, Activity } from "lucide-react"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { ContractExpiryWidget } from "@/components/dashboard/contract-expiry-widget"

export default async function AdminDashboard() {
    // Fetch data
    const [rooms, users, revenueStats, invoices, payments, maintenances, expiringContracts] = await Promise.all([
        getRooms(),
        getUsers(),
        getRevenueStats(),
        getInvoices(),
        getPayments(),
        getMaintenanceRequests(),
        getExpiringContracts(30) // 30 days threshold
    ]);

    // Calculate Stats
    const totalRooms = rooms.length
    const vacantRooms = rooms.filter(r => r.status === 'ว่าง').length
    const occupiedRooms = rooms.filter(r => r.status === 'ไม่ว่าง').length

    // Calculate Revenue (From Stats)
    const currentMonthStats = revenueStats[revenueStats.length - 1]
    const totalRevenue = currentMonthStats ? currentMonthStats.total : 0

    const totalUsers = users.length
    const totalTenants = users.filter(u => u.role === 'Tenant').length

    // Calculate Activity (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentInvoices = invoices.filter(inv => new Date(inv.status === 'Paid' ? inv.due_date : inv.due_date) > sevenDaysAgo).length;
    const recentMaintenance = maintenances.filter(m => new Date(m.created_at || m.report_date) > sevenDaysAgo).length;
    const recentActivityCount = recentInvoices + recentMaintenance;

    // Urgent Notifications
    const pendingPayments = payments.filter(p => p.status === 'Pending');
    const pendingMaintenances = maintenances.filter(m => m.status === 'pending');

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">ภาพรวมแดชบอร์ด</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">รายได้รวม (เดือนนี้)</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            ยอดที่ชำระแล้วในเดือนนี้
                        </p>
                    </CardContent>
                </Card>
                <Link href="/dashboard/dorm-admin/rooms">
                    <Card className="hover:bg-slate-50 transition-colors cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ห้องพักทั้งหมด</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalRooms}</div>
                            <p className="text-xs text-muted-foreground">
                                ว่าง {vacantRooms} / ไม่ว่าง {occupiedRooms}
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <ContractExpiryWidget contracts={expiringContracts} />

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">กิจกรรมล่าสุด</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{recentActivityCount}</div>
                        <p className="text-xs text-muted-foreground">
                            รายการแจ้งซ่อมและบิลใหม่ (7 วัน)
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <OverviewChart
                    data={revenueStats}
                />
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>แจ้งเตือนด่วน</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingPayments.length > 0 ? (
                                <Link href="/dashboard/admin/finance" className="block">
                                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-colors cursor-pointer">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-yellow-800">รอตรวจสอบการชำระเงิน</p>
                                            <p className="text-xs text-yellow-600">{pendingPayments.length} รายการ</p>
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="p-3 text-sm text-slate-500 text-center border rounded-lg bg-slate-50">
                                    ไม่มีรายการรอตรวจสอบการชำระเงิน
                                </div>
                            )}

                            {pendingMaintenances.length > 0 ? (
                                <Link href="/dashboard/maintenance?status=pending" className="block">
                                    <div className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors cursor-pointer">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-orange-800">แจ้งซ่อมรออนุมัติ</p>
                                            <p className="text-xs text-orange-600">
                                                {pendingMaintenances.length} รายการ ล่าสุด: ห้อง {pendingMaintenances[0].room?.room_number || pendingMaintenances[0].room_id}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="p-3 text-sm text-slate-500 text-center border rounded-lg bg-slate-50">
                                    ไม่มีรายการแจ้งซ่อมรออนุมัติ
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
