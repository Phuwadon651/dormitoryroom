"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Role, Permissions as RolePermissions } from "@/types/role"
import { User } from "@/types/user"
import { updateRole, deleteRole } from "@/actions/role-actions"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Loader2, MoreHorizontal, Pencil, Trash2, User as UserIcon } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface RoleManagementProps {
    initialRoles: Role[];
    users: User[];
    currentUserId: string;
}

export function RoleManagement({ initialRoles, users, currentUserId }: RoleManagementProps) {
    const router = useRouter()
    const [roles, setRoles] = useState<Role[]>(initialRoles)
    const [isLoading, setIsLoading] = useState<string | null>(null) // role id being updated

    // Edit Dialog State
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [editForm, setEditForm] = useState<Partial<Role>>({})
    const [isSaving, setIsSaving] = useState(false)

    const handlePermissionToggle = async (role: Role, key: keyof RolePermissions, checked: boolean) => {
        // Optimistic update
        const updatedPermissions = { ...role.permissions, [key]: checked }
        const updatedRole = { ...role, permissions: updatedPermissions }

        setRoles(roles.map(r => r.id === role.id ? updatedRole : r))

        // Server update
        try {
            const result = await updateRole(role.id, { permissions: updatedPermissions })
            if (!result.success) {
                // Revert on failure
                setRoles(roles.map(r => r.id === role.id ? role : r))
                toast.error("บันทึกไม่สำเร็จ: " + result.error)
            } else {
                toast.success("บันทึกสิทธิ์เรียบร้อย")
                router.refresh()
            }
        } catch (error) {
            setRoles(roles.map(r => r.id === role.id ? role : r))
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        }
    }

    const openEditDialog = (role: Role) => {
        setEditingRole(role)
        setEditForm({ name: role.name, description: role.description, is_active: role.is_active })
        setIsEditOpen(true)
    }

    const handleSaveEdit = async () => {
        if (!editingRole) return
        setIsSaving(true)
        try {
            const result = await updateRole(editingRole.id, editForm)
            if (result.success) {
                setRoles(roles.map(r => r.id === editingRole.id ? result.data : r))
                setIsEditOpen(false)
                toast.success("บันทึกข้อมูลเรียบร้อย")
                router.refresh()
            } else {
                toast.error("บันทึกไม่สำเร็จ: " + result.error)
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาด")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (role: Role) => {
        if (!confirm(`คุณต้องการลบบทบาท "${role.name}" ใช่หรือไม่?`)) return
        try {
            const result = await deleteRole(role.id)
            if (result.success) {
                setRoles(roles.filter(r => r.id !== role.id))
                toast.success("ลบบทบาทเรียบร้อย")
                router.refresh()
            } else {
                toast.error("ลบไม่สำเร็จ: " + result.error)
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาด")
        }
    }

    // Permission Columns configuration
    const permissionColumns: { key: keyof RolePermissions; label: string }[] = [
        { key: 'accessUserManagement', label: 'จัดการผู้ใช้งาน' },
        { key: 'accessOverview', label: 'ภาพรวม' },
        { key: 'accessRoomManagement', label: 'ผังห้องพัก' },
        { key: 'accessTenants', label: 'ข้อมูลผู้เช่า' },
        { key: 'accessUtilities', label: 'จดมิเตอร์น้ำ/ไฟ' },
        { key: 'accessFinance', label: 'การเงิน' },
        { key: 'accessRepair', label: 'รายการแจ้งซ่อม' },
        { key: 'accessSettings', label: 'ตั้งค่า' },
    ]

    return (
        <div className="space-y-4 font-athiti">
            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="w-[200px] font-semibold text-slate-700">ผู้ใช้งาน</TableHead>
                            <TableHead className="w-[100px] font-semibold text-slate-700">บทบาท</TableHead>
                            {permissionColumns.map(col => (
                                <TableHead key={col.key} className="text-center font-semibold text-slate-700 min-w-[120px]">
                                    {col.label}
                                </TableHead>
                            ))}
                            <TableHead className="text-right font-semibold text-slate-700">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                            <UserIcon className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{role.name}</div>
                                            <div className="text-xs text-slate-500">{role.description || role.key}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-slate-50 font-normal">
                                        {role.key}
                                    </Badge>
                                </TableCell>
                                {permissionColumns.map(col => (
                                    <TableCell key={col.key} className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`text-[10px] ${role.permissions[col.key] ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                                                {role.permissions[col.key] ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                            </span>
                                            <Switch
                                                checked={role.permissions[col.key]}
                                                onCheckedChange={(checked) => handlePermissionToggle(role, col.key, checked)}
                                                className="data-[state=checked]:bg-emerald-600"
                                            />
                                        </div>
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
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => openEditDialog(role)}>
                                                <Pencil className="mr-2 h-4 w-4" /> แก้ไขข้อมูล
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(role)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> ลบบทบาท
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>แก้ไขบทบาท {editingRole?.name}</DialogTitle>
                        <DialogDescription>
                            แก้ไขข้อมูลทั่วไปของบทบาท
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                ชื่อ
                            </Label>
                            <Input
                                id="name"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                รายละเอียด
                            </Label>
                            <Textarea
                                id="description"
                                value={editForm.description || ''}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleSaveEdit} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            บันทึก
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
