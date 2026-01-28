"use client"

import { useState } from "react"
import { MaintenanceRequest } from "@/types/maintenance"
import { User } from "@/types/user"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, CheckCircle } from "lucide-react"

export default function UpdateMaintenanceModal({ request, user, type, refresh }: { request: MaintenanceRequest, user: User, type: string, refresh: () => void }) {
    const isTechnician = user.role === 'Technician';
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state for Completion
    const [proofImages, setProofImages] = useState<FileList | null>(null);
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseDetails, setExpenseDetails] = useState("");
    const [expenseReceipt, setExpenseReceipt] = useState<File | null>(null);

    const handleAccept = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/maintenances/${request.maintenance_id}/accept`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                refresh();
                setIsOpen(false);
            } else {
                console.error("Failed to accept");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const handleComplete = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            if (proofImages) {
                Array.from(proofImages).forEach((file, index) => {
                    formData.append(`completion_proof_images[${index}]`, file);
                });
            }
            if (expenseAmount) formData.append('expense_amount', expenseAmount);
            if (expenseDetails) formData.append('expense_details', expenseDetails);
            if (expenseReceipt) formData.append('expense_receipt_image', expenseReceipt);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/maintenances/${request.maintenance_id}/complete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            if (res.ok) {
                refresh();
                setIsOpen(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const handlePay = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/maintenances/${request.maintenance_id}/pay`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                refresh();
                setIsOpen(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                    ดูรายละเอียด {isTechnician && request.status === 'pending' && "(กดรับงาน)"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>รายละเอียดการแจ้งซ่อม: ห้อง {request.room?.room_number || request.room_id}</DialogTitle>
                    <DialogDescription>
                        แจ้งเมื่อ: {new Date(request.report_date).toLocaleDateString('th-TH')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>หัวข้อ/อาการ</Label>
                            <div className="font-medium text-sm mt-1">{request.repair_type}</div>
                        </div>
                        <div>
                            <Label>สถานะ</Label>
                            <div className="mt-1">
                                <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                                    {request.status === 'pending' ? 'รอแจ้งซ่อม' :
                                        request.status === 'in_progress' ? 'กำลังดำเนินการ' : 'เสร็จสิ้น'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>รายละเอียด</Label>
                        <div className="mt-1 p-3 bg-slate-50 rounded-md text-sm border">
                            {request.damage_details}
                        </div>
                    </div>

                    {request.report_images && request.report_images.length > 0 && (
                        <div>
                            <Label>รูปภาพความเสียหาย (จากผู้แจ้ง)</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {request.report_images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-video bg-slate-100 rounded-md overflow-hidden">
                                        <img src={`http://localhost:8000/storage/${img}`} alt="Report" className="object-cover w-full h-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Technician Actions */}
                    {isTechnician && request.status === 'pending' && (
                        <div className="pt-4 border-t">
                            <Button className="w-full" onClick={handleAccept} disabled={loading}>
                                {loading ? 'กำลังบันทึก...' : 'กดรับงาน'}
                            </Button>
                        </div>
                    )}

                    {isTechnician && request.status === 'in_progress' && (
                        <div className="pt-4 border-t space-y-4">
                            <h4 className="font-semibold flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                ส่งงานซ่อม
                            </h4>

                            <div className="grid gap-4">
                                <div>
                                    <Label>รูปภาพหลังซ่อมเสร็จ (Proof)</Label>
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => setProofImages(e.target.files)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>ค่าแรง/ค่าอุปกรณ์ (บาท)</Label>
                                        <Input
                                            type="number"
                                            value={expenseAmount}
                                            onChange={(e) => setExpenseAmount(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <Label>สลิป/หลักฐานค่าใช้จ่าย</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setExpenseReceipt(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>รายละเอียดค่าใช้จ่ายเพิ่มเติม</Label>
                                    <Textarea
                                        value={expenseDetails}
                                        onChange={(e) => setExpenseDetails(e.target.value)}
                                        placeholder="ระบุรายการอุปกรณ์ที่ซื้อ..."
                                    />
                                </div>

                                <Button className="w-full" onClick={handleComplete} disabled={loading}>
                                    {loading ? 'กำลังส่งข้อมูล...' : 'ยืนยันการปิดงาน'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Completed View - Show expense details and proofs */}
                    {request.status === 'completed' && (
                        <div className="pt-4 border-t space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">สรุปการซ่อม</h4>
                                {request.completion_proof_images && request.completion_proof_images.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {request.completion_proof_images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-video bg-slate-100 rounded-md overflow-hidden">
                                                <img src={`http://localhost:8000/storage/${img}`} alt="Proof" className="object-cover w-full h-full" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">ไม่มีรูปภาพยืนยัน</p>
                                )}
                            </div>

                            {(isTechnician || user.role === 'Admin' || user.role === 'Manager') && (
                                <div className="bg-slate-50 p-4 rounded-md border text-sm space-y-2">
                                    <div className="font-semibold">ข้อมูลค่าใช้จ่าย</div>
                                    <div className="flex justify-between">
                                        <span>ยอดรวม:</span>
                                        <span className="font-bold">{request.expense_amount || 0} บาท</span>
                                    </div>
                                    {request.expense_details && (
                                        <div className="text-slate-600">{request.expense_details}</div>
                                    )}
                                    {request.expense_receipt_image && (
                                        <div className="mt-2">
                                            <div className="text-xs mb-1">หลักฐานการจ่าย:</div>
                                            <div className="h-24 w-auto relative inline-block border rounded">
                                                <img src={`http://localhost:8000/storage/${request.expense_receipt_image}`} alt="Receipt" className="h-full object-contain" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Admin Payment Action */}
                            {!isTechnician && request.status === 'completed' && request.payment_status !== 'paid' && (
                                <Button className="w-full mt-2" onClick={handlePay} disabled={loading}>
                                    ยืนยันการจ่ายค่าแรง/อุปกรณ์
                                </Button>
                            )}

                            {request.payment_status === 'paid' && (
                                <div className="mt-2 text-center text-green-600 font-bold border p-2 rounded bg-green-50">
                                    จ่ายแล้ว
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
