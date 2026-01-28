"use client"

import { useState, useEffect } from "react"
import { ExpiringContract, getExpiringContracts, notifyTenantOfExpiry, renewContract, terminateContract } from "@/actions/contract-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, FileSignature, LogOut, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ContractExpiryList({ userRole }: { userRole: string }) {
    const [contracts, setContracts] = useState<ExpiringContract[]>([])
    const [loading, setLoading] = useState(true)

    // Action States
    const [selectedContract, setSelectedContract] = useState<ExpiringContract | null>(null)
    const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false)
    const [renewDuration, setRenewDuration] = useState("12")
    const [processing, setProcessing] = useState(false)

    const canManage = ['Admin', 'DormAdmin', 'Manager'].includes(userRole)
    const canNotify = ['Admin', 'DormAdmin', 'Manager', 'Caretaker'].includes(userRole) // Caretakers can notify

    const loadContracts = async () => {
        setLoading(true)
        try {
            const data = await getExpiringContracts(30)
            setContracts(data)
        } catch (error) {
            console.error(error)
            toast.error("ไม่สามารถโหลดข้อมูลสัญญาได้")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadContracts()
    }, [])

    const handleNotify = async (contract: ExpiringContract) => {
        toast.promise(notifyTenantOfExpiry(contract.id), {
            loading: 'กำลังส่งข้อความแจ้งเตือน...',
            success: 'ส่งแจ้งเตือนเรียบร้อยแล้ว',
            error: 'เกิดข้อผิดพลาดในการส่งแจ้งเตือน'
        })
    }

    const handleRenew = async () => {
        if (!selectedContract) return
        setProcessing(true)

        // Calculate new start date (day after current end date)
        const oldEndDate = new Date(selectedContract.end_date)
        oldEndDate.setDate(oldEndDate.getDate() + 1)
        const newStartDate = oldEndDate.toISOString().split('T')[0]

        try {
            await renewContract(selectedContract.id, newStartDate, parseInt(renewDuration))
            toast.success("ต่อสัญญาเรียบร้อยแล้ว")
            setIsRenewDialogOpen(false)
            loadContracts() // Reload list
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการต่อสัญญา")
        } finally {
            setProcessing(false)
        }
    }

    const handleTerminate = async (contract: ExpiringContract) => {
        if (!confirm(`ยืนยันการแจ้งย้ายออกสำหรับห้อง ${contract.room_number}?`)) return

        toast.promise(terminateContract(contract.id, contract.end_date), {
            loading: 'กำลังดำเนินการ...',
            success: () => {
                loadContracts()
                return 'แจ้งย้ายออกเรียบร้อยแล้ว'
            },
            error: 'เกิดข้อผิดพลาด'
        })
    }

    if (loading) return <div className="text-center py-10">กำลังโหลดข้อมูล...</div>

    if (contracts.length === 0) return (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
            <RefreshCw className="h-8 w-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">ไม่พบสัญญาที่ใกล้หมดอายุ</h3>
            <p className="text-sm text-slate-500">สัญญาเช่าทั้งหมดอยู่ในสถานะปกติ (มากกว่า 30 วัน)</p>
        </div>
    )

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ห้องพัก</TableHead>
                        <TableHead>ผู้เช่า</TableHead>
                        <TableHead>วันสิ้นสุดสัญญา</TableHead>
                        <TableHead>คงเหลือ (วัน)</TableHead>
                        <TableHead className="text-right">ดำเนินการ</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contracts.map(contract => (
                        <TableRow key={contract.id}>
                            <TableCell className="font-medium">{contract.room_number}</TableCell>
                            <TableCell>{contract.tenant_id}</TableCell> {/* Note: Need tenant name join usually, but API mock might return ID or mapped obj */}
                            <TableCell>{new Date(contract.end_date).toLocaleDateString('th-TH')}</TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${contract.remainingDays <= 7 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                                    }`}>
                                    {contract.remainingDays} วัน
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {canNotify && (
                                        <Button size="sm" variant="ghost" onClick={() => handleNotify(contract)} title="ส่งแจ้งเตือน">
                                            <Bell className="h-4 w-4 text-slate-500" />
                                        </Button>
                                    )}

                                    {canManage && (
                                        <>
                                            <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => {
                                                    setSelectedContract(contract)
                                                    setIsRenewDialogOpen(true)
                                                }}
                                            >
                                                <FileSignature className="h-4 w-4 mr-1" /> ต่อสัญญา
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleTerminate(contract)}
                                            >
                                                <LogOut className="h-4 w-4 mr-1" /> ย้ายออก
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Renew Dialog */}
            <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ต่อสัญญาเช่า - ห้อง {selectedContract?.room_number}</DialogTitle>
                        <DialogDescription>
                            สัญญาเดิมจะหมดอายุวันที่ {selectedContract && new Date(selectedContract.end_date).toLocaleDateString('th-TH')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">ระยะเวลา</Label>
                            <Select value={renewDuration} onValueChange={setRenewDuration}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="เลือกระยะเวลา" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="6">6 เดือน</SelectItem>
                                    <SelectItem value="12">1 ปี (12 เดือน)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenewDialogOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleRenew} disabled={processing}>
                            {processing ? 'กำลังบันทึก...' : 'ยันยันการต่อสัญญา'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
