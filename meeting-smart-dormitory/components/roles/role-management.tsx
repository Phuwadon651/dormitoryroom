"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Role, Permissions as RolePermissions } from "@/types/role"
import { User } from "@/types/user"
import { updateRole, createRole, deleteRole, assignUserToRole, removeUserFromRole } from "@/actions/role-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, Plus, Save, Trash2, UserPlus, X, Shield, Users } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RoleManagementProps {
    initialRoles: Role[];
    users: User[]; // All users for assignment
    currentUserId: string;
}

export function RoleManagement({ initialRoles, users, currentUserId }: RoleManagementProps) {
    const router = useRouter()
    const [roles, setRoles] = useState<Role[]>(initialRoles)
    const [selectedRole, setSelectedRole] = useState<Role | null>(initialRoles.length > 0 ? initialRoles[0] : null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Edit State
    const [formData, setFormData] = useState<Partial<Role>>({})
    const [isDirty, setIsDirty] = useState(false)

    useEffect(() => {
        if (selectedRole) {
            setFormData({ ...selectedRole })
            setIsDirty(false)
        }
    }, [selectedRole])

    const handleRoleSelect = (role: Role) => {
        if (isDirty) {
            if (!confirm("คุณมีการแก้ไขที่ยังไม่ได้บันทึก ต้องการเปลี่ยนบทบาทโดยไม่บันทึกหรือไม่?")) {
                return
            }
        }
        setSelectedRole(role)
    }

    const handleInputChange = (field: keyof Role, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const handlePermissionChange = (key: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions!,
                [key]: checked
            }
        }))
        setIsDirty(true)
    }

    const handleSave = async () => {
        if (!selectedRole || !formData) return

        setIsSaving(true)
        try {
            const result = await updateRole(selectedRole.id, formData)
            if (result.success) {
                toast.success("บันทึกข้อมูลเรียบร้อย")
                setRoles(roles.map(r => r.id === selectedRole.id ? result.data : r))
                setSelectedRole(result.data)
                setIsDirty(false)
                router.refresh()
            } else {
                toast.error("บันทึกไม่สำเร็จ: " + result.error)
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการบันทึก")
        } finally {
            setIsSaving(false)
        }
    }

    // Add User to Role
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string>("")

    const handleAssignUser = async () => {
        if (!selectedRole || !selectedUserId) return

        try {
            const result = await assignUserToRole(selectedRole.id, parseInt(selectedUserId))
            if (result.success) {
                toast.success("เพิ่มผู้ใช้เข้าสู่บทบาทเรียบร้อย")
                // Refresh role data to get updated users list - for now simplistic update
                // ideally we fetch the updated role from server or assume success
                // We'll rely on router.refresh() to re-fetch data primarily, 
                // but local state might lag without a fresh fetch. 
                // Let's reload page data or trigger a re-fetch if possible.
                router.refresh()
                setIsAddUserOpen(false)
                setSelectedUserId("")
            } else {
                toast.error("ไม่สามารถเพิ่มผู้ใช้ได้: " + result.error)
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาด")
        }
    }

    const handleRemoveUser = async (userId: number) => {
        if (!confirm("ต้องการลบผู้ใช้ออกจากบทบาทนี้ใช่หรือไม่?")) return
        if (!selectedRole) return

        try {
            const result = await removeUserFromRole(selectedRole.id, userId)
            if (result.success) {
                toast.success("ลบผู้ใช้ออกเรียบร้อย")
                router.refresh()
            } else {
                toast.error("ลบไม่สำเร็จ: " + result.error)
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาด")
        }
    }

    const permissionLabels: Record<string, string> = {
        accessOverview: 'เข้าถึงภาพรวม (Dashboard)',
        accessUserManagement: 'จัดการผู้ใช้งาน (User Management)',
        accessRoomManagement: 'จัดการผังห้องพัก (Room Management)',
        accessOperations: 'จัดการการดำเนินงาน (Operations)',
        accessRepair: 'จัดการรายการแจ้งซ่อม (Repair)',
        accessFinance: 'จัดการการเงิน (Finance)',
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 font-athiti min-h-[calc(100vh-120px)]">
            {/* Sidebar: Role List */}
            <div className="w-full lg:w-1/4 min-w-[250px] space-y-4">
                <Card className="h-full border-none shadow-none bg-transparent">
                    <CardHeader className="px-0 pt-0">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">บทบาททั้งหมด</CardTitle>
                            {/* Create Role Button - implementation simplified for now */}
                            {/* <Button size="sm" variant="outline"><Plus className="h-4 w-4" /></Button> */}
                        </div>
                        <CardDescription>เลือกบทบาทเพื่อจัดการสิทธิ์</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
                            <div className="space-y-2">
                                {roles.map(role => (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleSelect(role)}
                                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${selectedRole?.id === role.id
                                                ? "bg-emerald-50 border-emerald-200 shadow-sm"
                                                : "bg-white border-transparent hover:bg-slate-50"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`font-semibold ${selectedRole?.id === role.id ? "text-emerald-700" : "text-slate-700"}`}>
                                                {role.name}
                                            </span>
                                            {role.key === 'Owner' && <Badge variant="secondary" className="text-[10px]">System</Badge>}
                                        </div>
                                        <div className="text-xs text-slate-500 line-clamp-2">
                                            {role.description}
                                        </div>
                                        <div className="mt-2 text-xs flex items-center gap-1 text-slate-400">
                                            <Users className="h-3 w-3" /> {role.users_count || 0} ผู้ใช้
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6 bg-white rounded-lg border p-6 shadow-sm">
                {selectedRole ? (
                    <>
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Shield className="h-6 w-6 text-emerald-600" />
                                    {formData.name}
                                </h2>
                                <p className="text-slate-500">Key: <code className="bg-slate-100 px-1 rounded">{selectedRole.key}</code></p>
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={!isDirty || isSaving}
                                className={isDirty ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                            >
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                บันทึกการแก้ไข
                            </Button>
                        </div>

                        <Tabs defaultValue="details" className="w-full">
                            <TabsList>
                                <TabsTrigger value="details">ข้อมูลทั่วไป</TabsTrigger>
                                <TabsTrigger value="permissions">สิทธิ์การใช้งาน (Permissions)</TabsTrigger>
                                <TabsTrigger value="users">ผู้ใช้งาน ({selectedRole.users_count || 0})</TabsTrigger>
                            </TabsList>

                            {/* Details Tab */}
                            <TabsContent value="details" className="py-4 space-y-4">
                                <div className="grid gap-4 max-w-xl">
                                    <div className="space-y-2">
                                        <Label>ชื่อบทบาท</Label>
                                        <Input
                                            value={formData.name || ''}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>รายละเอียด</Label>
                                        <Textarea
                                            value={formData.description || ''}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            rows={4}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch
                                            id="is_active"
                                            checked={formData.is_active}
                                            onCheckedChange={(c) => handleInputChange('is_active', c)}
                                        />
                                        <Label htmlFor="is_active">เปิดใช้งานบทบาทนี้</Label>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Permissions Tab */}
                            <TabsContent value="permissions" className="py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(permissionLabels).map(([key, label]) => (
                                        <div key={key} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">{label}</Label>
                                                <p className="text-xs text-slate-500">
                                                    อนุญาตให้เข้าถึงเมนูและจัดการข้อมูลในส่วนนี้
                                                </p>
                                            </div>
                                            <Switch
                                                checked={formData.permissions?.[key as keyof RolePermissions] || false}
                                                onCheckedChange={(checked) => handlePermissionChange(key, checked)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Users Tab */}
                            <TabsContent value="users" className="py-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium">ผู้ใช้งานในบทบาทนี้</h3>
                                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline"><UserPlus className="mr-2 h-4 w-4" /> เพิ่มผู้ใช้</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>เพิ่มผู้ใช้เข้าสู่บทบาท {selectedRole.name}</DialogTitle>
                                                <DialogDescription>
                                                    เลือกผู้ใช้ที่ต้องการกำหนดให้ใช้งานในบทบาทนี้ (ผู้ใช้จะถูกย้ายจากบทบาทเดิม)
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Label>เลือกผู้ใช้งาน</Label>
                                                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="ค้นหาหรือเลือกผู้ใช้..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {users.filter(u => u.role_id !== selectedRole.id).map(user => (
                                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                                {user.name} ({user.username}) - {user.role}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleAssignUser} disabled={!selectedUserId}>ยืนยัน</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="border rounded-md">
                                    {/* Since backend returns role with users included via 'users' relationship if requested, 
                                        we might need to check if 'selectedRole.users' is populated. 
                                        But wait, the `getRoles` action might not include users list by default to save bandwidth?
                                        The controller said `Role::withCount('users')->get()`. It does NOT include `users` list.
                                        So `selectedRole.users` might be undefined.
                                        
                                        We need to FILTER the global `users` props for those with this role_id.
                                    */}
                                    {users.filter(u => u.role_id === selectedRole.id).length > 0 ? (
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                                                <tr>
                                                    <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                                                    <th className="px-4 py-3">Username</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {users.filter(u => u.role_id === selectedRole.id).map(user => (
                                                    <tr key={user.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                                                </Avatar>
                                                                {user.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">{user.username}</td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant={user.isActive ? "default" : "secondary"} className={user.isActive ? "bg-emerald-500" : ""}>
                                                                {user.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleRemoveUser(parseInt(user.id))}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-8 text-center text-slate-500">
                                            ไม่มีผู้ใช้งานในบทบาทนี้
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                        <Shield className="h-16 w-16 opacity-20" />
                        <p>เลือกบทบาทจากเมนูด้านซ้ายเพื่อจัดการ</p>
                    </div>
                )}
            </div>
        </div>
    )
}
