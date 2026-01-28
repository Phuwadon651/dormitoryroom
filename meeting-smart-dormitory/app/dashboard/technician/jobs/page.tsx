import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TechnicianJobsPage() {
    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">งานซ่อมที่ได้รับมอบหมาย</h2>
                    <p className="text-muted-foreground mt-1">จัดการรายการแจ้งซ่อมและสถานะการดำเนินงาน</p>
                </div>

                {/* Stats Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">งานรอรับเรื่อง</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                <Wrench className="h-4 w-4 text-orange-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">2</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                งานใหม่ที่ยังไม่ได้กดรับ
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">งานกำลังดำเนินการ</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Wrench className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">1</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                อยู่ระหว่างซ่อม
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Job List Section */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="border-b bg-white px-6 py-4 rounded-t-xl">
                        <CardTitle className="text-lg font-semibold text-slate-900">รายการงานซ่อม</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {/* Job Item 1 */}
                            <div className="rounded-lg border bg-orange-50/50 p-5 hover:bg-orange-50 transition-colors">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-lg text-slate-900">ห้อง 102 - ก๊อกน้ำรั่ว</h3>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                                                รอรับงาน
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600">น้ำหยดตลอดเวลา ทำให้พื้นเปียก</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                                            <span>แจ้งเมื่อ: 14 ม.ค. 2026 10:30</span>
                                        </div>
                                    </div>
                                    <Button className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
                                        กดรับงาน
                                    </Button>
                                </div>
                            </div>

                            {/* Job Item 2 */}
                            <div className="rounded-lg border bg-white p-5 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-lg text-slate-900">ห้อง 205 - หลอดไฟขาด</h3>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                                กำลังดำเนินการ
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600">ไฟระเบียงไม่ติด</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                                            <span>เริ่มซ่อม: 15 ม.ค. 2026 09:00</span>
                                        </div>
                                    </div>
                                    <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white shadow-sm">
                                        ปิดงาน
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
