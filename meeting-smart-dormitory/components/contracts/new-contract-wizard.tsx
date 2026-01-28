"use client"

import { useState, useEffect } from "react"
import {
    Check, ChevronRight, User, Home, FileText,
    CreditCard, Calendar, Search, ArrowLeft, Loader2, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { getRooms } from "@/actions/room-actions"
import { Room } from "@/types/room"
import { createOnboarding } from "@/actions/contract-actions"

// Steps definition
const STEPS = [
    { id: 1, title: "เลือกห้องพัก", icon: Home, description: "เลือกห้องที่ต้องการทำสัญญา" },
    { id: 2, title: "ข้อมูลผู้เช่า", icon: User, description: "ระบุข้อมูลผู้เช่าและบัญชีผู้ใช้" },
    { id: 3, title: "รายละเอียดสัญญา", icon: FileText, description: "กำหนดระยะเวลาและค่าใช้จ่าย" },
    { id: 4, title: "ยืนยันข้อมูล", icon: Check, description: "ตรวจสอบและบันทึกสัญญา" }
]

export function NewContractWizard({ onSuccess, open, onOpenChange }: { onSuccess: () => void, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [rooms, setRooms] = useState<Room[]>([])
    const [loadingRooms, setLoadingRooms] = useState(false)

    // Data State
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [tenantData, setTenantData] = useState({
        firstName: "",
        lastName: "",
        idCard: "",
        phone: "",
        email: "",
        username: "",
        password: "", // Auto-generated default
        lineId: ""
    })
    const [contractData, setContractData] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        rentPrice: 0,
        deposit: 0,
        waterMeter: 0,
        electricMeter: 0
    })

    // Fetch Rooms on Open
    useEffect(() => {
        if (open && step === 1) {
            fetchRooms()
        }
    }, [open, step])

    const fetchRooms = async () => {
        setLoadingRooms(true)
        try {
            const data = await getRooms()
            setRooms(data.filter(r => r.status === 'ว่าง'))
        } catch (error) {
            toast.error("ไม่สามารถโหลดข้อมูลห้องพักได้")
        } finally {
            setLoadingRooms(false)
        }
    }

    // Handlers
    const handleNext = () => {
        if (step === 1 && !selectedRoom) {
            toast.error("กรุณาเลือกห้องพักก่อนดำเนินการต่อ")
            return
        }
        if (step === 2) {
            if (!tenantData.firstName || !tenantData.lastName || !tenantData.phone || !tenantData.idCard) {
                toast.error("กรุณากรอกข้อมูลสำคัญให้ครบถ้วน")
                return
            }
            // Auto-generate username/password if empty
            if (!tenantData.username) setTenantData(prev => ({ ...prev, username: tenantData.phone }))
            if (!tenantData.password) setTenantData(prev => ({ ...prev, password: tenantData.phone }))
        }
        if (step === 3) {
            if (!contractData.startDate || !contractData.endDate) {
                toast.error("กรุณาระบุวันที่เริ่มต้นและสิ้นสุดสัญญา")
                return
            }
        }

        setStep(prev => Math.min(prev + 1, 4))
    }

    const handleBack = () => setStep(prev => Math.max(prev - 1, 1))

    const handleSubmit = async () => {
        if (!selectedRoom) return

        setIsLoading(true)
        try {
            const payload = {
                room: selectedRoom,
                tenant: tenantData,
                contract: contractData
            }

            const result = await createOnboarding(payload)

            if (result.success) {
                toast.success("บันทึกข้อมูลสัญญาและผู้เช่าสำเร็จ!")
                onSuccess()
                onOpenChange(false)
                // Reset state
                setStep(1)
                setSelectedRoom(null)
                setTenantData({ firstName: "", lastName: "", idCard: "", phone: "", email: "", username: "", password: "", lineId: "" })
            } else {
                toast.error(result.message || "เกิดข้อผิดพลาดในการบันทึก")
            }
        } catch (error) {
            console.error(error)
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        } finally {
            setIsLoading(false)
        }
    }

    // Render Steps
    const renderStep1_RoomSelection = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">เลือกห้องพัก (ว่าง)</h3>
                <Input
                    placeholder="ค้นหาห้อง..."
                    className="max-w-[200px]"
                />
            </div>

            {loadingRooms ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400" /></div>
            ) : rooms.length === 0 ? (
                <div className="text-center p-8 text-slate-500 border rounded-lg bg-slate-50">ไม่มีห้องว่างในขณะนี้</div>
            ) : (
                <ScrollArea className="h-[400px] border rounded-md p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {rooms.map(room => (
                            <div
                                key={room.room_id}
                                onClick={() => {
                                    setSelectedRoom(room)
                                    setContractData(prev => ({
                                        ...prev,
                                        rentPrice: room.price,
                                        deposit: room.price * 2 // Default deposit rule
                                    }))
                                }}
                                className={`
                                    cursor-pointer p-4 rounded-xl border-2 transition-all relative overflow-hidden
                                    ${selectedRoom?.room_id === room.room_id
                                        ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                                        : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'}
                                `}
                            >
                                {selectedRoom?.room_id === room.room_id && (
                                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 text-[10px]">Selected</div>
                                )}
                                <div className="text-center space-y-2">
                                    <div className="font-bold text-2xl text-slate-800">{room.room_number}</div>
                                    <div className="text-xs text-slate-500">{room.floor ? `ชั้น ${room.floor}` : ''} | {room.room_type}</div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                                        THB {room.price.toLocaleString()}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    )

    const renderStep2_TenantInfo = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>ชื่อจริง <span className="text-red-500">*</span></Label>
                    <Input
                        value={tenantData.firstName}
                        onChange={(e) => setTenantData({ ...tenantData, firstName: e.target.value })}
                        placeholder="กรอกชื่อจริง"
                    />
                </div>
                <div className="space-y-2">
                    <Label>นามสกุล <span className="text-red-500">*</span></Label>
                    <Input
                        value={tenantData.lastName}
                        onChange={(e) => setTenantData({ ...tenantData, lastName: e.target.value })}
                        placeholder="กรอกนามสกุล"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>เลขบัตรประชาชน / Passport ID <span className="text-red-500">*</span></Label>
                <Input
                    value={tenantData.idCard}
                    onChange={(e) => setTenantData({ ...tenantData, idCard: e.target.value })}
                    placeholder="X-XXXX-XXXXX-XX-X"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>เบอร์โทรศัพท์ (Username) <span className="text-red-500">*</span></Label>
                    <Input
                        type="tel"
                        value={tenantData.phone}
                        onChange={(e) => {
                            const val = e.target.value
                            setTenantData({
                                ...tenantData,
                                phone: val,
                                username: val,
                                password: val // Auto-set password initially
                            })
                        }}
                        placeholder="08X-XXX-XXXX"
                    />
                    <p className="text-xs text-slate-500">เบอร์โทรศัพท์จะถูกตั้งเป็น Username และ Password เริ่มต้น</p>
                </div>
                <div className="space-y-2">
                    <Label>อีเมล (ถ้ามี)</Label>
                    <Input
                        type="email"
                        value={tenantData.email}
                        onChange={(e) => setTenantData({ ...tenantData, email: e.target.value })}
                        placeholder="name@example.com"
                    />
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                <User className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                    <h4 className="font-semibold text-blue-900 text-sm">ระบบสมาชิกอัตโนมัติ</h4>
                    <p className="text-xs text-blue-700 mt-1">
                        ระบบจะสร้างบัญชีผู้ใช้ให้ทันทีเมื่อบันทึกสัญญา โดยผู้เช่าสามารถเข้าสู่ระบบด้วยเบอร์โทรศัพท์ได้เลย
                    </p>
                </div>
            </div>
        </div>
    )

    const renderStep3_ContractDetails = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>วันที่ทำสัญญา/เริ่มเช่า</Label>
                    <Input
                        type="date"
                        value={contractData.startDate}
                        onChange={(e) => {
                            // Auto calculate end date (e.g. 1 year default)
                            const start = new Date(e.target.value)
                            const end = new Date(start)
                            end.setFullYear(end.getFullYear() + 1)
                            end.setDate(end.getDate() - 1)
                            setContractData({
                                ...contractData,
                                startDate: e.target.value,
                                endDate: end.toISOString().split('T')[0]
                            })
                        }}
                    />
                </div>
                <div className="space-y-2">
                    <Label>วันสิ้นสุดสัญญา</Label>
                    <Input
                        type="date"
                        value={contractData.endDate}
                        onChange={(e) => setContractData({ ...contractData, endDate: e.target.value })}
                    />
                </div>
            </div>

            <hr className="border-t border-slate-200" />

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>ค่าเช่าต่อเดือน (บาท)</Label>
                    <Input
                        type="number"
                        value={contractData.rentPrice}
                        onChange={(e) => setContractData({ ...contractData, rentPrice: Number(e.target.value) })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>เงินประกัน/มัดจำ (บาท)</Label>
                    <Input
                        type="number"
                        value={contractData.deposit}
                        onChange={(e) => setContractData({ ...contractData, deposit: Number(e.target.value) })}
                    />
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4" /> เลขมิเตอร์เริ่มต้น (Initial Readings)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>มิเตอร์น้ำประปา</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={contractData.waterMeter}
                            onChange={(e) => setContractData({ ...contractData, waterMeter: Number(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>มิเตอร์ไฟฟ้า</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={contractData.electricMeter}
                            onChange={(e) => setContractData({ ...contractData, electricMeter: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </div>
        </div>
    )

    const renderStep4_Summary = () => (
        <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-green-900">พร้อมบันทึกสัญญา</h3>
                <p className="text-green-700 text-sm">ตรวจสอบข้อมูลด้านล่างก่อนยืนยันการทำสัญญา</p>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                    <h4 className="font-semibold text-slate-700 border-b pb-2">ผู้เช่า (Tenant)</h4>
                    <p><span className="text-slate-500">ชื่อ-สกุล:</span> {tenantData.firstName} {tenantData.lastName}</p>
                    <p><span className="text-slate-500">โทรศัพท์:</span> {tenantData.phone} (Username)</p>
                    <p><span className="text-slate-500">ID Card:</span> {tenantData.idCard}</p>
                </div>
                <div className="space-y-2">
                    <h4 className="font-semibold text-slate-700 border-b pb-2">ห้องพัก & สัญญา</h4>
                    <p><span className="text-slate-500">ห้อง:</span> {selectedRoom?.room_number}</p>
                    <p><span className="text-slate-500">ระยะเวลา:</span> {contractData.startDate} ถึง {contractData.endDate}</p>
                    <p><span className="text-slate-500">ค่าเช่า:</span> {contractData.rentPrice.toLocaleString()} บ.</p>
                    <p><span className="text-slate-500">เงินประกัน:</span> {contractData.deposit.toLocaleString()} บ.</p>
                </div>
            </div>
        </div>
    )

    // Main Render
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Header Steps */}
                <div className="bg-slate-900 text-white p-6 relative">
                    <div className="flex justify-between items-center mb-6">
                        <DialogTitle className="text-xl font-bold">ทำสัญญาเช่าใหม่ (New Contract)</DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="flex items-center justify-between px-8">
                        {STEPS.map((s, i) => (
                            <div key={s.id} className="flex flex-col items-center relative z-10">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors
                                    ${step >= s.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}
                                `}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <span className={`text-xs ${step >= s.id ? 'text-blue-200' : 'text-slate-500'}`}>{s.title}</span>
                                {/* Line Connector */}
                                {i < STEPS.length - 1 && (
                                    <div className="absolute top-5 left-1/2 w-full h-[2px] bg-slate-700 -z-10"
                                        style={{ width: 'calc(100% * 3)' }} /* Hacky manual width */
                                    ></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <Card className="h-full border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                            {step === 1 && renderStep1_RoomSelection()}
                            {step === 2 && renderStep2_TenantInfo()}
                            {step === 3 && renderStep3_ContractDetails()}
                            {step === 4 && renderStep4_Summary()}
                        </CardContent>
                    </Card>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t bg-white flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1 || isLoading}
                        className="text-slate-500"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4" /> ย้อนกลับ
                    </Button>

                    {step < 4 ? (
                        <Button onClick={handleNext} disabled={!selectedRoom}>
                            ถัดไป <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white min-w-[150px]"
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 w-4 h-4" />}
                            ยืนยันและบันทึก
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function ActivityIcon(props: any) {
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
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
