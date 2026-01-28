"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, MoreHorizontal, FilePenLine, Trash2, ShieldCheck, X, User as UserIcon, Pencil, Trash } from 'lucide-react'
import { toast } from "sonner"
import { User, UserRole } from "@/types/user"
import { createUser, updateUser, deleteUser, toggleUserStatus } from "@/actions/user-actions"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserManagementProps {
    initialUsers: User[]
    currentUser: User
}

export function UserManagement({ initialUsers, currentUser }: UserManagementProps) {
    const isAdmin = currentUser.role === 'Admin'
    const router = useRouter()
    const [users, setUsers] = useState<User[]>(initialUsers.filter(u => u.role !== 'Tenant'))
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentId, setCurrentId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState<Partial<User>>({
        username: "",
        password: "",
        name: "",
        role: "Manager",
        email: "",
        permissions: {
            accessOverview: true,
            accessUserManagement: true,
            accessRoomManagement: true,
            accessOperations: true,
            accessRepair: true,
            accessFinance: true
        }
    })

    // Handle Input Change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Handle Select Change
    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Reset Form
    const resetForm = () => {
        setFormData({
            username: "",
            password: "",
            name: "",
            role: "Manager",
            email: "",
            permissions: {
                accessOverview: true,
                accessUserManagement: true,
                accessRoomManagement: true,
                accessOperations: true,
                accessRepair: true,
                accessFinance: true
            }
        })
        setIsEditing(false)
        setCurrentId(null)
        setError(null)
    }

    // Submit Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        try {
            if (isEditing && currentId) {
                const result = await updateUser(currentId, formData)
                if (result.success) {
                    setUsers(users.map(u => u.id === currentId ? result.data : u))
                    router.refresh()
                    toast.success("แก้ไขเสร็จสิ้น")
                } else {
                    throw new Error(result.error);
                }
            } else {
                const result = await createUser(formData as Omit<User, 'id'>)
                if (result.success) {
                    setUsers([...users, result.data])
                    router.refresh()
                    toast.success("บันทึกข้อมูลเรียบร้อย")
                } else {
                    throw new Error(result.error);
                }
            }

            setIsDialogOpen(false)
            resetForm()
        } catch (err) {
            console.error(err)
            if (err instanceof Error) {
                // Formatting the error message nicely
                let msg = err.message.replace('Failed to create user: ', '').replace('Failed to update user: ', '');
                try {
                    // Try to parse JSON error if possible
                    const jsonErr = JSON.parse(msg);
                    if (jsonErr.message) msg = jsonErr.message;
                    if (jsonErr.errors) {
                        msg = Object.values(jsonErr.errors).flat().join(', ');
                    }
                } catch { }
                setError(msg);
            } else {
                setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล")
            }
        }
    }

    // Edit Handler
    const handleEdit = (user: User) => {
        setFormData({
            ...user,
            password: user.password, // Ideally wouldn't show, but mock needs it
            permissions: user.permissions || {
                accessOverview: true,
                accessUserManagement: true,
                accessRoomManagement: true,
                accessOperations: true,
                accessRepair: true,
                accessFinance: true
            }
        })
        setCurrentId(user.id)
        setIsEditing(true)
        setIsDialogOpen(true)
    }

    // Delete Handler
    const handleDelete = async (id: string) => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) {
            const result = await deleteUser(id)
            if (result.success) {
                setUsers(users.filter(u => u.id !== id))
                router.refresh()
                toast.success("ลบข้อมูลเสร็จสิ้น")
            } else {
                toast.error("ลบข้อมูลไม่สำเร็จ: " + result.error)
            }
        }
    }

    // Toggle Status Handler
    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus
        // Optimistic update
        setUsers(users.map(u => u.id === id ? { ...u, isActive: newStatus } : u))

        const result = await toggleUserStatus(id, newStatus)
        if (!result.success) {
            toast.error("เปลี่ยนสถานะไม่สำเร็จ: " + result.error)
            // Revert
            setUsers(users.map(u => u.id === id ? { ...u, isActive: currentStatus } : u))
        }
        router.refresh()
    }

    // View Handler (New)
    const [viewingUser, setViewingUser] = useState<User | null>(null)
    const [pendingPermissionChange, setPendingPermissionChange] = useState<{ userId: string, permKey: string, newValue: boolean } | null>(null)

    const handleConfirmPermissionChange = async () => {
        if (!pendingPermissionChange) return

        const { userId, permKey, newValue } = pendingPermissionChange
        const user = users.find(u => u.id === userId)
        if (!user) return

        const newPermissions = {
            ...user.permissions,
            [permKey]: newValue
        }

        const result = await updateUser(userId, { permissions: newPermissions })

        if (result.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, permissions: newPermissions } : u))
            router.refresh()

            // Custom Toast
            toast.custom((t) => (
                <div className="bg-white border-2 border-green-500 rounded-xl p-4 shadow-lg flex items-center gap-3 min-w-[300px]">
                    <div className="bg-green-100 p-2 rounded-full">
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">แก้ไขเสร็จสิ้น</h3>
                        <p className="text-sm text-slate-600">สิทธิ์การใช้งานถูกบันทึกเรียบร้อยแล้ว</p>
                    </div>
                    <button onClick={() => toast.dismiss(t)} className="ml-auto text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ), { duration: 3000 })

        } else {
            toast.error("บันทึกไม่สำเร็จ: " + result.error)
        }

        setPendingPermissionChange(null)
    }

    const handleView = (user: User) => {
        setViewingUser(user)
    }

    return (
        <div className="space-y-4 font-athiti">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">รายชื่อผู้ใช้งานในระบบ</h2>

                {isAdmin && (
                    <>
                        <Button onClick={() => {
                            resetForm()
                            setIsDialogOpen(true)
                        }}>
                            <Plus className="mr-2 h-4 w-4" /> เพิ่มผู้ใช้
                        </Button>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>{isEditing ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</DialogTitle>
                                    <DialogDescription>
                                        กำหนดบทบาทและข้อมูลพื้นฐานของผู้ใช้งาน
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                                            {error}
                                        </div>
                                    )}
                                    <div className="grid gap-6 py-4">
                                        {/* Main Info Section */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="สมชาย ใจดี" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="role">บทบาท</Label>
                                                <Select value={formData.role} onValueChange={(val) => handleSelectChange('role', val)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="เลือกบทบาท" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Admin">ผู้ดูแลระบบ (Admin)</SelectItem>
                                                        <SelectItem value="DormAdmin">ผู้ดูแลหอพัก (Dorm Admin)</SelectItem>
                                                        <SelectItem value="Manager">ผู้จัดการ (Manager)</SelectItem>
                                                        <SelectItem value="Technician">ช่างซ่อม (Technician)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="username">Username</Label>
                                                <Input id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder="username" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="password">Password</Label>
                                                <Input id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" required />
                                            </div>

                                            <div className="space-y-2 col-span-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input id="email" type="email" name="email" value={formData.email || ''} onChange={handleInputChange} placeholder="email@example.com" />
                                            </div>
                                        </div>

                                    </div>

                                    <DialogFooter className="gap-2 sm:gap-0">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
                                        <Button type="submit">บันทึก</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </div >

            {/* View Details Dialog */}
            <Dialog open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>รายละเอียดบัญชีใช้งาน</DialogTitle>
                        <DialogDescription>
                            ข้อมูลรายละเอียดของผู้ใช้งานและสิทธิ์การเข้าถึง
                        </DialogDescription>
                    </DialogHeader>
                    {viewingUser && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-500 text-xs">ชื่อ-นามสกุล</Label>
                                    <div className="font-medium">{viewingUser.name}</div>
                                </div>
                                <div>
                                    <Label className="text-slate-500 text-xs">บทบาท</Label>
                                    <div><Badge variant="secondary">{viewingUser.role}</Badge></div>
                                </div>
                                <div>
                                    <Label className="text-slate-500 text-xs">Username</Label>
                                    <div className="font-mono text-sm">{viewingUser.username}</div>
                                </div>
                                <div>
                                    <Label className="text-slate-500 text-xs">สถานะ</Label>
                                    <div className={viewingUser.isActive !== false ? "text-green-600 font-medium" : "text-red-500"}>
                                        {viewingUser.isActive !== false ? "ใช้งานปกติ" : "ถูกระงับ"}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-slate-500 text-xs">รหัสผ่าน</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-lg leading-none tracking-widest">••••••••</span>
                                        <Button
                                            variant="link"
                                            className="h-auto p-0 text-blue-600 text-xs"
                                            onClick={() => {
                                                setViewingUser(null)
                                                handleEdit(viewingUser)
                                            }}
                                        >
                                            รีเซ็ต/แก้ไข
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-slate-500 text-xs">Email</Label>
                                    <div className="text-sm">{viewingUser.email || '-'}</div>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-2">
                                <Label className="block mb-2 font-medium">สิทธิ์การใช้งาน (Permissions)</Label>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">จัดการผู้ใช้</span>
                                        <span className={viewingUser.permissions?.accessUserManagement !== false ? "text-green-600" : "text-red-400"}>
                                            {viewingUser.permissions?.accessUserManagement !== false ? "อนุญาต" : "ไม่อนุญาต"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">จัดการหอพัก</span>
                                        <span className={viewingUser.permissions?.accessRoomManagement !== false ? "text-green-600" : "text-red-400"}>
                                            {viewingUser.permissions?.accessRoomManagement !== false ? "อนุญาต" : "ไม่อนุญาต"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">การดำเนินงาน</span>
                                        <span className={viewingUser.permissions?.accessOperations !== false ? "text-green-600" : "text-red-400"}>
                                            {viewingUser.permissions?.accessOperations !== false ? "อนุญาต" : "ไม่อนุญาต"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">การเงิน</span>
                                        <span className={viewingUser.permissions?.accessFinance !== false ? "text-green-600" : "text-red-400"}>
                                            {viewingUser.permissions?.accessFinance !== false ? "อนุญาต" : "ไม่อนุญาต"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewingUser(null)}>ปิด</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px] bg-slate-50 text-slate-700">ผู้ใช้งาน</TableHead>
                            <TableHead className="bg-slate-50 text-slate-700">บทบาท</TableHead>
                            <TableHead className="text-center bg-slate-50 text-slate-700">จัดการผู้ใช้งาน</TableHead>
                            <TableHead className="text-center bg-slate-50 text-slate-700">ภาพรวม</TableHead>
                            <TableHead className="text-center bg-slate-50 text-slate-700">ผังห้องพัก</TableHead>
                            <TableHead className="text-center bg-slate-50 text-slate-700">ข้อมูลผู้เช่า</TableHead>
                            <TableHead className="text-center bg-slate-50 text-slate-700">จดมิเตอร์น้ำ/ไฟ</TableHead>
                            <TableHead className="text-center bg-slate-50 text-slate-700">การเงิน</TableHead>
                            <TableHead className="text-center bg-slate-50 text-slate-700">แจ้งซ่อม</TableHead>
                            <TableHead className="text-center bg-slate-50 text-slate-700">ตั้งค่า</TableHead>
                            <TableHead className="text-right bg-slate-50 text-slate-700">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} className="text-center h-24 text-muted-foreground">ไม่มีข้อมูลผู้ใช้</TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                <UserIcon className="h-4 w-4 text-slate-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{user.name}</span>
                                                <span className="text-xs text-muted-foreground">{user.username}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-white hover:bg-white text-slate-600 border-slate-200">
                                            {user.role}
                                        </Badge>
                                    </TableCell>

                                    {/* Permission Columns */}
                                    {[
                                        'accessUserManagement',
                                        'accessOverview',
                                        'accessRoomManagement',
                                        'accessTenants',
                                        'accessUtilities',
                                        'accessFinance',
                                        'accessRepair',
                                        'accessSettings'
                                    ].map((permKey) => (
                                        <TableCell key={permKey} className="text-center p-2">
                                            {isAdmin ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className={`text-[10px] min-w-[45px] text-right ${user.permissions?.[permKey as keyof typeof user.permissions] !== false ? 'text-green-600' : 'text-slate-300'}`}>
                                                        {user.permissions?.[permKey as keyof typeof user.permissions] !== false ? 'เปิดใช้งาน' : 'ปิด'}
                                                    </span>
                                                    <Switch
                                                        checked={user.permissions?.[permKey as keyof typeof user.permissions] !== false}
                                                        onCheckedChange={(checked) => {
                                                            setPendingPermissionChange({
                                                                userId: user.id,
                                                                permKey,
                                                                newValue: checked
                                                            })
                                                        }}
                                                        className="data-[state=checked]:bg-slate-800"
                                                    />
                                                </div>
                                            ) : (
                                                <span className={user.permissions?.[permKey as keyof typeof user.permissions] !== false ? 'text-green-600' : 'text-slate-400'}>
                                                    {user.permissions?.[permKey as keyof typeof user.permissions] !== false ? '✓' : '-'}
                                                </span>
                                            )}
                                        </TableCell>
                                    ))}

                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>
                                                {isAdmin && (
                                                    <DropdownMenuItem onClick={() => handleView(user)}>
                                                        <Search className="mr-2 h-4 w-4" />
                                                        ดูรายละเอียด
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    แก้ไขข้อมูล
                                                </DropdownMenuItem>
                                                {isAdmin && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600">
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            ลบผู้ใช้
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Confirmation Dialog for Permission Change */}
            <Dialog open={!!pendingPermissionChange} onOpenChange={(open) => !open && setPendingPermissionChange(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ยืนยันการเปลี่ยนสิทธิ์การใช้งาน</DialogTitle>
                        <DialogDescription>
                            คุณต้องการบันทึกการเปลี่ยนแปลงสิทธิ์นี้ใช่หรือไม่?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPendingPermissionChange(null)}>ยกเลิก</Button>
                        <Button onClick={handleConfirmPermissionChange} className="bg-slate-900 hover:bg-slate-800">ยืนยันการเปลี่ยนแปลง</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
