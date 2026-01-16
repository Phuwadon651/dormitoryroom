"use client"

import { useState, useEffect } from "react"
import {
    Search, User as UserIcon, Building2, Phone,
    MoreHorizontal, FileText, Info, Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table"
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tenant } from "@/types/tenant"
import { getTenants, createTenant, deleteTenant } from "@/actions/tenant-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function TenantManagement() {
    const router = useRouter()
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Form State for New Tenant
    const [newTenantData, setNewTenantData] = useState<Partial<Tenant>>({
        name: "", phone: "", room: "", building: "อาคาร A", floor: "1", status: "Active", email: "", moveInDate: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        loadTenants()
    }, [])

    const loadTenants = async () => {
        setIsLoading(true)
        const data = await getTenants()
        setTenants(data)
        setIsLoading(false)
    }

    const filteredTenants = (tenants || []).filter(t =>
        t.name.includes(searchTerm) ||
        t.room.includes(searchTerm) ||
        t.phone.includes(searchTerm)
    )

    const handleAddTenant = async () => {
        if (!newTenantData.name || !newTenantData.room) {
            toast.error("กรุณากรอกชื่อและเลขห้อง")
            return;
        }

        setIsLoading(true)
        try {
            const result = await createTenant(newTenantData as Omit<Tenant, 'id'>)

            if (result.success) {
                toast.success("เพิ่มข้อมูลผู้เช่าเรียบร้อย")
                setIsAddDialogOpen(false)
                setNewTenantData({
                    name: "", phone: "", room: "", building: "อาคาร A", floor: "1", status: "Active", email: "", moveInDate: new Date().toISOString().split('T')[0]
                })
                loadTenants()
                router.refresh()
            } else {
                toast.error(result.error || "เกิดข้อผิดพลาดในการบันทึก")
            }
        } catch (e) {
            toast.error("เกิดข้อผิดพลาดไม่ทราบสาเหตุ")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteTenant = async (id: string) => {
        if (confirm("คุณแน่ใจว่าต้องการลบผู้เช่าคนนี้? สถานะห้องจะกลับเป็น 'ว่าง'")) {
            await deleteTenant(id)
            loadTenants()
            router.refresh()
            setSelectedTenant(null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">กำลังเช่า</Badge>
            case 'MovingOut': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">แจ้งย้ายออก</Badge>
            case 'Pending': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">รอตรวจสอบ</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6 font-athiti">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">ข้อมูลผู้เช่า</h2>
                    <p className="text-muted-foreground">จัดการและดูข้อมูลรายละเอียดของผู้เช่าทั้งหมด</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> เพิ่มผู้เช่าใหม่
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>เพิ่มผู้เช่าใหม่</DialogTitle>
                            <DialogDescription>
                                กรอกข้อมูลผู้เช่าใหม่ ระบบจะอัปเดตสถานะห้องพักเป็น "ไม่ว่าง" อัตโนมัติ
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">ชื่อ-นามสกุล</Label>
                                <Input id="name" value={newTenantData.name} onChange={e => setNewTenantData({ ...newTenantData, name: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">เบอร์โทร</Label>
                                <Input id="phone" value={newTenantData.phone} onChange={e => setNewTenantData({ ...newTenantData, phone: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="room" className="text-right">เลขห้อง</Label>
                                <Input id="room" value={newTenantData.room} onChange={e => setNewTenantData({ ...newTenantData, room: e.target.value })} className="col-span-3" placeholder="เช่น 101, 202" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="building" className="text-right">อาคาร</Label>
                                <Select value={newTenantData.building} onValueChange={(val) => setNewTenantData({ ...newTenantData, building: val })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="เลือกอาคาร" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="อาคาร A">อาคาร A</SelectItem>
                                        <SelectItem value="อาคาร B">อาคาร B</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" value={newTenantData.email} onChange={e => setNewTenantData({ ...newTenantData, email: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="moveInDate" className="text-right">วันที่เข้าอยู่</Label>
                                <Input
                                    id="moveInDate"
                                    type="date"
                                    value={newTenantData.moveInDate}
                                    onChange={e => setNewTenantData({ ...newTenantData, moveInDate: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleAddTenant}>บันทึกข้อมูล</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2 bg-white p-4 rounded-lg border shadow-sm">
                <Search className="w-5 h-5 text-slate-400" />
                <Input
                    placeholder="ค้นหาตามชื่อ, เบอร์โทร หรือเลขห้อง..."
                    className="max-w-sm border-none shadow-none focus-visible:ring-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tenants List */}
            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ผู้เช่า</TableHead>
                            <TableHead>ห้องพัก</TableHead>
                            <TableHead>เบอร์โทรศัพท์</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">กำลังโหลด...</TableCell>
                            </TableRow>
                        ) : filteredTenants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">ไม่พบข้อมูลผู้เช่า</TableCell>
                            </TableRow>
                        ) : (
                            filteredTenants.map((tenant) => (
                                <TableRow
                                    key={tenant.id}
                                    className="cursor-pointer hover:bg-slate-50"
                                    onClick={() => setSelectedTenant(tenant)}
                                >
                                    <TableCell className="flex items-center gap-3 font-medium">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-blue-100 text-blue-600">
                                                {tenant.name.substring(0, 1)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">{tenant.name}</div>
                                            <div className="text-xs text-muted-foreground">{tenant.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900">{tenant.room}</span>
                                            <span className="text-xs text-muted-foreground">{tenant.building} ชั้น {tenant.floor}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{tenant.phone}</TableCell>
                                    <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Tenant Detail Dialog */}
            <Dialog open={!!selectedTenant} onOpenChange={(open) => !open && setSelectedTenant(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>รายละเอียดผู้เช่า</DialogTitle>
                        <DialogDescription>ข้อมูลส่วนตัวและสัญญาเช่า</DialogDescription>
                    </DialogHeader>

                    {selectedTenant && (
                        <div className="space-y-6 pt-4">
                            {/* Profile Header */}
                            <div className="flex flex-col items-center gap-2">
                                <Avatar className="h-20 w-20 border-4 border-slate-100">
                                    <AvatarFallback className="text-2xl font-bold bg-blue-600 text-white">
                                        {selectedTenant.name.substring(0, 1)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-slate-900">{selectedTenant.name}</h3>
                                    <p className="text-sm text-muted-foreground">ผู้เช่าหลัก</p>
                                </div>
                                {getStatusBadge(selectedTenant.status)}
                            </div>

                            {/* Contact Info */}
                            <Card>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-slate-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">เบอร์โทรศัพท์</p>
                                            <p className="text-sm font-medium">{selectedTenant.phone}</p>
                                        </div>
                                        <Button size="sm" variant="outline" className="h-8">โทร</Button>
                                    </div>
                                    <div className="flex items-center gap-3 border-t pt-3">
                                        <Building2 className="w-4 h-4 text-slate-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">ห้องพัก</p>
                                            <p className="text-sm font-medium">ห้อง {selectedTenant.room} ({selectedTenant.building})</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-lg border">
                                    <p className="text-xs text-muted-foreground mb-1">เริ่มสัญญา</p>
                                    <p className="font-semibold text-sm">{selectedTenant.moveInDate}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg border">
                                    <p className="text-xs text-muted-foreground mb-1">สิ้นสุดสัญญา</p>
                                    <p className="font-semibold text-sm">31/12/2025</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button className="w-full" variant="outline">
                                    <FileText className="w-4 h-4 mr-2" /> สัญญา
                                </Button>
                                <Button className="w-full" variant="destructive" onClick={() => handleDeleteTenant(selectedTenant.id)}>
                                    ลบข้อมูล
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
