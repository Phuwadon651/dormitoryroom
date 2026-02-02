"use client"

import { useState } from "react"
import { Payment } from "@/types/finance"
import { Button } from "@/components/ui/button"
import { verifyPayment } from "@/actions/finance-actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaymentListProps {
    initialPayments: Payment[]
}

export function PaymentList({ initialPayments }: PaymentListProps) {
    const router = useRouter()
    const [payments, setPayments] = useState<Payment[]>(initialPayments)
    const [selectedSlip, setSelectedSlip] = useState<string | null>(null)

    const handleVerify = async (id: string, status: 'Paid' | 'Reject') => {
        if (!confirm(`ยืนยันการเปลี่ยนสถานะเป็น ${status}?`)) return

        await verifyPayment(id, status, "Admin")
        setPayments(payments.map(p => p.id === id ? { ...p, status: status } : p))
        router.refresh()
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">ตรวจสอบการชำระเงิน</h3>
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>วันที่โอน</TableHead>
                            <TableHead>ผู้ชำระ</TableHead>
                            <TableHead>ยอดเงิน</TableHead>
                            <TableHead>ช่องทาง</TableHead>
                            <TableHead>หลักฐาน</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">ไม่มีรายการชำระเงิน</TableCell>
                            </TableRow>
                        ) : (
                            payments.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.paid_at}</TableCell>
                                    <TableCell className="font-medium">{p.tenant_name}</TableCell>
                                    <TableCell className="font-bold text-emerald-600">฿{p.amount_paid.toLocaleString()}</TableCell>
                                    <TableCell>{p.payment_method}</TableCell>
                                    <TableCell>
                                        {p.slip_image ? (
                                            <Button
                                                variant="link"
                                                className="h-auto p-0 text-blue-500"
                                                onClick={() => setSelectedSlip(p.slip_image!)}
                                            >
                                                ดูสลิป
                                            </Button>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={p.status === 'Paid' ? 'default' : p.status === 'Reject' ? 'destructive' : 'secondary'}>
                                            {p.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {p.status === 'Pending' && (
                                            <div className="flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => handleVerify(p.id, 'Paid')}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleVerify(p.id, 'Reject')}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Slip View Dialog */}
            {selectedSlip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setSelectedSlip(null)}>
                    <div className="relative max-w-lg w-full p-4" onClick={e => e.stopPropagation()}>
                        <Button
                            variant="ghost"
                            className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                            onClick={() => setSelectedSlip(null)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        <img
                            src={selectedSlip}
                            alt="Payment Slip"
                            className="w-full h-auto rounded-lg shadow-2xl bg-white"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
