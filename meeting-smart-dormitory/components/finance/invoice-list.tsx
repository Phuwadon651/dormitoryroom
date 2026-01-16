"use client"

import { useState } from "react"
import { Invoice, Contract } from "@/types/finance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createInvoice } from "@/actions/finance-actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Calculator } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InvoiceListProps {
    initialInvoices: Invoice[]
    contracts: Contract[]
}

export function InvoiceList({ initialInvoices, contracts }: InvoiceListProps) {
    const router = useRouter()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)

    // Form for Generating Invoice
    const [formData, setFormData] = useState({
        contract_id: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        water_prev: 0,
        water_curr: 0,
        water_unit_price: 18,
        electric_prev: 0,
        electric_curr: 0,
        electric_unit_price: 8,
        common_fee: 300,
        parking_fee: 0,
        internet_fee: 0,
        cleaning_fee: 0,
        other_fees: 0
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const selectedContract = contracts.find(c => c.id === formData.contract_id)
        if (!selectedContract) return alert("กรุณาเลือกสัญญา/ห้อง")

        const newInvoice = await createInvoice({
            contract_id: formData.contract_id,
            tenant_name: "Tenant (Demo)", // In real app, fetch from Contract->Tenant
            room_number: selectedContract.room_number,
            month: formData.month,
            year: formData.year,
            water_prev: formData.water_prev,
            water_curr: formData.water_curr,
            water_unit_price: formData.water_unit_price,
            electric_prev: formData.electric_prev,
            electric_curr: formData.electric_curr,
            electric_unit_price: formData.electric_unit_price,
            water_total: 0, // Calculated on server
            electric_total: 0, // Calculated on server
            rent_total: 0, // Calculated on server
            common_fee: formData.common_fee,
            parking_fee: formData.parking_fee,
            internet_fee: formData.internet_fee,
            cleaning_fee: formData.cleaning_fee,
            other_fees: formData.other_fees,
            due_date: new Date(formData.year, formData.month - 1, selectedContract.billing_day + 7).toISOString().split('T')[0]
        })

        setInvoices([...invoices, newInvoice])
        setIsDialogOpen(false)
        router.refresh()
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">รายการใบแจ้งหนี้</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> ออกใบแจ้งหนี้</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>ออกใบแจ้งหนี้ (Invoice)</DialogTitle>
                            <DialogDescription>คำนวณมิเตอร์และค่าใช้จ่ายประจำเดือน</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
                            <div className="col-span-2">
                                <Label>เลือกห้อง/สัญญา</Label>
                                <Select onValueChange={val => setFormData({ ...formData, contract_id: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกห้อง..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contracts.map(c => (
                                            <SelectItem key={c.id} value={c.id}>ห้อง {c.room_number} (ค่าเช่า ฿{c.rent_price})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-1 space-y-2 border p-3 rounded-md">
                                <h4 className="font-semibold flex items-center gap-2"><Calculator className="w-4 h-4" /> มิเตอร์น้ำ</h4>
                                <div>
                                    <Label>เลขครั้งก่อน</Label>
                                    <Input type="number" onChange={e => setFormData({ ...formData, water_prev: Number(e.target.value) })} required />
                                </div>
                                <div>
                                    <Label>เลขครั้งนี้</Label>
                                    <Input type="number" onChange={e => setFormData({ ...formData, water_curr: Number(e.target.value) })} required />
                                </div>
                            </div>

                            <div className="col-span-1 space-y-2 border p-3 rounded-md">
                                <h4 className="font-semibold flex items-center gap-2"><Calculator className="w-4 h-4" /> มิเตอร์ไฟ</h4>
                                <div>
                                    <Label>เลขครั้งก่อน</Label>
                                    <Input type="number" onChange={e => setFormData({ ...formData, electric_prev: Number(e.target.value) })} required />
                                </div>
                                <div>
                                    <Label>เลขครั้งนี้</Label>
                                    <Input type="number" onChange={e => setFormData({ ...formData, electric_curr: Number(e.target.value) })} required />
                                </div>
                            </div>

                            <div className="col-span-2 grid grid-cols-3 gap-2 border p-3 rounded-md bg-slate-50">
                                <h4 className="col-span-3 font-semibold text-sm text-slate-500">ค่าเพิ่มเติม</h4>
                                <div>
                                    <Label className="text-xs">ส่วนกลาง</Label>
                                    <Input type="number" value={formData.common_fee} onChange={e => setFormData({ ...formData, common_fee: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <Label className="text-xs">ที่จอดรถ</Label>
                                    <Input type="number" value={formData.parking_fee} onChange={e => setFormData({ ...formData, parking_fee: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <Label className="text-xs">อินเทอร์เน็ต</Label>
                                    <Input type="number" value={formData.internet_fee} onChange={e => setFormData({ ...formData, internet_fee: Number(e.target.value) })} />
                                </div>
                            </div>

                            <DialogFooter className="col-span-2 pt-4">
                                <Button type="submit">ยืนยันและสร้างบิล</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>งวดเดือน</TableHead>
                            <TableHead>ห้อง</TableHead>
                            <TableHead>ค่าเช่า</TableHead>
                            <TableHead>ค่าน้ำ</TableHead>
                            <TableHead>ค่าไฟ</TableHead>
                            <TableHead>รวมสุทธิ</TableHead>
                            <TableHead>สถานะ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">ยังไม่มีรายการแจ้งหนี้</TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((inv) => (
                                <TableRow key={inv.id}>
                                    <TableCell>{inv.month}/{inv.year}</TableCell>
                                    <TableCell className="font-medium">{inv.room_number}</TableCell>
                                    <TableCell>฿{inv.rent_total.toLocaleString()}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        ฿{inv.water_total} ({inv.water_curr - inv.water_prev} หน่วย)
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        ฿{inv.electric_total} ({inv.electric_curr - inv.electric_prev} หน่วย)
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-800">฿{inv.total_amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={inv.status === 'Paid' ? 'default' : inv.status === 'Pending' ? 'secondary' : 'destructive'}>
                                            {inv.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
