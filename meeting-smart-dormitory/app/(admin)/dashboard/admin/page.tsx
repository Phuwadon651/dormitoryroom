import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRooms } from "@/actions/room-actions"
import { getUsers } from "@/actions/user-actions"
import { getRevenueStats } from "@/actions/finance-actions"
import { Users, Building, Wallet, Activity } from "lucide-react"
import { OverviewChart } from "@/components/dashboard/overview-chart"

export default async function AdminDashboard() {
    // Fetch data
    const [rooms, users, revenueStats] = await Promise.all([
        getRooms(),
        getUsers(),
        getRevenueStats()
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
                <Link href="/dashboard/admin/users">
                    <Card className="hover:bg-slate-50 transition-colors cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ผู้ใช้งานในระบบ</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalUsers}</div>
                            <p className="text-xs text-muted-foreground">
                                ผู้เช่า {totalTenants} คน
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">กิจกรรมล่าสุด</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12</div>
                        <p className="text-xs text-muted-foreground">
                            รายการแจ้งซ่อมและบิลใหม่
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
                            <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-yellow-800">รอตรวจสอบการชำระเงิน</p>
                                    <p className="text-xs text-yellow-600">3 รายการย้อนหลัง 5 วัน</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-orange-800">แจ้งซ่อมรออนุมัติ</p>
                                    <p className="text-xs text-orange-600">ห้อง 102 ก๊อกน้ำรั่ว</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
