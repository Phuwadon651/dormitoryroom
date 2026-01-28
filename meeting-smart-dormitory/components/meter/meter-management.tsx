"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { Calendar, Droplets, Zap, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getMeterReadings, getMeterSummary, saveMeterReading, deleteMeterReading } from "@/actions/meter-actions"
import { toast } from "sonner" // Assuming sonner or use standard alert
import { Trash2 } from "lucide-react"

interface RoomReading {
    room_id: number
    room_number: string
    floor: number
    status: string
    reading: {
        id: number
        electricity: number
        water: number
        date: string
    } | null
}

interface SummaryStats {
    total_rooms: number
    readings_count: number // from 'recorded_rooms'
    pending_rooms: number
    total_electricity: number
    total_water: number
}

export function MeterManagement({ currentUser }: { currentUser: any }) {
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
    const [year, setYear] = useState<number>(new Date().getFullYear())
    const [rooms, setRooms] = useState<RoomReading[]>([])
    const [stats, setStats] = useState<SummaryStats | null>(null)
    const [loading, setLoading] = useState(true)

    // Dialog State
    const [selectedRoom, setSelectedRoom] = useState<RoomReading | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [elecInput, setElecInput] = useState("")
    const [waterInput, setWaterInput] = useState("")
    const [saving, setSaving] = useState(false)

    // Permissions
    const canEdit = currentUser.role === 'DormAdmin' || currentUser.role === 'Admin' || currentUser.role === 'Manager'

    useEffect(() => {
        loadData()
    }, [month, year])

    const loadData = async () => {
        setLoading(true)
        try {
            const [roomsData, summaryData] = await Promise.all([
                getMeterReadings(month, year),
                getMeterSummary(month, year)
            ])
            setRooms(roomsData)
            setStats({
                total_rooms: summaryData.total_rooms,
                readings_count: summaryData.recorded_rooms,
                pending_rooms: summaryData.pending_rooms,
                total_electricity: summaryData.total_electricity_meter,
                total_water: summaryData.total_water_meter
            })
        } catch (error) {
            console.error("Failed to load meter data", error)
            // toast.error("โหลดข้อมูลล้มเหลว")
        } finally {
            setLoading(false)
        }
    }

    const handleRoomClick = (room: RoomReading) => {
        if (!canEdit) return
        setSelectedRoom(room)
        setElecInput(room.reading?.electricity?.toString() || "")
        setWaterInput(room.reading?.water?.toString() || "")
        setIsDialogOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedRoom) return

        setSaving(true)
        try {
            const res = await saveMeterReading({
                room_id: selectedRoom.room_id,
                electricity_meter: parseFloat(elecInput),
                water_meter: parseFloat(waterInput),
                reading_date: `${year}-${month.toString().padStart(2, '0')}-${new Date().getDate()}`
                // Or let user pick date? Requirement says "record data", implied current or relevant date.
            })

            if (res.success) {
                // toast.success("บันทึกข้อมูลเรียบร้อย")
                setIsDialogOpen(false)
                loadData()
            } else {
                alert(res.error)
            }
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการบันทึก")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedRoom?.reading?.id) return
        if (!confirm("ต้องการลบข้อมูลมิเตอร์นี้ใช่หรือไม่?")) return

        setSaving(true)
        try {
            const res = await deleteMeterReading(selectedRoom.reading.id)
            if (res.success) {
                setIsDialogOpen(false)
                loadData()
            } else {
                alert("ลบไม่สำเร็จ: " + res.error)
            }
        } catch (e) {
            alert("เกิดข้อผิดพลาด")
        } finally {
            setSaving(false)
        }
    }

    const floors = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b)

    return (
        <div className="space-y-6">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">จดมิเตอร์น้ำ/ไฟ</h2>
                    <p className="text-muted-foreground">บันทึกข้อมูลการใช้ไฟฟ้าและน้ำประปาประจำเดือน</p>
                </div>
                <div className="flex gap-2">
                    <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <SelectItem key={m} value={m.toString()}>
                                    {format(new Date(2000, m - 1, 1), 'MMMM', { locale: th })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[2024, 2025, 2026, 2027].map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">รอจดบันทึก</CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.pending_rooms} <span className="text-sm font-normal text-muted-foreground">ห้อง</span></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">จดบันทึกแล้ว</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.readings_count} <span className="text-sm font-normal text-muted-foreground">ห้อง</span></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ยอดการใช้ไฟฟ้ารวม</CardTitle>
                            <Zap className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_electricity.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">หน่วย</span></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ยอดการใช้น้ำรวม</CardTitle>
                            <Droplets className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_water.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">หน่วย</span></div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Room List */}
            <div className="space-y-6">
                {floors.map(floor => (
                    <div key={floor} className="bg-white rounded-lg border p-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Badge variant="secondary" className="px-2 py-1 text-sm">ชั้น {floor}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {rooms.filter(r => r.floor === floor).map(room => (
                                <div
                                    key={room.room_id}
                                    onClick={() => handleRoomClick(room)}
                                    className={`
                                        relative rounded-xl border p-4 transition-all
                                        ${room.reading ? 'bg-green-50/50 border-green-200' : 'bg-white hover:border-blue-400 hover:shadow-md cursor-pointer'}
                                        ${!canEdit && !room.reading ? 'cursor-default opacity-80' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{room.room_number}</h3>
                                            <p className="text-xs text-muted-foreground mt-1">{room.status}</p>
                                        </div>
                                        {room.reading ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                                จดแล้ว
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-400">
                                                รอจด
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {room.reading ? (
                                            <>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="flex items-center text-gray-600"><Zap className="w-3 h-3 mr-1" /> ไฟฟ้า</span>
                                                    <span className="font-semibold">{room.reading.electricity}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="flex items-center text-gray-600"><Droplets className="w-3 h-3 mr-1" /> น้ำ</span>
                                                    <span className="font-semibold">{room.reading.water}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-16 text-sm text-gray-400 italic">
                                                {canEdit ? 'คลิกเพื่อจดมิเตอร์' : 'ยังไม่มีข้อมูล'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>จดมิเตอร์ ห้อง {selectedRoom?.room_number}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="elec">มิเตอร์ไฟฟ้า (หน่วย)</Label>
                            <div className="relative">
                                <Zap className="absolute left-3 top-2.5 h-4 w-4 text-yellow-500" />
                                <Input
                                    id="elec"
                                    type="number"
                                    step="0.01"
                                    className="pl-9"
                                    value={elecInput}
                                    onChange={e => setElecInput(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="water">มิเตอร์น้ำ (หน่วย)</Label>
                            <div className="relative">
                                <Droplets className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
                                <Input
                                    id="water"
                                    type="number"
                                    step="0.01"
                                    className="pl-9"
                                    value={waterInput}
                                    onChange={e => setWaterInput(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter className="flex justify-between sm:justify-end gap-2">
                            {selectedRoom?.reading && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="mr-auto"
                                    onClick={handleDelete}
                                    disabled={saving}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> ลบข้อมูล
                                </Button>
                            )}
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? "กำลังบันทึก..." : "บันทึก"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
