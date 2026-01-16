"use client"

import { useState } from "react"
import {
    User, Home, Droplet, Zap, FileText,
    Wrench, Bell, ChevronRight, History,
    CreditCard, QrCode, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { mockDb } from "@/lib/mock-db"

// Mock Tenant Data
const mockTenantData = {
    profile: {
        name: "นายสมชาย ใจดี",
        phone: "081-234-5678",
        room: "404",
        building: "อาคาร A",
        floor: "4",
        status: "กำลังเช่า",
        avatar: ""
    },
    contract: {
        startDate: "01/01/2025",
        endDate: "31/12/2025",
        deposit: 9000,
        rent: 4500
    },
    billing: {
        currentMonth: "มกราคม 2569",
        dueDate: "05/02/2569",
        status: "รอชำระ", // รอชำระ, รอตรวจสอบ, ชำระแล้ว
        items: [
            { label: "ค่าเช่าห้อง", amount: 4500 },
            { label: "ค่าน้ำ (18 หน่วย)", amount: 360 },
            { label: "ค่าไฟ (120 หน่วย)", amount: 960 },
            { label: "ค่าส่วนกลาง", amount: 300 }
        ],
        total: 6120
    },
    utilities: {
        water: { current: 1250, previous: 1232, unit: 18 },
        electric: { current: 4560, previous: 4440, unit: 120 }
    },
    maintenance: [
        { id: 1, topic: "แอร์ไม่เย็น", status: "กำลังดำเนินการ", date: "10/01/2569" },
        { id: 2, topic: "เปลี่ยนหลอดไฟ", status: "เสร็จสิ้น", date: "15/12/2568" }
    ],
    notifications: [
        { id: 1, title: "แจ้งล้างถังพักน้ำ", date: "12/01/2569", type: "info" },
        { id: 2, title: "บิลประจำเดือนออกแล้ว", date: "01/02/2569", type: "alert" }
    ]
}

export function TenantDashboard() {
    const [activeTab, setActiveTab] = useState("overview")
    const data = mockTenantData

    return (
        <div className="space-y-6 pb-20 md:pb-0 font-athiti max-w-4xl mx-auto">
            {/* Header / Profile Summary */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                        {data.profile.room}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{data.profile.name}</h2>
                        <p className="text-xs text-muted-foreground">{data.profile.building} ชั้น {data.profile.floor}</p>
                    </div>
                </div>
                <Badge variant={data.profile.status === 'กำลังเช่า' ? 'default' : 'secondary'} className="bg-green-500 hover:bg-green-600">
                    {data.profile.status}
                </Badge>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                    <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                    <TabsTrigger value="billing">ชำระเงิน</TabsTrigger>
                    <TabsTrigger value="services">บริการ</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4">
                    {/* Urgency: Bill Card */}
                    <Card className={`border-l-4 ${data.billing.status === 'รอชำระ' ? 'border-l-red-500' : 'border-l-green-500'}`}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex justify-between">
                                ยอดที่ต้องชำระเดือนนี้
                                <span className="text-2xl font-bold text-red-600">฿{data.billing.total.toLocaleString()}</span>
                            </CardTitle>
                            <CardDescription>ครบกำหนด {data.billing.dueDate}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center text-sm">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${data.billing.status === 'รอชำระ' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    สถานะ: {data.billing.status}
                                </span>
                                <Button size="sm" onClick={() => setActiveTab("billing")}>
                                    ดูรายละเอียด <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Bell className="w-4 h-4" /> แจ้งเตือนล่าสุด
                        </h3>
                        {data.notifications.map(notif => (
                            <div key={notif.id} className="bg-white p-3 rounded-lg border shadow-sm flex items-start gap-3">
                                <div className={`mt-1 h-2 w-2 rounded-full ${notif.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{notif.title}</p>
                                    <p className="text-xs text-muted-foreground">{notif.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Utilities Quick View */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="p-4 flex flex-col items-center">
                                <Droplet className="w-8 h-8 text-blue-500 mb-2" />
                                <p className="text-xs text-muted-foreground">การใช้น้ำ</p>
                                <p className="text-lg font-bold">{data.utilities.water.unit} หน่วย</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex flex-col items-center">
                                <Zap className="w-8 h-8 text-yellow-500 mb-2" />
                                <p className="text-xs text-muted-foreground">การใช้ไฟ</p>
                                <p className="text-lg font-bold">{data.utilities.electric.unit} หน่วย</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* BILLING TAB */}
                <TabsContent value="billing" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>รายละเอียดบิล</CardTitle>
                            <CardDescription>รอบบิล {data.billing.currentMonth}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {data.billing.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm border-b border-dashed pb-2 last:border-0">
                                    <span className="text-slate-600">{item.label}</span>
                                    <span className="font-medium">฿{item.amount.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-2 border-t font-bold text-lg">
                                <span>ยอดสุทธิ</span>
                                <span className="text-emerald-700">฿{data.billing.total.toLocaleString()}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-3">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                <QrCode className="w-4 h-4 mr-2" /> สแกนจ่าย QR Code
                            </Button>
                            <Button variant="outline" className="w-full">
                                <CreditCard className="w-4 h-4 mr-2" /> แจ้งโอนเงิน / แนบสลิป
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <History className="w-4 h-4" /> ประวัติการชำระเงิน
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                                    <div>
                                        <p className="font-medium">ธันวาคม 2568</p>
                                        <p className="text-xs text-green-600">ชำระแล้ว</p>
                                    </div>
                                    <span className="font-bold text-slate-500">฿5,800</span>
                                </div>
                                <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                                    <div>
                                        <p className="font-medium">พฤศจิกายน 2568</p>
                                        <p className="text-xs text-green-600">ชำระแล้ว</p>
                                    </div>
                                    <span className="font-bold text-slate-500">฿5,950</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SERVICES / MAINTENANCE TAB */}
                <TabsContent value="services" className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600">
                                    <Wrench className="w-8 h-8" />
                                    แจ้งซ่อม
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>แจ้งซ่อม / ปัญหา</DialogTitle>
                                    <DialogDescription>กรอกรายละเอียดปัญหาที่พบพร้อมแนบรูปภาพหากมี</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>หัวข้อปัญหา</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกหัวข้อ" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="electric">ไฟฟ้า / หลอดไฟ</SelectItem>
                                                <SelectItem value="water">ประปา / น้ำรั่ว</SelectItem>
                                                <SelectItem value="air">เครื่องปรับอากาศ</SelectItem>
                                                <SelectItem value="other">อื่นๆ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>รายละเอียดเพิ่มเติม</Label>
                                        <Input placeholder="ระบุอาการ..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>รูปภาพประกอบ</Label>
                                        <Input type="file" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">ส่งแจ้งซ่อม</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <div className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow p-2 cursor-pointer">
                            <FileText className="w-8 h-8" />
                            สัญญา/เอกสาร
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">รายการแจ้งซ่อมล่าสุด</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {data.maintenance.map(item => (
                                <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium text-sm">{item.topic}</p>
                                        <p className="text-xs text-muted-foreground">{item.date}</p>
                                    </div>
                                    <Badge variant={item.status === 'เสร็จสิ้น' ? 'secondary' : 'default'} className={item.status === 'กำลังดำเนินการ' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : ''}>
                                        {item.status}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Contract Info Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">ข้อมูลสัญญา</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">เริ่มสัญญา</span>
                                <span>{data.contract.startDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">สิ้นสุดสัญญา</span>
                                <span>{data.contract.endDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">เงินประกัน</span>
                                <span>฿{data.contract.deposit.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
