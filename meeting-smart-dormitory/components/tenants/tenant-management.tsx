"use client"

import { useState, useEffect } from "react"
import {
    Search, User as UserIcon, Building2, Phone,
    MoreHorizontal, FileText, Info, Plus, Pencil, Trash
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tenant } from "@/types/tenant"
import { getTenants, createTenant, deleteTenant, updateTenant } from "@/actions/tenant-actions"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContractExpiryList } from "@/components/contracts/contract-expiry-list"
import { NewContractWizard } from "@/components/contracts/new-contract-wizard"

export function TenantManagement({ user }: { user: any }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const defaultTab = searchParams.get('tab') || 'all'

    const [tenants, setTenants] = useState<Tenant[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isWizardOpen, setIsWizardOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form State for New Tenant
    const [newTenantData, setNewTenantData] = useState<Partial<Tenant>>({
        name: "", phone: "", room: "", building: "อาคาร A", floor: "1", status: "Active", email: "", moveInDate: new Date().toISOString().split('T')[0]
    })

    const openEditDialog = (tenant: Tenant) => {
        setEditingId(tenant.id)
        setNewTenantData({
            ...tenant,
            // Password fields should be empty on edit unless changed
            password: "",
        })
        setIsAddDialogOpen(true)
    }

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
            let result;
            if (editingId) {
                // Remove password if empty to avoid overwriting with empty string
                const { password, ...dataToUpdate } = newTenantData;
                const updatePayload = password ? newTenantData : dataToUpdate;

                result = await updateTenant(editingId, updatePayload as Partial<Tenant>)
            } else {
                result = await createTenant(newTenantData as Omit<Tenant, 'id'>)
            }

            if (result.success) {
                toast.success(editingId ? "แก้ไขข้อมูลเรียบร้อย" : "เพิ่มข้อมูลผู้เช่าเรียบร้อย")
                setIsAddDialogOpen(false)
                setNewTenantData({
                    name: "", phone: "", room: "", building: "อาคาร A", floor: "1", status: "Active", email: "", moveInDate: new Date().toISOString().split('T')[0]
                })
                setEditingId(null)
                loadTenants()
                router.refresh()
            } else {
                toast.error(result.error || "เกิดข้อผิดพลาดในการบันทึก")
            }
        } catch (e) {
            console.error(e)
            toast.error("เกิดข้อผิดพลาดไม่ทราบสาเหตุ")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteTenant = async (id: string) => {
        if (confirm("คุณแน่ใจว่าต้องการลบผู้เช่าคนนี้? สถานะห้องจะกลับเป็น 'ว่าง'")) {
            const result = await deleteTenant(id)
            if (result.success) {
                toast.success("ลบข้อมูลผู้เช่าเรียบร้อย")
                loadTenants()
                router.refresh()
                setSelectedTenant(null)
            } else {
                toast.error(result.error || "ไม่สามารถลบข้อมูลได้")
            }
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
            </div>

            <div className="flex gap-2">
                <Button onClick={() => setIsWizardOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> ทำสัญญาเช่าใหม่
                </Button>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                setIsAddDialogOpen(open)
                if (!open) {
                    setEditingId(null)
                    setNewTenantData({
                        name: "", phone: "", room: "", building: "อาคาร A", floor: "1", status: "Active", email: "", moveInDate: new Date().toISOString().split('T')[0]
                    })
                }
            }}>
                {/* DialogTrigger removed to separate Create/Edit flows */}
                <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{editingId ? 'แก้ไขข้อมูลผู้เช่า (Edit Tenant)' : 'เพิ่มผู้เช่าใหม่ (Create New Tenant)'}</DialogTitle>
                        <DialogDescription>
                            {editingId ? 'แก้ไขรายละเอียดข้อมูลผู้เช่า' : 'สร้างบัญชีผู้ใช้และข้อมูลส่วนตัวสำหรับผู้เช่ารายใหม่'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Section 1: Account Information */}
                        <div className="bg-slate-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-semibold mb-3 text-slate-700">ข้อมูลบัญชีผู้ใช้ (Account Information)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">ชื่อบัญชีผู้ใช้ (Username) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="username"
                                        placeholder="กรอกชื่อบัญชีผู้ใช้..."
                                        value={newTenantData.username || ''}
                                        onChange={e => setNewTenantData({ ...newTenantData, username: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">รหัสผ่าน (Password) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={newTenantData.password || ''}
                                        onChange={e => setNewTenantData({ ...newTenantData, password: e.target.value })} // Note: Tenant type needs password field extension
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน (Confirm Password) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Personal Information */}
                        <div className="bg-slate-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-semibold mb-3 text-slate-700">ข้อมูลส่วนตัว (Personal Information)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">ชื่อจริง (First Name) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="firstName"
                                        placeholder="กรอกชื่อจริง..."
                                        value={newTenantData.name?.split(' ')[0] || ''}
                                        onChange={e => {
                                            const lastName = newTenantData.name?.split(' ').slice(1).join(' ') || ''
                                            setNewTenantData({ ...newTenantData, name: `${e.target.value} ${lastName}` })
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">นามสกุล (Last Name) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="lastName"
                                        placeholder="กรอกนามสกุล..."
                                        value={newTenantData.name?.split(' ').slice(1).join(' ') || ''}
                                        onChange={e => {
                                            const firstName = newTenantData.name?.split(' ')[0] || ''
                                            setNewTenantData({ ...newTenantData, name: `${firstName} ${e.target.value}` })
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="idCard">เลขบัตรประชาชน (ID Card No.) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="idCard"
                                        placeholder="X-XXXX-XXXXX-XX-X"
                                    // value={newTenantData.idCard || ''} // Need to extend type
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Contact & Status */}
                        <div className="bg-slate-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-semibold mb-3 text-slate-700">ข้อมูลติดต่อและสถานะ (Contact & Status)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">อีเมล (Email)</Label>
                                    <Input
                                        id="email"
                                        placeholder="ตัวอย่าง: user@example.com"
                                        value={newTenantData.email || ''}
                                        onChange={e => setNewTenantData({ ...newTenantData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">เบอร์โทรศัพท์ (Phone) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="phone"
                                        placeholder="0xx-xxxxxxx"
                                        value={newTenantData.phone || ''}
                                        onChange={e => setNewTenantData({ ...newTenantData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">สถานะบัญชี (Status) <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={newTenantData.status || 'Active'}
                                        onValueChange={(val) => setNewTenantData({ ...newTenantData, status: val as Tenant['status'] })}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="เลือกสถานะ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active (ใช้งานปกติ)</SelectItem>
                                            <SelectItem value="Inactive">Inactive (ระงับการใช้งาน)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">บทบาท (Role)</Label>
                                    <div className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 opacity-100">
                                        ผู้เช่า (Tenant)
                                    </div>
                                </div>
                            </div>

                            {/* Room Section (Keeping existing logic but integrated) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="room">เลขห้อง (Room No.) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="room"
                                        placeholder="เช่น 101"
                                        value={newTenantData.room || ''}
                                        onChange={e => setNewTenantData({ ...newTenantData, room: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="building">อาคาร (Building)</Label>
                                    <Select
                                        value={newTenantData.building || 'อาคาร A'}
                                        onValueChange={(val) => setNewTenantData({ ...newTenantData, building: val })}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="เลือกอาคาร" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="อาคาร A">อาคาร A</SelectItem>
                                            <SelectItem value="อาคาร B">อาคาร B</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="moveInDate">วันที่เข้าอยู่ (Move-in Date)</Label>
                                    <Input
                                        id="moveInDate"
                                        type="date"
                                        value={newTenantData.moveInDate || ''}
                                        onChange={e => setNewTenantData({ ...newTenantData, moveInDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 bg-slate-50 -mx-6 -mb-6 p-6 border-t mt-4">
                        <Button variant="outline" className="min-w-[100px]" onClick={() => setIsAddDialogOpen(false)}>ยกเลิก (Cancel)</Button>
                        <Button className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddTenant}>บันทึกข้อมูล (Save Tenant)</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>



            {/* Tabs Integration */}
            <Tabs defaultValue={defaultTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">ผู้เช่าทั้งหมด</TabsTrigger>
                    <TabsTrigger value="expiring" className="relative">
                        สัญญาใกล้หมดอายุ
                        {/* Optional: Add badge here if needed, but widget handles alert */}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
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
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation()
                                                            openEditDialog(tenant)
                                                        }}>
                                                            <Pencil className="mr-2 h-4 w-4" /> แก้ไขข้อมูล
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleDeleteTenant(tenant.id)
                                                            }}
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" /> ลบข้อมูล
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="expiring">
                    <ContractExpiryList userRole={user?.role || 'Guest'} />
                </TabsContent>
            </Tabs>

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
                                {/* Account Credentials Section */}
                                <div className="col-span-2 p-3 bg-slate-100 rounded-lg border border-slate-200 mt-2">
                                    <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <UserIcon className="w-3 h-3" /> ข้อมูลบัญชีผู้ใช้ (Account)
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Username</p>
                                            <p className="font-mono text-sm font-medium text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 inline-block min-w-[120px]">
                                                {selectedTenant.username || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Password</p>
                                            <div className="flex items-center gap-2">
                                                <p className="font-mono text-sm font-medium text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 inline-block min-w-[120px]">
                                                    {selectedTenant.plain_password || '******'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
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


            <NewContractWizard
                open={isWizardOpen}
                onOpenChange={setIsWizardOpen}
                onSuccess={() => {
                    loadTenants()
                    router.refresh()
                }}
            />
        </div >
    )
}
