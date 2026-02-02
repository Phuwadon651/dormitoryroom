"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MaintenanceRequest } from "@/types/maintenance"
import { User } from "@/types/user"
import { acceptMaintenanceJob, completeMaintenanceJob, assignMaintenanceJob } from "@/actions/maintenance-actions"
import { toast } from "sonner"
import { Loader2, CheckCircle2, FileText, User as UserIcon, Calendar, DollarSign, Wrench } from "lucide-react"

interface MaintenanceDetailDialogProps {
    request: MaintenanceRequest | null
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User
    onSuccess: () => void
    technicians?: User[]
    roomMap?: Record<number, string>
}

export default function MaintenanceDetailDialog({ request, open, onOpenChange, user, onSuccess, technicians = [], roomMap = {} }: MaintenanceDetailDialogProps) {
    if (!request) return null

    const isTechnician = user.role === 'Technician'
    const isManager = ['Admin', 'Manager', 'DormAdmin'].includes(user.role)
    const [isLoading, setIsLoading] = useState(false)

    // Assignment State
    const [selectedTech, setSelectedTech] = useState<string>("")

    // Completion Form State
    const [expenseAmount, setExpenseAmount] = useState("")
    const [expenseDetails, setExpenseDetails] = useState("")
    const [proofImages, setProofImages] = useState<FileList | null>(null)
    const [receiptImage, setReceiptImage] = useState<File | null>(null)

    // Actions
    const handleAcceptJob = async () => {
        setIsLoading(true)
        try {
            const result = await acceptMaintenanceJob(request.maintenance_id)
            if (result.success) {
                toast.success("รับงานซ่อมเรียบร้อยแล้ว")
                onSuccess()
                onOpenChange(false)
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAssignJob = async () => {
        if (!selectedTech) return
        setIsLoading(true)
        try {
            const result = await assignMaintenanceJob(request.maintenance_id, selectedTech)
            if (result.success) {
                toast.success("มอบหมายงานเรียบร้อยแล้ว")
                onSuccess()
                onOpenChange(false)
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCompleteJob = async () => {
        if (!proofImages || (!expenseAmount && isTechnician)) {
            // Basic validation
        }

        setIsLoading(true)
        try {
            const formData = new FormData()
            // Add proof images
            if (proofImages) {
                Array.from(proofImages).forEach((file, index) => {
                    formData.append(`completion_proof_images[${index}]`, file)
                })
            }
            // Add expenses
            formData.append('expense_amount', expenseAmount || "0")
            formData.append('expense_details', expenseDetails || "")
            if (receiptImage) {
                formData.append('expense_receipt_image', receiptImage)
            }
            // Date logic usually handled by backend, but we can send current time if needed
            formData.append('fix_date', new Date().toISOString())

            const result = await completeMaintenanceJob(request.maintenance_id, formData)
            if (result.success) {
                toast.success("บันทึกการซ่อมเสร็จสิ้นและส่งเบิกเรียบร้อย")
                onSuccess()
                onOpenChange(false)
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        } finally {
            setIsLoading(false)
        }
    }

    // Render Logic
    const renderStatusBadge = () => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800",
            in_progress: "bg-blue-100 text-blue-800",
            completed: "bg-green-100 text-green-800"
        }
        const labels = {
            pending: "รอรับงาน",
            in_progress: "กำลังดำเนินการ",
            completed: "เสร็จสิ้น"
        }
        return (
            <Badge className={styles[request.status as keyof typeof styles] || "bg-gray-100"}>
                {labels[request.status as keyof typeof labels] || request.status}
            </Badge>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <DialogTitle className="text-xl">รายละเอียดการแจ้งซ่อม</DialogTitle>
                        {renderStatusBadge()}
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                        <div>
                            <p className="text-sm text-slate-500">ห้องพัก</p>
                            <p className="font-semibold text-lg">ห้อง {request.room?.room_number ?? roomMap?.[request.room_id] ?? request.room_id}</p>
                            <p className="text-xs text-slate-400">ชั้น {request.room?.floor}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">ผู้แจ้ง</p>
                            <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-slate-400" />
                                <span className="font-medium">{request.user?.name || "ไม่ระบุ"}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-sm">{new Date(request.report_date).toLocaleDateString('th-TH')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Problem Details */}
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4" /> รายละเอียดปัญหา
                        </h3>
                        <div className="border rounded-md p-3 bg-white">
                            <p className="font-medium text-blue-600 mb-1">{request.repair_type}</p>
                            <p className="text-slate-600 leading-relaxed">{request.damage_details}</p>
                        </div>
                        {/* Report Images */}
                        {request.report_images && request.report_images.length > 0 && (
                            <div className="mt-3 grid grid-cols-4 gap-2">
                                {request.report_images.map((img: string, i: number) => (
                                    <div key={i} className="aspect-square bg-slate-100 rounded-md overflow-hidden border">
                                        <img src={img} alt="Damage" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Manager Assignment Area */}
                    {isManager && request.status === 'pending' && (
                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg space-y-3">
                            <div className="flex items-center gap-2 text-orange-800 font-bold">
                                <Wrench className="w-5 h-5" /> มอบหมายงานให้ช่าง
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Select value={selectedTech} onValueChange={setSelectedTech}>
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="เลือกช่างซ่อม..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {technicians.map(tech => (
                                                <SelectItem key={tech.id} value={String(tech.id)}>
                                                    {tech.name} ({tech.username})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleAssignJob} disabled={!selectedTech || isLoading} className="bg-orange-600 hover:bg-orange-700 text-white">
                                    {isLoading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : null}
                                    มอบหมายงาน
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Technician Actions Area */}
                    {isTechnician && request.status === 'pending' && (
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex flex-col items-center text-center space-y-3">
                            <Wrench className="w-8 h-8 text-blue-500" />
                            <div>
                                <h4 className="font-bold text-blue-900">รับงานซ่อมนี้?</h4>
                                <p className="text-sm text-blue-700">เมื่อรับงานแล้ว สถานะจะเปลี่ยนเป็น "กำลังดำเนินการ"</p>
                            </div>
                            <Button onClick={handleAcceptJob} disabled={isLoading} className="w-full max-w-xs">
                                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2 w-4 h-4" />}
                                ยืนยันรับงาน
                            </Button>
                        </div>
                    )}

                    {(request.status === 'in_progress' || request.status === 'completed') && request.technician && (
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded text-sm flex items-center gap-2 text-slate-600">
                            <Wrench className="w-4 h-4" />
                            <span>ช่างผู้รับผิดชอบ: <strong>{request.technician.name}</strong></span>
                        </div>
                    )}

                    {isTechnician && request.status === 'in_progress' && (
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="font-bold text-lg">ส่งงาน / แจ้งซ่อมเสร็จ</h3>

                            <div className="space-y-3">
                                <div>
                                    <Label>รูปถ่ายหลังซ่อมเสร็จ (Proof of Work)</Label>
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => setProofImages(e.target.files)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>ค่าใช้จ่าย/ค่าอุปกรณ์ (บาท)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                                            <Input
                                                type="number"
                                                className="pl-8"
                                                placeholder="0.00"
                                                value={expenseAmount}
                                                onChange={(e) => setExpenseAmount(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>รายละเอียดค่าใช้จ่าย</Label>
                                        <Input
                                            placeholder="ค่าอะไหล่, ค่าเดินทาง..."
                                            value={expenseDetails}
                                            onChange={(e) => setExpenseDetails(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>รูปใบเสร็จ/สลิป (ถ้ามี)</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setReceiptImage(e.target.files?.[0] || null)}
                                    />
                                </div>
                            </div>

                            <Button onClick={handleCompleteJob} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2 w-4 h-4" />}
                                ยืนยันซ่อมเสร็จ & ส่งเบิก
                            </Button>
                        </div>
                    )}

                    {/* Completed View (For Manager/Technician) */}
                    {request.status === 'completed' && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-3">
                            <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                                <CheckCircle2 className="w-5 h-5" /> งานซ่อมเสร็จสิ้น
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500 block">วันที่ซ่อมเสร็จ:</span>
                                    <span className="font-medium">{request.fix_date ? new Date(request.fix_date).toLocaleDateString('th-TH') : "-"}</span>
                                </div>
                                {(Number(request.expense_amount || 0) > 0) && user.role.toLowerCase() !== 'tenant' && (
                                    <div>
                                        <span className="text-slate-500 block">ค่าใช้จ่ายที่เบิก:</span>
                                        <span className="font-medium text-red-600">{Number(request.expense_amount).toLocaleString()} บาท</span>
                                    </div>
                                )}
                            </div>
                            {request.completion_proof_images && (
                                <div className="mt-2">
                                    <p className="text-xs text-slate-500 mb-1">รูปผลงาน:</p>
                                    <div className="flex gap-2">
                                        {request.completion_proof_images.map((img: string, i: number) => (
                                            <img key={i} src={img} className="w-16 h-16 rounded object-cover border" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </DialogContent>
        </Dialog>
    )
}

function WrenchIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
    )
}
