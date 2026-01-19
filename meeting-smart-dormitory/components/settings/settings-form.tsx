"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { updateSettings } from "@/actions/settings-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface SettingsFormProps {
    initialSettings: Record<string, any>
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialTab = searchParams.get('tab') || 'general'

    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState(initialSettings)
    const [activeTab, setActiveTab] = useState(initialTab)

    // Sync state if initialSettings change (e.g. revalidation)
    useEffect(() => {
        setSettings(initialSettings)
    }, [initialSettings])

    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab) {
            setActiveTab(tab)
        }
    }, [searchParams])

    const handleTabChange = (val: string) => {
        setActiveTab(val)
        // Optionally push to URL so it's shareable, but replace to avoid history stack buildup
        router.replace(`/dashboard/settings?tab=${val}`)
    }

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const result = await updateSettings(settings)
            if (result.success) {
                toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว")
                router.refresh()
            } else {
                toast.error("เกิดข้อผิดพลาด: " + result.error)
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการบันทึก")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">ตั้งค่าระบบ (System Settings)</h2>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </Button>
            </div>



            {/* General Information */}
            {activeTab === "general" && (
                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลทั่วไป (General Information)</CardTitle>
                        <CardDescription>
                            ข้อมูลนี้จะถูกแสดงบนหัวบิลและเอกสารต่างๆ
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="dorm_name_th">ชื่อหอพัก (ภาษาไทย)</Label>
                            <Input
                                id="dorm_name_th"
                                value={settings.dorm_name_th || ''}
                                onChange={(e) => handleChange('dorm_name_th', e.target.value)}
                                placeholder="เช่น หอพักตัวอย่าง"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dorm_name_en">ชื่อหอพัก (ภาษาอังกฤษ)</Label>
                            <Input
                                id="dorm_name_en"
                                value={settings.dorm_name_en || ''}
                                onChange={(e) => handleChange('dorm_name_en', e.target.value)}
                                placeholder="e.g. Example Dormitory"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>ที่อยู่</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50/50">
                                <div className="grid gap-2">
                                    <Label htmlFor="dorm_addr_no" className="text-xs text-muted-foreground">เลขที่ / หมู่บ้าน</Label>
                                    <Input
                                        id="dorm_addr_no"
                                        value={settings.dorm_addr_no || ''}
                                        onChange={(e) => handleChange('dorm_addr_no', e.target.value)}
                                        placeholder="เช่น 123/4 หมู่ 5"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dorm_addr_street" className="text-xs text-muted-foreground">ถนน / ซอย</Label>
                                    <Input
                                        id="dorm_addr_street"
                                        value={settings.dorm_addr_street || ''}
                                        onChange={(e) => handleChange('dorm_addr_street', e.target.value)}
                                        placeholder="เช่น ถ.พหลโยธิน"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dorm_addr_subdistrict" className="text-xs text-muted-foreground">ตำบล / แขวง</Label>
                                    <Input
                                        id="dorm_addr_subdistrict"
                                        value={settings.dorm_addr_subdistrict || ''}
                                        onChange={(e) => handleChange('dorm_addr_subdistrict', e.target.value)}
                                        placeholder="เช่น ต.คลองหนึ่ง"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dorm_addr_district" className="text-xs text-muted-foreground">อำเภอ / เขต</Label>
                                    <Input
                                        id="dorm_addr_district"
                                        value={settings.dorm_addr_district || ''}
                                        onChange={(e) => handleChange('dorm_addr_district', e.target.value)}
                                        placeholder="เช่น อ.คลองหลวง"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dorm_addr_province" className="text-xs text-muted-foreground">จังหวัด</Label>
                                    <Input
                                        id="dorm_addr_province"
                                        value={settings.dorm_addr_province || ''}
                                        onChange={(e) => handleChange('dorm_addr_province', e.target.value)}
                                        placeholder="เช่น ปทุมธานี"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dorm_addr_zip" className="text-xs text-muted-foreground">รหัสไปรษณีย์</Label>
                                    <Input
                                        id="dorm_addr_zip"
                                        value={settings.dorm_addr_zip || ''}
                                        onChange={(e) => handleChange('dorm_addr_zip', e.target.value)}
                                        placeholder="เช่น 12120"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                                <Input
                                    id="phone"
                                    value={settings.phone || ''}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    placeholder="08x-xxx-xxxx"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tax_id">เลขประจำตัวผู้เสียภาษี (ถ้ามี)</Label>
                                <Input
                                    id="tax_id"
                                    value={settings.tax_id || ''}
                                    onChange={(e) => handleChange('tax_id', e.target.value)}
                                    placeholder=""
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="logo_url">ลิงค์โลโก้ (Logo URL)</Label>
                            <Input
                                id="logo_url"
                                value={settings.logo_url || ''}
                                onChange={(e) => handleChange('logo_url', e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Financial Settings */}
            {activeTab === "finance" && (
                <Card>
                    <CardHeader>
                        <CardTitle>การเงินและบัญชี (Financial Settings)</CardTitle>
                        <CardDescription>
                            กำหนดอัตราค่าน้ำ ค่าไฟ และข้อมูลการชำระเงิน
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Water Settings */}
                            <div className="space-y-3 p-4 border rounded-lg bg-slate-50/50">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold text-blue-700">ค่าน้ำประปา</Label>
                                    <div className="flex items-center bg-slate-200 rounded-lg p-1 gap-1">
                                        <button
                                            onClick={() => handleChange('water_calc_type', 'unit')}
                                            className={`px-3 py-1 text-sm rounded-md transition-all ${(!settings.water_calc_type || settings.water_calc_type === 'unit')
                                                ? 'bg-white shadow text-blue-700 font-medium'
                                                : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            ตามหน่วย
                                        </button>
                                        <button
                                            onClick={() => handleChange('water_calc_type', 'flat')}
                                            className={`px-3 py-1 text-sm rounded-md transition-all ${settings.water_calc_type === 'flat'
                                                ? 'bg-white shadow text-blue-700 font-medium'
                                                : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            เหมาจ่าย
                                        </button>
                                    </div>
                                </div>

                                {(!settings.water_calc_type || settings.water_calc_type === 'unit') ? (
                                    <div className="grid gap-2">
                                        <Label htmlFor="water_unit_price">ราคาต่อหน่วย (บาท)</Label>
                                        <Input
                                            id="water_unit_price"
                                            type="number"
                                            value={settings.water_unit_price || ''}
                                            onChange={(e) => handleChange('water_unit_price', e.target.value)}
                                            placeholder="Ex. 18"
                                        />
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        <Label htmlFor="water_flat_price">ราคาเหมาจ่าย (บาท/เดือน)</Label>
                                        <Input
                                            id="water_flat_price"
                                            type="number"
                                            value={settings.water_flat_price || ''}
                                            onChange={(e) => handleChange('water_flat_price', e.target.value)}
                                            placeholder="Ex. 100"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Electric Settings */}
                            <div className="space-y-3 p-4 border rounded-lg bg-slate-50/50">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold text-amber-700">ค่าไฟฟ้า</Label>
                                    <div className="flex items-center bg-slate-200 rounded-lg p-1 gap-1">
                                        <button
                                            onClick={() => handleChange('electric_calc_type', 'unit')}
                                            className={`px-3 py-1 text-sm rounded-md transition-all ${(!settings.electric_calc_type || settings.electric_calc_type === 'unit')
                                                ? 'bg-white shadow text-amber-700 font-medium'
                                                : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            ตามหน่วย
                                        </button>
                                        <button
                                            onClick={() => handleChange('electric_calc_type', 'flat')}
                                            className={`px-3 py-1 text-sm rounded-md transition-all ${settings.electric_calc_type === 'flat'
                                                ? 'bg-white shadow text-amber-700 font-medium'
                                                : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            เหมาจ่าย
                                        </button>
                                    </div>
                                </div>

                                {(!settings.electric_calc_type || settings.electric_calc_type === 'unit') ? (
                                    <div className="grid gap-2">
                                        <Label htmlFor="electric_unit_price">ราคาต่อหน่วย (บาท)</Label>
                                        <Input
                                            id="electric_unit_price"
                                            type="number"
                                            value={settings.electric_unit_price || ''}
                                            onChange={(e) => handleChange('electric_unit_price', e.target.value)}
                                            placeholder="Ex. 8"
                                        />
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        <Label htmlFor="electric_flat_price">ราคาเหมาจ่าย (บาท/เดือน)</Label>
                                        <Input
                                            id="electric_flat_price"
                                            type="number"
                                            value={settings.electric_flat_price || ''}
                                            onChange={(e) => handleChange('electric_flat_price', e.target.value)}
                                            placeholder="Ex. 500"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="common_fee">ค่าส่วนกลาง (บาท/เดือน)</Label>
                                <Input
                                    id="common_fee"
                                    type="number"
                                    value={settings.common_fee || ''}
                                    onChange={(e) => handleChange('common_fee', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="due_date">วันที่ครบกำหนดชำระ (ของทุกเดือน)</Label>
                                <Input
                                    id="due_date"
                                    type="number"
                                    min="1" max="28"
                                    value={settings.due_date || ''}
                                    onChange={(e) => handleChange('due_date', e.target.value)}
                                    placeholder="เช่น 5"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="late_fee_daily">ค่าปรับล่าช้า (บาท/วัน)</Label>
                            <Input
                                id="late_fee_daily"
                                type="number"
                                value={settings.late_fee_daily || ''}
                                onChange={(e) => handleChange('late_fee_daily', e.target.value)}
                                placeholder="0 หากไม่คิด"
                            />
                        </div>

                        <hr className="my-4" />
                        <h3 className="text-sm font-medium">ข้อมูลบัญชีรับเงิน</h3>
                        <div className="grid gap-2">
                            <Label htmlFor="bank_name">ธนาคาร</Label>
                            <Input
                                id="bank_name"
                                value={settings.bank_name || ''}
                                onChange={(e) => handleChange('bank_name', e.target.value)}
                                placeholder="เช่น กสิกรไทย"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="bank_account_no">เลขที่บัญชี</Label>
                            <Input
                                id="bank_account_no"
                                value={settings.bank_account_no || ''}
                                onChange={(e) => handleChange('bank_account_no', e.target.value)}
                                placeholder="xxx-x-xxxxx-x"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="bank_account_name">ชื่อบัญชี</Label>
                            <Input
                                id="bank_account_name"
                                value={settings.bank_account_name || ''}
                                onChange={(e) => handleChange('bank_account_name', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Notifications */}
            {activeTab === "notification" && (
                <Card>
                    <CardHeader>
                        <CardTitle>การแจ้งเตือน (Notifications)</CardTitle>
                        <CardDescription>
                            เชื่อมต่อกับ LINE Notify เพื่อรับการแจ้งเตือนต่างๆ
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="line_notify_token">LINE Notify Token</Label>
                            <Input
                                id="line_notify_token"
                                type="password"
                                value={settings.line_notify_token || ''}
                                onChange={(e) => handleChange('line_notify_token', e.target.value)}
                                placeholder="วาง Token ที่นี่"
                            />
                            <p className="text-sm text-gray-500">
                                คุณสามารถออก Token ได้ที่ <a href="https://notify-bot.line.me/my/" target="_blank" className="text-blue-500 underline">line.me</a>
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email_notification">อีเมลแจ้งเตือน (Email Notification)</Label>
                            <Input
                                id="email_notification"
                                type="email"
                                value={settings.email_notification || ''}
                                onChange={(e) => handleChange('email_notification', e.target.value)}
                                placeholder="example@domain.com"
                            />
                            <p className="text-sm text-gray-500">
                                ระบุอีเมลที่ต้องการรับการแจ้งเตือนต่างๆ
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
