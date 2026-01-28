"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getSettings } from "@/actions/setting-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { updateSettings } from "@/actions/setting-actions"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ThaiAddressPicker } from "@/components/settings/thai-address-picker"
import { Loader2, Check, AlertCircle, Save, RotateCcw, Trash2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { uploadQrImage } from "@/actions/setting-actions"

export function SettingsForm({ initialSettings, currentUser }: { initialSettings: any, currentUser?: any }) {
    const searchParams = useSearchParams()
    const currentTab = searchParams.get('tab') || 'general'
    const [loading, setLoading] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [pendingChanges, setPendingChanges] = useState<{ key: string, label: string, oldVal: any, newVal: any }[]>([])

    const canEdit = currentUser?.role === 'Manager' || currentUser?.role === 'Admin'

    // Group settings for easier access
    const general = initialSettings.general || {}
    const finance = initialSettings.finance || {}
    const notification = initialSettings.notification || {}

    // Local state for forms
    const [formData, setFormData] = useState({
        // General
        dorm_name: general.dorm_name || '',

        // Address parts
        dorm_address: general.dorm_address || '', // Full string for legacy/display
        dorm_details: general.dorm_details || general.dorm_address || '', // Default detail to full if missing
        dorm_province: general.dorm_province || '',
        dorm_amphoe: general.dorm_amphoe || '',
        dorm_district: general.dorm_district || '',
        dorm_zipcode: general.dorm_zipcode || '',

        dorm_phone: general.dorm_phone || '',
        dorm_line_id: general.dorm_line_id || '',
        dorm_email: general.dorm_email || '',
        dorm_facebook: general.dorm_facebook || '',
        tax_id: general.tax_id || '',
        promptpay_number: finance.promptpay_number || general.promptpay_number || '', // Moved to finance, check both
        promptpay_name: finance.promptpay_name || general.promptpay_name || '', // Moved to finance, check both
        promptpay_qr_image: finance.promptpay_qr_image || '',

        // Finance
        water_unit_price: finance.water_unit_price || '',
        electric_unit_price: finance.electric_unit_price || '',

        // Notification
        line_notify_token: notification.line_notify_token || '',
        enable_email_notify: notification.enable_email_notify === '1' || notification.enable_email_notify === true
    })

    const [qrFile, setQrFile] = useState<File | null>(null)
    const [qrPreview, setQrPreview] = useState<string | null>(null)

    // Strict Manager check for Payment Info
    const isManager = currentUser?.role === 'Manager'

    // Fetch fresh settings on mount to ensure data persistence after refresh
    useEffect(() => {
        const fetchLatestSettings = async () => {
            try {
                const data = await getSettings()
                if (data) {
                    const general = data.general || {}
                    const finance = data.finance || {}
                    const notification = data.notification || {}

                    setFormData(prev => ({
                        ...prev,
                        dorm_name: general.dorm_name || prev.dorm_name,
                        dorm_address: general.dorm_address || prev.dorm_address,
                        dorm_details: general.dorm_details || general.dorm_address || prev.dorm_details,
                        dorm_province: general.dorm_province || prev.dorm_province,
                        dorm_amphoe: general.dorm_amphoe || prev.dorm_amphoe,
                        dorm_district: general.dorm_district || prev.dorm_district,
                        dorm_zipcode: general.dorm_zipcode || prev.dorm_zipcode,
                        dorm_phone: general.dorm_phone || prev.dorm_phone,
                        dorm_line_id: general.dorm_line_id || prev.dorm_line_id,
                        dorm_email: general.dorm_email || prev.dorm_email,
                        dorm_facebook: general.dorm_facebook || prev.dorm_facebook,
                        tax_id: general.tax_id || prev.tax_id,
                        promptpay_number: finance.promptpay_number || general.promptpay_number || prev.promptpay_number,
                        promptpay_name: finance.promptpay_name || general.promptpay_name || prev.promptpay_name,
                        promptpay_qr_image: finance.promptpay_qr_image || prev.promptpay_qr_image,
                        water_unit_price: finance.water_unit_price || prev.water_unit_price,
                        electric_unit_price: finance.electric_unit_price || prev.electric_unit_price,
                        line_notify_token: notification.line_notify_token || prev.line_notify_token,
                        enable_email_notify: (notification.enable_email_notify !== undefined) ? (notification.enable_email_notify === '1' || notification.enable_email_notify === true) : prev.enable_email_notify
                    }))

                    if (finance.promptpay_qr_image) {
                        setQrPreview(finance.promptpay_qr_image)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch fresh settings:", error)
            }
        }

        fetchLatestSettings()
    }, [])

    const handleChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleDetailChange = (val: string) => {
        setFormData(prev => {
            const fullAddress = [
                val,
                prev.dorm_district ? `ต.${prev.dorm_district}` : '',
                prev.dorm_amphoe ? `อ.${prev.dorm_amphoe}` : '',
                prev.dorm_province ? `จ.${prev.dorm_province}` : '',
                prev.dorm_zipcode
            ].filter(Boolean).join(' ')
            return { ...prev, dorm_details: val, dorm_address: fullAddress }
        })
    }

    const handleAddressPartsChange = (parts: { province: string, amphoe: string, district: string, zipcode: string }) => {
        setFormData(prev => {
            const newData = {
                ...prev,
                dorm_province: parts.province,
                dorm_amphoe: parts.amphoe,
                dorm_district: parts.district,
                dorm_zipcode: parts.zipcode
            }
            const fullAddress = [
                newData.dorm_details,
                newData.dorm_district ? `ต.${newData.dorm_district}` : '',
                newData.dorm_amphoe ? `อ.${newData.dorm_amphoe}` : '',
                newData.dorm_province ? `จ.${newData.dorm_province}` : '',
                newData.dorm_zipcode
            ].filter(Boolean).join(' ')

            return { ...newData, dorm_address: fullAddress }
        })
    }

    // Map keys to readable labels
    const fieldLabels: Record<string, string> = {
        dorm_name: 'ชื่อหอพัก',
        dorm_details: 'ที่อยู่ (รายละเอียด)',
        dorm_province: 'จังหวัด',
        dorm_amphoe: 'อำเภอ',
        dorm_district: 'ตำบล',
        dorm_zipcode: 'รหัสไปรษณีย์',
        dorm_address: 'ที่อยู่เต็ม',
        dorm_phone: 'เบอร์โทรศัพท์ติดต่อ',
        dorm_line_id: 'Line ID',
        dorm_email: 'อีเมล',
        dorm_facebook: 'Facebook Page',
        tax_id: 'เลขประจำตัวผู้เสียภาษี',
        promptpay_number: 'เบอร์/ID พร้อมเพย์',
        promptpay_name: 'ชื่อบัญชีพร้อมเพย์',
        water_unit_price: 'ค่าน้ำ (บาท/หน่วย)',
        electric_unit_price: 'ค่าไฟ (บาท/หน่วย)',
        line_notify_token: 'Line Notify Token',
        enable_email_notify: 'แจ้งเตือนทางอีเมล',
        promptpay_qr_image: 'QR Code รับเงิน'
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setQrFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setQrPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            // Clean preview logic: this is just local.
            handleChange('promptpay_qr_image', 'changed') // Mark as changed to trigger save flow if needed
        }
    }

    const removeQrImage = () => {
        setQrFile(null)
        setQrPreview(null)
        setFormData(prev => ({ ...prev, promptpay_qr_image: '' }))
    }

    const handlePreSave = () => {
        const changes: { key: string, label: string, oldVal: any, newVal: any }[] = []

        // Compare with initial settings
        const flattenedInitial = {
            ...general,
            ...finance,
            ...notification,
            enable_email_notify: notification.enable_email_notify === '1' || notification.enable_email_notify === true
        }

        Object.entries(formData).forEach(([key, newVal]) => {
            const oldVal = flattenedInitial[key] !== undefined ? flattenedInitial[key] : ''

            // Loose equality check for strings/numbers/booleans
            if (String(newVal) !== String(oldVal)) {
                // If oldVal is undefined/null and newVal is empty string, ignore
                if (!oldVal && newVal === '') return

                changes.push({
                    key,
                    label: fieldLabels[key] || key,
                    oldVal: oldVal === true ? 'เปิด' : oldVal === false ? 'ปิด' : (oldVal || '-'),
                    newVal: newVal === true ? 'เปิด' : newVal === false ? 'ปิด' : (newVal || '-')
                })
            }
        })

        if (changes.length === 0) {
            toast.info("ไม่มีการเปลี่ยนแปลงข้อมูล")
            return
        }

        setPendingChanges(changes)
        setIsConfirmOpen(true)
    }

    const handleConfirmSave = async () => {
        setLoading(true)
        try {
            // Map keys to their groups
            const keyGroups: Record<string, string> = {
                // Finance
                water_unit_price: 'finance',
                electric_unit_price: 'finance',

                // Notification
                line_notify_token: 'notification',
                enable_email_notify: 'notification',

                // Default others to general (Explicitly listing for clarity or catch-all)
                promptpay_number: 'finance',
                promptpay_name: 'finance',
                promptpay_qr_image: 'finance',
            }

            // Upload QR if exists
            let qrUrl = formData.promptpay_qr_image
            if (qrFile) {
                const formDataUpload = new FormData()
                formDataUpload.append('image', qrFile)
                const uploadRes = await uploadQrImage(formDataUpload)
                if (uploadRes.success) {
                    qrUrl = uploadRes.url
                } else {
                    throw new Error('Upload failed: ' + uploadRes.error)
                }
            }

            // Update formData with new URL if uploaded
            const finalFormData = { ...formData, promptpay_qr_image: qrUrl }

            // Prepare payload
            const payload = Object.entries(finalFormData).map(([key, value]) => ({
                key,
                value: typeof value === 'boolean' ? (value ? '1' : '0') : value,
                group: keyGroups[key] || 'general'
            }))

            const result = await updateSettings(payload)
            if (result && result.success) {
                toast.success("บันทึกการตั้งค่าเรียบร้อย")
                setIsConfirmOpen(false)
            } else {
                console.error("Save failed:", result)
                toast.error(`บันทึกไม่สำเร็จ: ${result?.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error(error)
            toast.error("บันทึกไม่สำเร็จ (Network Error)")
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setFormData({
            dorm_name: general.dorm_name || '',
            dorm_address: general.dorm_address || '',
            dorm_details: general.dorm_details || general.dorm_address || '',
            dorm_province: general.dorm_province || '',
            dorm_amphoe: general.dorm_amphoe || '',
            dorm_district: general.dorm_district || '',
            dorm_zipcode: general.dorm_zipcode || '',
            dorm_phone: general.dorm_phone || '',
            dorm_line_id: general.dorm_line_id || '',
            dorm_email: general.dorm_email || '',
            dorm_facebook: general.dorm_facebook || '',
            tax_id: general.tax_id || '',
            promptpay_number: general.promptpay_number || '',
            promptpay_name: general.promptpay_name || '',
            promptpay_qr_image: finance.promptpay_qr_image || general.promptpay_qr_image || '',
            water_unit_price: finance.water_unit_price || '',
            electric_unit_price: finance.electric_unit_price || '',
            line_notify_token: notification.line_notify_token || '',
            enable_email_notify: notification.enable_email_notify === '1' || notification.enable_email_notify === true
        })
        setQrFile(null)
        setQrPreview(finance.promptpay_qr_image || null)
        toast.info("คืนค่าข้อมูลเดิมเรียบร้อย")
    }

    const handleClear = () => {
        if (!confirm("คุณต้องการล้างข้อมูลทั้งหมดใช่หรือไม่?")) return
        setFormData({
            dorm_name: '',
            dorm_address: '',
            dorm_details: '',
            dorm_province: '',
            dorm_amphoe: '',
            dorm_district: '',
            dorm_zipcode: '',
            dorm_phone: '',
            dorm_line_id: '',
            dorm_email: '',
            dorm_facebook: '',
            tax_id: '',
            promptpay_number: '',
            promptpay_name: '',
            promptpay_qr_image: '',
            water_unit_price: '',
            electric_unit_price: '',
            line_notify_token: '',
            enable_email_notify: false
        })
        setQrFile(null)
        setQrPreview(null)
        toast.warning("ล้างข้อมูลเรียบร้อย")
    }

    // Wrap Input/Select to be disabled if !canEdit
    const isReadOnly = !canEdit

    return (
        <div className="w-full space-y-4">
            {/* General Tab */}
            {currentTab === 'general' && (
                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลทั่วไป</CardTitle>
                        <CardDescription>รายละเอียดเกี่ยวกับหอพัก</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>ชื่อหอพัก</Label>
                            <Input
                                value={formData.dorm_name}
                                onChange={e => handleChange('dorm_name', e.target.value)}
                                disabled={isReadOnly}
                            />
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="grid gap-2">
                                <Label>ที่อยู่ (บ้านเลขที่ / ซอย / ถนน)</Label>
                                <Input
                                    value={formData.dorm_details}
                                    onChange={e => handleDetailChange(e.target.value)}
                                    placeholder="เช่น 123/4 หมู่ 5 ซอย..."
                                    disabled={isReadOnly}
                                />
                            </div>

                            <ThaiAddressPicker
                                value={{
                                    province: formData.dorm_province,
                                    amphoe: formData.dorm_amphoe,
                                    district: formData.dorm_district,
                                    zipcode: formData.dorm_zipcode
                                }}
                                onChange={handleAddressPartsChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>เบอร์โทรศัพท์ติดต่อ</Label>
                                <Input
                                    value={formData.dorm_phone}
                                    onChange={e => handleChange('dorm_phone', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>อีเมล (Email)</Label>
                                <Input
                                    value={formData.dorm_email}
                                    onChange={e => handleChange('dorm_email', e.target.value)}
                                    placeholder="example@dorm.com"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Line ID</Label>
                                <Input
                                    value={formData.dorm_line_id}
                                    onChange={e => handleChange('dorm_line_id', e.target.value)}
                                    placeholder="@yourdorm"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Facebook Page</Label>
                                <Input
                                    value={formData.dorm_facebook}
                                    onChange={e => handleChange('dorm_facebook', e.target.value)}
                                    placeholder="facebook.com/yourdorm"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>เลขประจำตัวผู้เสียภาษี (Tax ID)</Label>
                            <Input
                                value={formData.tax_id}
                                onChange={e => handleChange('tax_id', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            )
            }

            {/* Finance Tab */}
            {
                currentTab === 'finance' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>ตั้งค่าค่าใช้จ่าย</CardTitle>
                            <CardDescription>กำหนดราคาต่อหน่วยสำหรับค่าน้ำและค่าไฟ</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>ค่าน้ำ (บาท/หน่วย)</Label>
                                <Input
                                    type="number"
                                    value={formData.water_unit_price}
                                    onChange={e => handleChange('water_unit_price', e.target.value)}
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>ค่าไฟ (บาท/หน่วย)</Label>
                                <Input
                                    type="number"
                                    value={formData.electric_unit_price}
                                    onChange={e => handleChange('electric_unit_price', e.target.value)}
                                    disabled={isReadOnly}
                                />
                            </div>

                            {/* Payment Info Section - Moved here, Restricted to Manager */}
                            <div className="border-t pt-4 mt-4">
                                <h3 className="font-semibold mb-3 text-sm text-slate-600 flex items-center gap-2">
                                    ข้อมูลการรับชำระเงิน (พร้อมเพย์)
                                    {!isManager && <span className="text-xs font-normal text-red-400">(แก้ไขได้เฉพาะผู้จัดการ)</span>}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                    {/* Left Column: Input Fields */}
                                    <div className="space-y-6">
                                        <div className="grid gap-2">
                                            <Label className="text-base text-slate-700">เบอร์โทรศัพท์ / เลขบัตรประชาชน (PromptPay ID)</Label>
                                            <Input
                                                value={formData.promptpay_number}
                                                onChange={e => handleChange('promptpay_number', e.target.value)}
                                                placeholder="08xxxxxxxx / 1xxxxxxxxxxxx"
                                                disabled={!isManager}
                                                className="h-12 text-base"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-base text-slate-700">ชื่อบัญชีผู้รับเงิน (Account Name)</Label>
                                            <Input
                                                value={formData.promptpay_name}
                                                onChange={e => handleChange('promptpay_name', e.target.value)}
                                                placeholder="นาย/นาง/บริษัท..."
                                                disabled={!isManager}
                                                className="h-12 text-base"
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column: QR Code Display */}
                                    <div className="flex flex-col items-center md:items-start gap-4">
                                        <Label className="text-base text-slate-700 w-full text-left">QR Code รับเงิน (สำหรับใบแจ้งหนี้)</Label>

                                        <div className="relative group w-full max-w-[280px]">
                                            {qrPreview ? (
                                                <div className="relative w-full aspect-square bg-slate-50 border-2 rounded-lg overflow-hidden">
                                                    <img src={qrPreview} alt="QR Preview" className="w-full h-full object-contain" />
                                                    {isManager && (
                                                        <button
                                                            onClick={removeQrImage}
                                                            type="button"
                                                            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 rounded-full p-2 shadow-sm transition-all"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-full aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                                    <div className="p-4 bg-slate-100 rounded-full mb-3">
                                                        <Upload className="h-8 w-8 text-slate-400" />
                                                    </div>
                                                    <span className="text-sm">No QR Image</span>
                                                </div>
                                            )}
                                        </div>

                                        {isManager && (
                                            <div className="flex flex-col items-center md:items-center gap-3 w-full max-w-[280px]">
                                                <Label htmlFor="qr-upload" className="cursor-pointer">
                                                    <div className="flex items-center gap-2 px-6 py-2.5 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-sm bg-white">
                                                        <Upload className="h-4 w-4" />
                                                        อัพโหลดรูปภาพ
                                                    </div>
                                                    <Input
                                                        id="qr-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                    />
                                                </Label>
                                                <p className="text-xs text-slate-400 text-center">
                                                    รองรับไฟล์ภาพ .jpg, .png<br />ขนาดไม่เกิน 2MB
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card >
                )
            }

            {/* Notification Tab */}
            {
                currentTab === 'notification' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>การแจ้งเตือน</CardTitle>
                            <CardDescription>ตั้งค่าช่องทางการแจ้งเตือน</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="email-notif" className="flex flex-col space-y-1">
                                    <span>แจ้งเตือนทางอีเมล</span>
                                    <span className="font-normal text-xs text-muted-foreground">ส่งอีเมลเมื่อมีการแจ้งหนี้ใหม่</span>
                                </Label>
                                <Switch
                                    id="email-notif"
                                    checked={formData.enable_email_notify}
                                    onCheckedChange={c => handleChange('enable_email_notify', c)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Line Notify Token</Label>
                                <Input
                                    value={formData.line_notify_token}
                                    onChange={e => handleChange('line_notify_token', e.target.value)}
                                    placeholder="วาง Token ที่นี่"
                                />
                                <p className="text-xs text-muted-foreground">ใช้สำหรับแจ้งเตือนไปยังกลุ่มไลน์ หรือบัญชีไลน์ส่วนตัว</p>
                            </div>
                        </CardContent>
                    </Card>
                )
            }

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                {canEdit ? (
                    <>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleReset} type="button" className="text-slate-600">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                คืนค่าเดิม
                            </Button>
                            <Button variant="ghost" onClick={handleClear} type="button" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="mr-2 h-4 w-4" />
                                ล้างข้อมูล
                            </Button>
                        </div>
                        <Button onClick={handlePreSave} disabled={loading} className="bg-slate-900 text-white hover:bg-slate-800">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            บันทึกการเปลี่ยนแปลง
                        </Button>
                    </>
                ) : (
                    <div className="w-full text-center text-muted-foreground bg-slate-50 p-2 rounded">
                        คุณไม่มีสิทธิ์แก้ไขการตั้งค่า (Admin/Manager Only)
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ยืนยันการบันทึกข้อมูล</DialogTitle>
                        <DialogDescription>
                            กรุณาตรวจสอบรายการที่มีการเปลี่ยนแปลงด้านล่างก่อนยืนยัน
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {pendingChanges.map((change, idx) => (
                            <div key={idx} className="flex flex-col gap-1 text-sm border-b pb-2 last:border-0">
                                <span className="font-semibold text-slate-700">{change.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-red-500 line-through bg-red-50 px-2 rounded">{change.oldVal}</span>
                                    <span className="text-slate-400">→</span>
                                    <span className="text-green-600 font-medium bg-green-50 px-2 rounded">{change.newVal}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleConfirmSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            ยืนยันบันทึก
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
