"use client"

import { useState } from "react"
import { Contract } from "@/types/finance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createContract } from "@/actions/finance-actions"
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
import { Plus, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

interface ContractListProps {
    initialContracts: Contract[]
}

export function ContractList({ initialContracts }: ContractListProps) {
    const router = useRouter()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [contracts, setContracts] = useState<Contract[]>(initialContracts)

    // Simple form state (in real app, assume linking to real rooms/users)
    const [formData, setFormData] = useState<Partial<Contract>>({
        tenant_id: "T-001", // Placeholder
        room_number: "",
        rent_price: 3500,
        deposit_amount: 5000,
        advance_payment: 3500,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        billing_day: 5,
        late_fee_type: 'Fixed',
        late_fee_amount: 50,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // In real app: Validate room_number exists in DB
        const newContract = await createContract(formData as any)
        setContracts([...contracts, newContract])
        setIsDialogOpen(false)
        router.refresh()
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">รายการสัญญาเช่าทั้งหมด</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> สร้างสัญญาใหม่</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>สร้างสัญญาเช่า</DialogTitle>
                            <DialogDescription>กรอกข้อมูลสัญญาสำหรับผู้เช่ารายใหม่</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="room_number">เลขห้อง</Label>
                                <Input
                                    id="room_number"
                                    value={formData.room_number}
                                    onChange={e => setFormData({ ...formData, room_number: e.target.value })}
                                    placeholder="เช่น 101"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rent_price">ค่าเช่า (บาท)</Label>
                                <Input
                                    id="rent_price"
                                    type="number"
                                    value={formData.rent_price}
                                    onChange={e => setFormData({ ...formData, rent_price: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deposit_amount">เงินประกัน (บาท)</Label>
                                <Input
                                    id="deposit_amount"
                                    type="number"
                                    value={formData.deposit_amount}
                                    onChange={e => setFormData({ ...formData, deposit_amount: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="billing_day">วันครบกำหนดชำระ (ของทุกเดือน)</Label>
                                <Input
                                    id="billing_day"
                                    type="number"
                                    min="1" max="28"
                                    value={formData.billing_day}
                                    onChange={e => setFormData({ ...formData, billing_day: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="start_date">วันเริ่มสัญญา</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">วันสิ้นสุดสัญญา</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    required
                                />
                            </div>

                            <DialogFooter className="col-span-2 pt-4">
                                <Button type="submit">บันทึกสัญญา</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>เลขห้อง</TableHead>
                            <TableHead>ค่าเช่า</TableHead>
                            <TableHead>วันชำระเงิน</TableHead>
                            <TableHead>ระยะสัญญา</TableHead>
                            <TableHead>สถานะ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contracts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">ไม่พบสัญญาเช่า</TableCell>
                            </TableRow>
                        ) : (
                            contracts.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.room_number}</TableCell>
                                    <TableCell>฿{c.rent_price.toLocaleString()}</TableCell>
                                    <TableCell>ทุกวันที่ {c.billing_day}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {c.start_date} - {c.end_date}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${c.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            {c.isActive ? 'Active' : 'Closed'}
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
