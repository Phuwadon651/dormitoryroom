"use client"

import { useState } from "react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Wrench, AlertCircle, CheckCircle2, CloudLightning, Droplets, Wind, HelpCircle, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { createMaintenance } from "@/actions/tenant-actions"
import { format } from "date-fns"
import { th } from "date-fns/locale"

export function MaintenanceList({ requests }: { requests: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)

    const [form, setForm] = useState({
        repair_type: '',
        damage_details: '',
    })

    const handleSubmit = async () => {
        if (!form.repair_type || !form.damage_details) {
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วน")
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('repair_type', form.repair_type)
            formData.append('damage_details', form.damage_details)
            formData.append('status', 'Pending')
            formData.append('report_date', new Date().toISOString())
            if (imageFile) {
                formData.append('report_images', imageFile)
            }

            const result = await createMaintenance(formData)
            if (result.success) {
                toast.success("แจ้งซ่อมเรียบร้อยแล้ว")
                setIsOpen(false)
                setForm({ repair_type: '', damage_details: '' })
                setImageFile(null)
            } else {
                toast.error("บันทึกไม่สำเร็จ: " + result.message)
            }
        } catch (e) {
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending': return <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50">รอรับเรื่อง</Badge>
            case 'In Progress': return <Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50">กำลังดำเนินการ</Badge>
            case 'Completed': return <Badge className="bg-green-600 hover:bg-green-700">เสร็จสิ้น</Badge>
            default: return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'Electricity': return <CloudLightning className="w-5 h-5" />
            case 'Water': return <Droplets className="w-5 h-5" />
            case 'Air Conditioning': return <Wind className="w-5 h-5" />
            default: return <Wrench className="w-5 h-5" />
        }
    }

    const translateType = (type: string) => {
        const map: Record<string, string> = {
            'Electricity': 'ไฟฟ้า',
            'Water': 'ประปา',
            'Air Conditioning': 'เครื่องปรับอากาศ',
            'Other': 'อื่นๆ'
        }
        return map[type] || type
    }

    return (
        <div className="p-4 space-y-4 pb-24">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">แจ้งซ่อม</h1>
                <Button size="sm" onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-1" />
                    แจ้งปัญหาใหม่
                </Button>
            </div>

            {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-slate-400 min-h-[50vh] border-2 border-dashed rounded-xl bg-slate-50">
                    <Wrench className="w-12 h-12 mb-4 opacity-20" />
                    <p>ไม่มีรายการแจ้งซ่อม</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map((req) => (
                        <div key={req.maintenance_id || req.id} className="bg-white border rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                                    <div className="p-2 bg-slate-100 rounded-full text-slate-600">
                                        {getIcon(req.repair_type)}
                                    </div>
                                    <span>{translateType(req.repair_type)}</span>
                                </div>
                                {getStatusBadge(req.status)}
                            </div>
                            <p className="text-sm text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg">
                                "{req.damage_details}"
                            </p>
                            <div className="flex justify-between items-center text-xs text-slate-400">
                                <span>แจ้งเมื่อ: {format(new Date(req.report_date || req.created_at), 'd MMM yy HH:mm', { locale: th })}</span>
                                {req.report_images && (
                                    <span className="flex items-center gap-1">
                                        <ImageIcon className="w-3 h-3" />
                                        มีรูปภาพ
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-sm rounded-xl">
                    <DialogHeader>
                        <DialogTitle>แจ้งซ่อม / แจ้งปัญหา</DialogTitle>
                        <DialogDescription>ระบุรายละเอียดปัญหาเพื่อประสานงานช่าง</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>หมวดหมู่ปัญหา</Label>
                            <Select
                                value={form.repair_type}
                                onValueChange={(val) => setForm(prev => ({ ...prev, repair_type: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกหมวดหมู่" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Electricity">⚡ ไฟฟ้า</SelectItem>
                                    <SelectItem value="Water">💧 ประปา</SelectItem>
                                    <SelectItem value="Air Conditioning">❄️ เครื่องปรับอากาศ</SelectItem>
                                    <SelectItem value="Other">🔧 อื่นๆ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>รายละเอียด</Label>
                            <Textarea
                                placeholder="เช่น ไฟห้องน้ำดับ, ท่อน้ำรั่วซึม..."
                                value={form.damage_details}
                                onChange={(e) => setForm(prev => ({ ...prev, damage_details: e.target.value }))}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>รูปภาพประกอบ (ถ้ามี)</Label>
                            <div className="border-2 border-dashed rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                />
                                {imageFile ? (
                                    <div className="text-sm text-green-600 font-medium flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        {imageFile.name}
                                    </div>
                                ) : (
                                    <div className="text-slate-500 flex flex-col items-center gap-2">
                                        <ImageIcon className="w-6 h-6 text-slate-400" />
                                        <span className="text-sm">คลิกเพื่อถ่ายรูป/เลือกรูป</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                            onClick={handleSubmit}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "ส่งแจ้งซ่อม"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
