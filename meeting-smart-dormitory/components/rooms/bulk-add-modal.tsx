'use client'

import { useState } from "react"
import { RoomType } from "@/types/room"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createBulkRooms } from "@/actions/room-actions"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"

const FURNITURE_OPTIONS = [
    "ตู้เสื้อผ้า",
    "โต๊ะเขียนหนังสือ/โต๊ะทำงาน",
    "เก้าอี้",
    "เครื่องทำน้ำอุ่น",
    "โทรทัศน์",
    "ตู้เย็น"
]

interface BulkAddRoomModalProps {
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function BulkAddRoomModal({ trigger, onSuccess }: BulkAddRoomModalProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const [floor, setFloor] = useState(1)
    const [startNumber, setStartNumber] = useState(101)
    const [quantity, setQuantity] = useState(10)
    const [roomType, setRoomType] = useState<RoomType>('พัดลม')
    const [price, setPrice] = useState(3500)
    const [selectedFurniture, setSelectedFurniture] = useState<string[]>([])

    const handleFloorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value) || 0
        setFloor(val)
        // Auto-suggest start number: Floor * 100 + 1
        if (val > 0) {
            setStartNumber(val * 100 + 1)
        }
    }

    const handleFurnitureToggle = (item: string) => {
        if (selectedFurniture.includes(item)) {
            setSelectedFurniture(selectedFurniture.filter(i => i !== item))
        } else {
            setSelectedFurniture([...selectedFurniture, item])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await createBulkRooms(floor, startNumber, quantity, {
                room_type: roomType,
                price: price,
                status: 'ว่าง',
                furniture_details: selectedFurniture.join(', ')
            })

            setOpen(false)
            router.refresh()
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button><Plus className="h-4 w-4 mr-2" /> เพิ่มห้องพัก (กลุ่ม)</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>เพิ่มห้องพักจำนวนมาก</DialogTitle>
                    <DialogDescription>
                        สร้างห้องพักรายชั้นแบบรวดเร็ว ระบบจะรันเลขห้องให้อัตโนมัติ
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="floor">ชั้นที่</Label>
                            <Input
                                id="floor"
                                type="number"
                                value={floor}
                                onChange={handleFloorChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity">จำนวนห้อง</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="startNumber">เลขห้องเริ่มต้น</Label>
                        <Input
                            id="startNumber"
                            type="number"
                            value={startNumber}
                            onChange={(e) => setStartNumber(parseInt(e.target.value) || 0)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            เช่น เริ่ม 101 จะได้ 101, 102, 103...
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="type">ประเภท</Label>
                            <Select value={roomType} onValueChange={(v) => setRoomType(v as RoomType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="พัดลม">พัดลม</SelectItem>
                                    <SelectItem value="แอร์">แอร์</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">ราคา (บาท)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-3 border rounded-md p-3">
                        <Label>เฟอร์นิเจอร์</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {FURNITURE_OPTIONS.map((item) => (
                                <div key={item} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`bulk-furn-${item}`}
                                        checked={selectedFurniture.includes(item)}
                                        onCheckedChange={() => handleFurnitureToggle(item)}
                                    />
                                    <Label
                                        htmlFor={`bulk-furn-${item}`}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {item}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'กำลังสร้าง...' : 'สร้างห้องพัก'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
