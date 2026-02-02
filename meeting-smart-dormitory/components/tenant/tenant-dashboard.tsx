"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Home, Droplet, Zap, FileText,
    Wrench, Bell, ChevronRight, History,
    CreditCard, QrCode, Edit, Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTenantProfile } from "@/actions/tenant-actions"
import { getSettings } from "@/actions/setting-actions"
import { MaintenanceList } from "./maintenance-list-component"
import CreateMaintenanceModal from "@/components/maintenance/create-maintenance-modal"
import MaintenanceDetailDialog from "@/components/maintenance/maintenance-detail-dialog"
import { MaintenanceRequest } from "@/types/maintenance"

// Utility to format date
const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
        return new Date(dateStr).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    } catch { return dateStr }
}

export function TenantDashboard() {
    const [activeTab, setActiveTab] = useState("overview")
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [invoices, setInvoices] = useState<any[]>([])
    const [settings, setSettings] = useState<any>(null)
    const [maintenances, setMaintenances] = useState<any[]>([])

    // Maintenance Detail State
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)

    async function loadData() {
        try {
            const [profileData, settingsData] = await Promise.all([
                getTenantProfile(),
                getSettings()
            ])

            // Fetch maintenances using the separate action if needed, or rely on profile data if it includes it.
            // For now, let's assume we need to fetch it to get the latest status updates.
            const maintenanceRes = await import("@/actions/tenant-actions").then(m => m.getMaintenances())

            if (settingsData) {
                setSettings(settingsData)
            }

            if (profileData && profileData.profile) {
                setProfile(profileData.profile);
                let allInvoices: any[] = [];
                if (profileData.profile.contracts) {
                    profileData.profile.contracts.forEach((c: any) => {
                        if (c.invoices) allInvoices.push(...c.invoices);
                    });
                }
                allInvoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setInvoices(allInvoices);
            }

            setMaintenances(maintenanceRes || []);

        } catch (e) {
            console.error("Failed to load data", e)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [])

    const handleCardClick = (req: MaintenanceRequest) => {
        setSelectedRequest(req);
        setDetailOpen(true);
    }

    if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>
    if (!profile) return <div className="p-8 text-center text-red-500">ไม่พบข้อมูลผู้เช่า หรือเซสชันหมดอายุ</div>

    const pendingBill = invoices.find(inv => inv.status === 'Pending');

    return (
        <div className="space-y-6 pb-20 md:pb-0 font-athiti max-w-4xl mx-auto">
            {/* Header / Profile Summary */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                        {profile.room?.room_number || '-'}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{profile.name}</h2>
                        <p className="text-xs text-muted-foreground">{profile.room?.building || 'อาคาร A'} ชั้น {profile.room?.floor || '-'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={profile.status === 'Active' ? 'default' : 'secondary'} className="bg-green-500 hover:bg-green-600">
                        {profile.status}
                    </Badge>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-800 rounded-full h-8 w-8">
                                <Edit className="w-4 h-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>แก้ไขข้อมูลส่วนตัว</DialogTitle>
                                <DialogDescription>
                                    หากต้องการเปลี่ยนรหัสผ่าน หรือแก้ไขข้อมูลสำคัญ
                                    กรุณาติดต่อผู้ดูแลหอพัก หรือแจ้งผ่านเมนู "แจ้งซ่อม/ปัญหา" {'>'} "อื่นๆ"
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                    <TabsTrigger value="billing">ชำระเงิน</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4">
                    {/* Bill Card */}
                    {pendingBill ? (
                        <Card className="border-l-4 border-l-red-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex justify-between">
                                    ยอดที่ต้องชำระเดือนนี้
                                    <span className="text-2xl font-bold text-red-600">฿{Number(pendingBill.total_amount).toLocaleString()}</span>
                                </CardTitle>
                                <CardDescription>รอบ {pendingBill.period_month}/{pendingBill.period_year}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                                        สถานะ: รอชำระ
                                    </span>
                                    <Button size="sm" onClick={() => setActiveTab("billing")}>
                                        ดูรายละเอียด <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="py-6 text-center text-green-700">
                                ไม่มียอดค้างชำระในขณะนี้
                            </CardContent>
                        </Card>
                    )}

                    {/* Contract Link Button */}
                    <Link href="/tenant/contract" className="block">
                        <div className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">สัญญาเช่าห้องพัก</p>
                                    <p className="text-xs text-slate-500">ดูรายละเอียดสัญญาและกฎระเบียบ</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                    </Link>

                    {/* Maintenance Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4 mt-6">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-orange-500" />
                                รายการแจ้งซ่อม
                            </h3>
                            <CreateMaintenanceModal
                                refresh={loadData}
                                prefilledRoom={profile?.room}
                            />
                        </div>

                        <MaintenanceList requests={maintenances} onClick={handleCardClick} />
                    </div>

                    {/* Notifications */}
                    <div className="space-y-2 pt-4 border-t mt-6">
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Bell className="w-4 h-4" /> แจ้งเตือนล่าสุด
                        </h3>
                        {/* Placeholder Notifications */}
                        <div className="bg-white p-3 rounded-lg border shadow-sm flex items-start gap-3">
                            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">ระบบแจ้งเตือนกำลังปรับปรุง</p>
                                <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('th-TH')}</p>
                            </div>
                        </div>
                    </div>

                </TabsContent>

                {/* BILLING TAB */}
                <TabsContent value="billing" className="space-y-4">
                    {/* Same Billing Content */}
                    {pendingBill ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>รายละเอียดบิลล่าสุด</CardTitle>
                                <CardDescription>รอบ {pendingBill.period_month}/{pendingBill.period_year}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm border-b border-dashed pb-2">
                                    <span className="text-slate-600">ค่าเช่าห้อง</span>
                                    <span className="font-medium">฿{Number(pendingBill.rent_total).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-dashed pb-2">
                                    <span className="text-slate-600">ค่าน้ำ ({Number(pendingBill.water_total).toLocaleString()} บาท)</span>
                                    <span className="font-medium">{pendingBill.water_curr - pendingBill.water_prev} หน่วย</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-dashed pb-2">
                                    <span className="text-slate-600">ค่าไฟ ({Number(pendingBill.electric_total).toLocaleString()} บาท)</span>
                                    <span className="font-medium">{pendingBill.electric_curr - pendingBill.electric_prev} หน่วย</span>
                                </div>

                                <div className="flex justify-between pt-2 border-t font-bold text-lg">
                                    <span>ยอดสุทธิ</span>
                                    <span className="text-emerald-700">฿{Number(pendingBill.total_amount).toLocaleString()}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col gap-3">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                            <QrCode className="w-4 h-4 mr-2" /> สแกนจ่าย QR Code
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>สแกน QR Code เพื่อชำระเงิน</DialogTitle>
                                            <DialogDescription>
                                                สแกนผ่านแอปธนาคารเพื่อชำระยอด {Number(pendingBill.total_amount).toLocaleString()} บาท
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex flex-col items-center justify-center py-6 gap-4">
                                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                                {settings?.finance?.promptpay_qr_image || settings?.general?.promptpay_qr_image ? (
                                                    <img
                                                        src={settings?.finance?.promptpay_qr_image || settings?.general?.promptpay_qr_image}
                                                        alt="PromptPay QR"
                                                        className="w-48 h-48 object-contain"
                                                    />
                                                ) : (
                                                    <img
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021129370016A000000677010111011300668812345675802TH5303764540${Number(pendingBill.total_amount).toFixed(2)}6304`}
                                                        alt="PromptPay QR"
                                                        className="w-48 h-48"
                                                    />
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-slate-800">PromptPay</p>
                                                <p className="text-sm text-slate-600">{settings?.finance?.promptpay_number || settings?.general?.promptpay_number || '-'}</p>
                                                <p className="text-xs text-muted-foreground">{settings?.finance?.promptpay_name || settings?.general?.promptpay_name || ''}</p>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            <CreditCard className="w-4 h-4 mr-2" /> แจ้งโอนเงิน / แนบสลิป
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>แจ้งชำระเงิน</DialogTitle>
                                            <DialogDescription>กรอกข้อมูลและแนบสลิปการโอนเงิน</DialogDescription>
                                        </DialogHeader>
                                        <form className="space-y-4" action={async (formData) => {
                                            const amount = formData.get('amount')
                                            const date = formData.get('payment_date')
                                            if (!amount || !date) return alert('กรุณากรอกข้อมูลให้ครบ')
                                            formData.append('invoice_id', pendingBill.id);
                                            const { submitPayment } = await import('@/actions/finance-actions')
                                            const res = await submitPayment(formData)
                                            if (res.success) {
                                                alert('แจ้งชำระเงินเรียบร้อยแล้ว รอการตรวจสอบครับ')
                                                window.location.reload()
                                            } else {
                                                alert('เกิดข้อผิดพลาด: ' + res.message)
                                            }
                                        }}>
                                            <div className="grid gap-2">
                                                <Label>ยอดโอน</Label>
                                                <Input name="amount" defaultValue={pendingBill.total_amount} type="number" step="0.01" required />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>วัน-เวลา ที่โอน</Label>
                                                <Input name="payment_date" type="datetime-local" required defaultValue={new Date().toISOString().slice(0, 16)} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>หลักฐานการโอน (สลิป)</Label>
                                                <Input name="slip_image" type="file" accept="image/*" required />
                                            </div>
                                            <Button type="submit" className="w-full">ยืนยันการแจ้งโอน</Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">ไม่มียอดค้างชำระ</div>
                    )}

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <History className="w-4 h-4" /> ประวัติการชำระเงิน
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {invoices.filter(i => i.status === 'Paid' || i.status === 'Pending').map(inv => (
                                    <div key={inv.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                                        <div>
                                            <p className="font-medium">รอบ {inv.period_month}/{inv.period_year}</p>
                                            <p className={`text-xs ${inv.status === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                                {inv.status === 'Paid' ? 'ชำระแล้ว' : 'รอตรวจสอบ'}
                                            </p>
                                        </div>
                                        <span className="font-bold text-slate-500">฿{Number(inv.total_amount).toLocaleString()}</span>
                                    </div>
                                ))}
                                {invoices.filter(i => i.status === 'Paid' || i.status === 'Pending').length === 0 && (
                                    <p className="text-center text-xs text-muted-foreground py-4">ยังไม่มีประวัติการชำระเงิน</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <MaintenanceDetailDialog
                request={selectedRequest}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                user={{ role: 'Tenant', id: profile?.id, username: profile?.name } as any}
                onSuccess={loadData}
            />
        </div>
    )
}
