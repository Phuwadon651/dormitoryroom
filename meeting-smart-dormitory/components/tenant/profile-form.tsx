"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, User, Phone, Mail, MessageCircle, Lock, Save, LogOut } from "lucide-react"
import { toast } from "sonner"
import { updateTenant } from "@/actions/tenant-actions"
import { logout } from "@/actions/auth-actions"

export function ProfileForm({ profile }: { profile: any }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        phone: profile.phone || '',
        email: profile.email || '',
        line_id: profile.line_id || '', // Assuming line_id added to schema or packed in other field
        password: '',
        confirmPassword: ''
    })

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const payload: any = {
                phone: formData.phone,
                email: formData.email,
                // line_id: formData.line_id // If backend supports it
            }

            if (formData.password) {
                if (formData.password !== formData.confirmPassword) {
                    toast.error("รหัสผ่านไม่ตรงกัน")
                    setLoading(false)
                    return
                }
                payload.password = formData.password
            }

            // Using updateTenant which takes (id, data)
            // Note: backend updateTenant logic updates user password if provided in data
            const result = await updateTenant(profile.id, payload)

            if (result.success) {
                toast.success("บันทึกข้อมูลเรียบร้อย")
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
            } else {
                toast.error("บันทึกไม่สำเร็จ: " + result.error)
            }
        } catch (e) {
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white border rounded-xl p-4 space-y-4 shadow-sm">
                <div className="flex items-center gap-4 border-b pb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                        {profile.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">{profile.name}</h2>
                        <p className="text-slate-500 text-sm">ห้อง {profile.room} - {profile.building}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" /> เบอร์โทรศัพท์
                        </Label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" /> อีเมล
                        </Label>
                        <Input
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-slate-400" /> Line ID (ถ้ามี)
                        </Label>
                        <Input
                            value={formData.line_id}
                            onChange={(e) => handleChange('line_id', e.target.value)}
                            placeholder="เช่น @userid"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-xl p-4 space-y-4 shadow-sm">
                <h3 className="font-semibold flex items-center gap-2 text-slate-700">
                    <Lock className="w-4 h-4" /> เปลี่ยนรหัสผ่าน
                </h3>
                <div className="space-y-3">
                    <div className="grid gap-2">
                        <Label>รหัสผ่านใหม่</Label>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
                        />
                    </div>
                    {formData.password && (
                        <div className="grid gap-2">
                            <Label>ยืนยันรหัสผ่านใหม่</Label>
                            <Input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                บันทึกการเปลี่ยนแปลง
            </Button>

            <form action={async () => {
                await logout()
            }}>
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                    <LogOut className="w-4 h-4 mr-2" />
                    ออกจากระบบ
                </Button>
            </form>
        </div>
    )
}
