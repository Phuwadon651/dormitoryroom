"use client"

import { useState } from "react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, QrCode, CheckCircle2, Clock, FileText } from "lucide-react"
import { toast } from "sonner"
import { submitPayment } from "@/actions/finance-actions"

export function InvoiceList({ invoices, settings }: { invoices: any[], settings: any }) {
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [isPayOpen, setIsPayOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [slipFile, setSlipFile] = useState<File | null>(null)

    const promptPay = {
        id: settings?.finance?.promptpay_number || settings?.general?.promptpay_number || "",
        name: settings?.finance?.promptpay_name || settings?.general?.promptpay_name || "",
        qrImage: settings?.finance?.promptpay_qr_image || settings?.general?.promptpay_qr_image || ""
    }

    const handleInvoiceClick = (inv: any) => {
        setSelectedInvoice(inv)
        setIsDetailOpen(true)
    }

    const handleOpenPay = () => {
        setIsDetailOpen(false) // Close detail first
        setIsPayOpen(true)
    }

    const handleUpload = async () => {
        if (!slipFile || !selectedInvoice) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("invoice_id", selectedInvoice.id)
            formData.append("amount_paid", selectedInvoice.total_amount.toString()) // Paying full amount
            formData.append("paid_at", new Date().toISOString())
            formData.append("slip_image", slipFile)

            const result = await submitPayment(formData)
            if (result.success) {
                toast.success("ส่งหลักฐานชำระเงินเรียบร้อย")
                setIsPayOpen(false)
                setSlipFile(null)
                // In real app, we should optimistic update the status or refresh
            } else {
                toast.error("ส่งข้อมูลไม่สำเร็จ: " + result.message)
            }
        } catch (e) {
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        } finally {
            setUploading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Paid': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">ชำระแล้ว</Badge>
            case 'Pending': return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">รอชำระ</Badge>
            case 'Overdue': return <Badge variant="destructive">เกินกำหนด</Badge>
            default: return <Badge variant="secondary">{status}</Badge>
        }
    }

    if (invoices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-slate-400 min-h-[50vh]">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p>ยังไม่มีรายการบิล</p>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-3 pb-24">
            <h1 className="text-xl font-bold mb-4">บิลและการชำระเงิน</h1>

            {invoices.map((inv) => (
                <div
                    key={inv.id}
                    onClick={() => handleInvoiceClick(inv)}
                    className="bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm active:scale-95 transition-transform cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${inv.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            {inv.status === 'Paid' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">รอบเดือน {inv.month}/{inv.year}</p>
                            <p className="text-xs text-slate-500">
                                ครบกำหนด {format(new Date(inv.due_date), 'd MMM yy', { locale: th })}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-slate-900">฿{Number(inv.total_amount).toLocaleString()}</p>
                        <div className="mt-1">{getStatusBadge(inv.status)}</div>
                    </div>
                </div>
            ))}

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-sm rounded-xl">
                    <DialogHeader>
                        <DialogTitle>รายละเอียดบิล</DialogTitle>
                        <DialogDescription>รอบเดือน {selectedInvoice?.month}/{selectedInvoice?.year}</DialogDescription>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">ค่าเช่าห้อง</span>
                                    <span>฿{Number(selectedInvoice.rent_total).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">ค่าน้ำ ({selectedInvoice.water_unit_price} บ./หน่วย)</span>
                                    <span>฿{Number(selectedInvoice.water_total).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pl-4 text-xs text-slate-400 border-l mb-1">
                                    <span>มิเตอร์: {selectedInvoice.water_prev} - {selectedInvoice.water_curr}</span>
                                    <span>({selectedInvoice.water_curr - selectedInvoice.water_prev} หน่วย)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">ค่าไฟ ({selectedInvoice.electric_unit_price} บ./หน่วย)</span>
                                    <span>฿{Number(selectedInvoice.electric_total).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pl-4 text-xs text-slate-400 border-l">
                                    <span>มิเตอร์: {selectedInvoice.electric_prev} - {selectedInvoice.electric_curr}</span>
                                    <span>({selectedInvoice.electric_curr - selectedInvoice.electric_prev} หน่วย)</span>
                                </div>
                                {(selectedInvoice.common_fee > 0 || selectedInvoice.parking_fee > 0 || selectedInvoice.internet_fee > 0) && (
                                    <>
                                        <hr className="my-2 border-slate-200" />
                                        {selectedInvoice.common_fee > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">ค่าส่วนกลาง</span>
                                                <span>฿{Number(selectedInvoice.common_fee).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center font-bold">
                                <span>ยอดสุทธิ</span>
                                <span className="text-lg text-blue-600">฿{Number(selectedInvoice.total_amount).toLocaleString()}</span>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                {selectedInvoice.status !== 'Paid' ? (
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleOpenPay}>
                                        แจ้งชำระเงิน
                                    </Button>
                                ) : (
                                    <Button variant="outline" className="w-full text-green-600 border-green-200 bg-green-50 pointer-events-none">
                                        ชำระเงินเรียบร้อยแล้ว
                                    </Button>
                                )}
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Payment Dialog */}
            <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
                <DialogContent className="max-w-sm rounded-xl">
                    <DialogHeader>
                        <DialogTitle>แจ้งชำระเงิน</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* QR Code Section */}
                        <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-white shadow-sm">
                            <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-lg mb-4 relative overflow-hidden">
                                {promptPay.qrImage ? (
                                    <img
                                        src={promptPay.qrImage}
                                        alt="PromptPay QR"
                                        className="w-full h-full object-contain"
                                    />
                                ) : promptPay.id ? (
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${promptPay.id}`}
                                        alt="PromptPay QR"
                                        className="w-full h-full object-contain p-2"
                                    />
                                ) : (
                                    <div className="text-center p-4">
                                        <QrCode className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        <p className="text-xs text-slate-400">ไม่พบข้อมูล PromptPay</p>
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-800">PromptPay</p>
                                <p className="text-sm text-slate-600">{promptPay.id}</p>
                                {promptPay.name && <p className="text-xs text-slate-400">ชื่อบัญชี: {promptPay.name}</p>}
                            </div>
                        </div>

                        {/* Upload Section */}
                        <div className="space-y-2">
                            <Label>แนบสลิปการโอนเงิน</Label>
                            <div className="border-2 border-dashed rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                                />
                                {slipFile ? (
                                    <div className="text-sm text-green-600 font-medium flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        {slipFile.name}
                                    </div>
                                ) : (
                                    <div className="text-slate-500 flex flex-col items-center gap-2">
                                        <Upload className="w-6 h-6 text-slate-400" />
                                        <span className="text-sm">คลิกเพื่ออัปโหลดสลิป</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={!slipFile || uploading}
                            onClick={handleUpload}
                        >
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "ยืนยันการแจ้งชำระ"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
