"use client"

import { useState, useEffect } from "react"
import { Invoice, Contract } from "@/types/finance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createInvoice, deleteInvoice } from "@/actions/finance-actions"
import { getSettings } from "@/actions/settings-actions"
import { getMeterHistory } from "@/actions/meter-actions"
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
import { Plus, Calculator, Info, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InvoiceListProps {
    initialInvoices: Invoice[]
    contracts: Contract[]
    currentUser: any
}

export function InvoiceList({ initialInvoices, contracts, currentUser }: InvoiceListProps) {
    const router = useRouter()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
    const [settings, setSettings] = useState<any>({})

    const canEdit = currentUser.role === 'Manager' || currentUser.role === 'Admin'

    // Fetch settings on mount or when dialog opens to ensure fresh data
    useEffect(() => {
        if (!isDialogOpen) return // Only refetch when opening dialog to avoid unnecessary calls

        getSettings().then(res => {
            if (res.success) {
                setSettings(res.data)

                const finance = res.data.finance || {}
                const general = res.data.general || {}

                setFormData(prev => ({
                    ...prev,
                    water_unit_price:
                        (finance.water_unit_price !== undefined && !isNaN(Number(finance.water_unit_price))) ? Number(finance.water_unit_price) :
                            (general.water_unit_price !== undefined && !isNaN(Number(general.water_unit_price))) ? Number(general.water_unit_price) :
                                prev.water_unit_price,

                    electric_unit_price:
                        (finance.electric_unit_price !== undefined && !isNaN(Number(finance.electric_unit_price))) ? Number(finance.electric_unit_price) :
                            (general.electric_unit_price !== undefined && !isNaN(Number(general.electric_unit_price))) ? Number(general.electric_unit_price) :
                                prev.electric_unit_price,

                    common_fee:
                        (general.common_fee !== undefined && !isNaN(Number(general.common_fee))) ? Number(general.common_fee) :
                            (finance.common_fee !== undefined && !isNaN(Number(finance.common_fee))) ? Number(finance.common_fee) :
                                prev.common_fee
                }))
            }
        })
    }, [isDialogOpen])

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

    // Watch for Contract/Month/Year changes to auto-fill meter
    useEffect(() => {
        if (!formData.contract_id || !isDialogOpen) return

        const fetchMeterData = async () => {
            const contract = contracts.find(c => c.id === formData.contract_id)
            if (!contract) return

            // Fetch history for this room
            // Note: Contract doesn't directly have room_id on frontend types sometimes, but we mapped it.
            // Let's check if we can get history.
            const history = await getMeterHistory(contract.room_id)

            // Find current reading (match month/year)
            const currentReading = history.find((r: any) => {
                const d = new Date(r.reading_date)
                return d.getMonth() + 1 === formData.month && d.getFullYear() === formData.year
            })

            // Find previous reading (logic: whatever is the latest before current, or specifically previous month?)
            // Usually previous reading is the last recorded reading before the current period.
            // If we have current reading, we use its prev. If not, we look for latest reading generally.
            // Simple logic:
            // 1. If Current Reading Exists: Use its values.
            // 2. If Not: Default current to 0, and prev to latest reading found.

            if (currentReading) {
                // Auto-fill
                setFormData(prev => ({
                    ...prev,
                    water_curr: currentReading.water_meter ?? 0,
                    electric_curr: currentReading.electricity_meter ?? 0,
                }))

                // Find prev reading
                const prevMonthDate = new Date(formData.year, formData.month - 2, 1) // Month is 1-based, so -2 gives prev month index
                const prevReading = history.find((r: any) => {
                    const d = new Date(r.reading_date)
                    return d.getMonth() === prevMonthDate.getMonth() && d.getFullYear() === prevMonthDate.getFullYear()
                })

                if (prevReading) {
                    setFormData(prev => ({
                        ...prev,
                        water_prev: prevReading.water_meter ?? 0,
                        electric_prev: prevReading.electricity_meter ?? 0
                    }))
                } else {
                    // Try to find ANY previous reading if specific month not found
                    const latestPrev = history.find((r: any) => new Date(r.reading_date) < new Date(currentReading.reading_date));
                    if (latestPrev) {
                        setFormData(prev => ({
                            ...prev,
                            water_prev: latestPrev.water_meter ?? 0,
                            electric_prev: latestPrev.electricity_meter ?? 0
                        }))
                    }
                }

            } else {
                // No current reading found
                // Maybe we can find the latest reading to use as 'Previous'
                // history is ordered desc
                if (history.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        water_prev: history[0].water_meter ?? 0,
                        electric_prev: history[0].electricity_meter ?? 0,
                        water_curr: 0,
                        electric_curr: 0
                    }))
                }
            }
        }

        fetchMeterData()
    }, [formData.contract_id, formData.month, formData.year, isDialogOpen])

    const [previewData, setPreviewData] = useState<any>(null)
    const [step, setStep] = useState<'form' | 'preview'>('form')

    const handleReview = (e: React.FormEvent) => {
        e.preventDefault()
        const selectedContract = contracts.find(c => c.id === formData.contract_id)
        if (!selectedContract) return alert("กรุณาเลือกสัญญา/ห้อง")

        const water_total = isWaterFlat ? (settings.water_flat_rate || 0) : (formData.water_curr - formData.water_prev) * formData.water_unit_price
        const electric_total = isElectricFlat ? (settings.electric_flat_rate || 0) : (formData.electric_curr - formData.electric_prev) * formData.electric_unit_price

        const total = selectedContract.rent_price + water_total + electric_total +
            formData.common_fee + formData.parking_fee + formData.internet_fee +
            formData.cleaning_fee + formData.other_fees

        setPreviewData({
            contract: selectedContract,
            water_total,
            electric_total,
            total_amount: total,
            ...formData,
            // Adjust units if flat rate to show 0 or -
            water_units: isWaterFlat ? 0 : formData.water_curr - formData.water_prev,
            electric_units: isElectricFlat ? 0 : formData.electric_curr - formData.electric_prev
        })
        setStep('preview')
    }

    const handleSubmit = async () => {
        if (!previewData) return

        const newInvoice = await createInvoice({
            contract_id: formData.contract_id,
            tenant_name: "Tenant", // Backend handles
            room_number: previewData.contract.room_number,
            month: formData.month,
            year: formData.year,
            water_prev: isWaterFlat ? 0 : formData.water_prev,
            water_curr: isWaterFlat ? 0 : formData.water_curr,
            water_unit_price: formData.water_unit_price,
            electric_prev: isElectricFlat ? 0 : formData.electric_prev,
            electric_curr: isElectricFlat ? 0 : formData.electric_curr,
            electric_unit_price: formData.electric_unit_price,
            water_total: previewData.water_total,
            electric_total: previewData.electric_total,
            rent_total: previewData.contract.rent_price,
            common_fee: formData.common_fee,
            parking_fee: formData.parking_fee,
            internet_fee: formData.internet_fee,
            cleaning_fee: formData.cleaning_fee,
            other_fees: formData.other_fees,
            due_date: new Date(formData.year, formData.month - 1, previewData.contract.billing_day + 7).toISOString().split('T')[0]
        })

        if (newInvoice) {
            setInvoices([...invoices, newInvoice])
            setIsDialogOpen(false)
            setStep('form')
            setPreviewData(null)
            setFormData({ ...formData, contract_id: "" }) // Reset form
            router.refresh()
        } else {
            alert('Failed to create invoice')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("คุณแน่ใจหรือไม่ที่จะลบใบแจ้งหนี้นี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) return

        const res = await deleteInvoice(id)
        if (res.success) {
            setInvoices(invoices.filter(inv => inv.id !== id))
            router.refresh()
        } else {
            alert("ลบไม่สำเร็จ: " + res.error)
        }
    }

    const isWaterFlat = settings.water_calc_type === 'flat'
    const isElectricFlat = settings.electric_calc_type === 'flat'

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">รายการใบแจ้งหนี้</h3>
                {canEdit && (
                    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setStep('form'); }}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> ออกใบแจ้งหนี้</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {step === 'form' ? 'ออกใบแจ้งหนี้ (Invoice)' : 'ยืนยันรายละเอียดใบแจ้งหนี้'}
                                </DialogTitle>
                                <DialogDescription>
                                    {step === 'form' ? 'กรอกข้อมูลมิเตอร์และค่าใช้จ่าย' : 'ตรวจสอบความถูกต้องก่อนบันทึก'}
                                </DialogDescription>
                            </DialogHeader>

                            {step === 'form' ? (
                                <form onSubmit={handleReview} className="grid grid-cols-2 gap-4 py-4">
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

                                    {/* Water Meter Section */}
                                    <div className={`col-span-1 space-y-2 border p-3 rounded-md ${isWaterFlat ? 'bg-slate-100 opacity-70' : ''}`}>
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <Calculator className="w-4 h-4" /> มิเตอร์น้ำ
                                            {isWaterFlat && <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">เหมาจ่าย</span>}
                                        </h4>
                                        {isWaterFlat ? (
                                            <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-sm">
                                                <Info className="w-8 h-8 mb-2 opacity-50" />
                                                <p>คิดราคาเหมาจ่าย</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <Label>เลขครั้งก่อน (Previous)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.water_prev}
                                                        onChange={e => setFormData({ ...formData, water_prev: Number(e.target.value) })}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label>เลขครั้งนี้ (Current)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.water_curr}
                                                        onChange={e => setFormData({ ...formData, water_curr: Number(e.target.value) })}
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Electric Meter Section */}
                                    <div className={`col-span-1 space-y-2 border p-3 rounded-md ${isElectricFlat ? 'bg-slate-100 opacity-70' : ''}`}>
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <Calculator className="w-4 h-4" /> มิเตอร์ไฟ
                                            {isElectricFlat && <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">เหมาจ่าย</span>}
                                        </h4>
                                        {isElectricFlat ? (
                                            <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-sm">
                                                <Info className="w-8 h-8 mb-2 opacity-50" />
                                                <p>คิดราคาเหมาจ่าย</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <Label>เลขครั้งก่อน (Previous)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.electric_prev}
                                                        onChange={e => setFormData({ ...formData, electric_prev: Number(e.target.value) })}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label>เลขครั้งนี้ (Current)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.electric_curr}
                                                        onChange={e => setFormData({ ...formData, electric_curr: Number(e.target.value) })}
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}
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
                                        <Button type="submit">ตรวจสอบข้อมูล (Review)</Button>
                                    </DialogFooter>
                                </form>
                            ) : (
                                <div className="space-y-4 py-4">
                                    <div className="bg-slate-50 p-4 rounded-lg border space-y-2 text-sm">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="font-bold text-lg">ห้อง {previewData.contract.room_number}</span>
                                            <span className="text-muted-foreground">รอบ {formData.month}/{formData.year}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>ค่าเช่าห้อง</span>
                                            <span>฿{previewData.contract.rent_price.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>ค่าน้ำ {isWaterFlat ? '(เหมาจ่าย)' : `(${previewData.water_units} หน่วย)`}</span>
                                            <span>฿{previewData.water_total.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>ค่าไฟ {isElectricFlat ? '(เหมาจ่าย)' : `(${previewData.electric_units} หน่วย)`}</span>
                                            <span>฿{previewData.electric_total.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>ส่วนกลาง/อื่นๆ</span>
                                            <span>฿{(formData.common_fee + formData.parking_fee + formData.internet_fee).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 font-bold text-lg text-emerald-700">
                                            <span>ยอดสุทธิ</span>
                                            <span>฿{previewData.total_amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <DialogFooter className="flex gap-2 justify-end">
                                        <Button variant="outline" onClick={() => setStep('form')}>กลับไปแก้ไข</Button>
                                        <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">ยืนยันและสร้างบิล</Button>
                                    </DialogFooter>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                )}
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
                                        <div className="flex items-center gap-2">
                                            <Badge variant={inv.status === 'Paid' ? 'default' : inv.status === 'Pending' ? 'secondary' : 'destructive'}>
                                                {inv.status}
                                            </Badge>
                                            {canEdit && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(inv.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
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
