import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Wrench } from "lucide-react"

export default function DormAdminDashboard() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">ภาพรวมผู้ดูแลหอพัก</h2>

            <div className="grid gap-4 md:grid-cols-3">
                <Link href="/dashboard/dorm-admin/rooms">
                    <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">จัดการห้องพัก</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">จัดการข้อมูล</div>
                            <p className="text-xs text-muted-foreground">
                                เพิ่ม ลบ แก้ไข ข้อมูลห้องพัก
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="#">
                    <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ผู้เช่า</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">25 คน</div>
                            <p className="text-xs text-muted-foreground">
                                จัดการข้อมูลสัญญาและผู้เช่า
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="#">
                    <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">แจ้งซ่อม</CardTitle>
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3 รายการ</div>
                            <p className="text-xs text-muted-foreground">
                                ติดตามและมอบหมายงานซ่อม
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
