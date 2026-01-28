"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, MoreHorizontal, Pencil, Trash, Users, Building, Wrench, Search, Filter } from "lucide-react"
import { Room } from "@/types/room"
import { createRoom, updateRoom, deleteRoom } from "@/actions/room-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { Checkbox } from "@/components/ui/checkbox"
import { BulkAddRoomModal } from "./bulk-add-modal"

// ... existing imports

// ... imports
import { User } from "@/types/user"

const FURNITURE_OPTIONS = [
    "ตู้เสื้อผ้า",
    "โต๊ะเขียนหนังสือ/โต๊ะทำงาน",
    "เก้าอี้",
    "เครื่องทำน้ำอุ่น",
    "โทรทัศน์",
    "ตู้เย็น"
]

interface RoomManagementProps {
    initialRooms: Room[]
    currentUser: User
}

export function RoomManagement({ initialRooms, currentUser }: RoomManagementProps) {
    const router = useRouter()
    const [rooms, setRooms] = useState<Room[]>(initialRooms)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentId, setCurrentId] = useState<number | null>(null)

    const isManager = currentUser.role === 'Manager' || currentUser.role === 'Admin'

    // Form State
    const [formData, setFormData] = useState<Partial<Room>>({
        room_number: "",
        floor: 1,
        room_type: "พัดลม",
        price: 3500,
        status: "ว่าง",
        furniture_details: ""
    })

    // Search State
    const [searchQuery, setSearchQuery] = useState("")

    // Derived Data
    const filteredRooms = rooms.filter(room =>
        room.room_number.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const floors = Array.from(new Set(filteredRooms.map(r => r.floor))).sort((a, b) => a - b)

    const stats = {
        total: rooms.length,
        vacant: rooms.filter(r => r.status === 'ว่าง').length,
        occupied: rooms.filter(r => r.status === 'ไม่ว่าง').length,
        maintenance: 0
    }

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'floor' || name === 'price' ? parseFloat(value) : value
        }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFurnitureToggle = (item: string) => {
        const currentItems = formData.furniture_details ? formData.furniture_details.split(', ').filter(Boolean) : []
        let newItems
        if (currentItems.includes(item)) {
            newItems = currentItems.filter(i => i !== item)
        } else {
            newItems = [...currentItems, item]
        }
        setFormData(prev => ({ ...prev, furniture_details: newItems.join(', ') }))
    }

    const resetForm = () => {
        setFormData({
            room_number: "",
            floor: 1,
            room_type: "พัดลม",
            price: 3500,
            status: "ว่าง",
            furniture_details: ""
        })
        setIsEditing(false)
        setCurrentId(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        let result: { success: boolean; data?: Room; error?: string };

        if (isEditing && currentId) {
            result = await updateRoom(currentId, formData)
            if (result.success && result.data) {
                setRooms(rooms.map(r => r.room_id === currentId ? result.data! : r))
                alert('แก้ไขห้องเรียบร้อยแล้ว')
                router.refresh()
            }
        } else {
            result = await createRoom(formData as Omit<Room, 'room_id'>)
            if (result.success && result.data) {
                setRooms([...rooms, result.data!])
                alert('เพิ่มห้องเรียบร้อยแล้ว')
                router.refresh()
            }
        }

        if (!result.success) {
            alert(`ไม่สามารถทำรายการได้: ${result.error}`)
            return; // Don't close dialog if error
        }

        setIsDialogOpen(false)
        resetForm()
    }

    const handleEdit = (room: Room) => {
        setFormData({
            ...room,
            furniture_details: room.furniture_details || ""
        })
        setCurrentId(room.room_id)
        setIsEditing(true)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm("คุณแน่ใจว่าต้องการลบห้องนี้?")) {
            const result = await deleteRoom(id)
            if (result.success) {
                setRooms(rooms.filter(r => r.room_id !== id))
                alert('ลบห้องเรียบร้อยแล้ว')
                router.refresh()
            } else {
                alert(`ไม่สามารถลบห้องได้: ${result.error}`)
            }
        }
    }

    return (
        <div className="space-y-8 p-1">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">จำนวนห้องทั้งหมด</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.total}</h3>
                    </div>
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building className="h-5 w-5 text-gray-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-500 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">ว่าง</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.vacant}</h3>
                    </div>
                    <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    </div>
                </div>
                {/* ... other stats ... */}
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="ค้นหาเลขห้อง..."
                        className="pl-9 bg-gray-50 border-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md text-sm text-gray-600">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div> ว่าง
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md text-sm text-gray-600">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div> มีคนอยู่
                    </div>
                </div>
                {/* Primary Action - Manager Only */}
                {isManager && (
                    <BulkAddRoomModal
                        trigger={
                            <Button>
                                <Plus className="h-4 w-4 mr-2" /> เพิ่มห้องพัก
                            </Button>
                        }
                    />
                )}
            </div>

            {/* Room Grid */}
            <div className="space-y-8">
                {filteredRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed">
                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Building className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">ยังไม่มีข้อมูลห้องพัก</h3>
                        <p className="text-gray-500 max-w-sm text-center mb-6">
                            กรุณาเพิ่มข้อมูลห้องพักและชั้นเพื่อเริ่มต้นใช้งานระบบ
                        </p>
                        {isManager && (
                            <Button onClick={() => setIsDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" /> เพิ่มห้องพักแรก
                            </Button>
                        )}
                    </div>
                ) : (
                    floors.map(floor => (
                        <div key={floor}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded">
                                    {floor}F
                                </span>
                                <h3 className="text-lg font-semibold text-gray-700">ชั้น {floor}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {filteredRooms.filter(r => r.floor === floor).map(room => (
                                    <div
                                        key={room.room_id}
                                        className={cn(
                                            "bg-white rounded-xl border shadow-sm p-4 relative overflow-hidden group hover:shadow-md transition-shadow",
                                            room.status === 'ว่าง' ? "border-t-4 border-t-green-500" : "border-t-4 border-t-red-500"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="text-2xl font-bold text-gray-800">{room.room_number}</h4>
                                                <p className="text-xs text-muted-foreground">{room.room_type} • ห้องน้ำในตัว</p>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "bg-opacity-20",
                                                    room.status === 'ว่าง' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                )}
                                            >
                                                {room.status}
                                            </Badge>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-dashed">
                                            {room.status === 'ว่าง' ? (
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 border-dashed"
                                                    onClick={() => handleEdit(room)}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" /> เพิ่มผู้เช่า
                                                </Button>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xs">
                                                        User
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">ผู้เช่า (จำลอง)</p>
                                                        <p className="text-[10px] text-gray-500">ครบกำหนด: 20 ธ.ค. 69</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(room)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> แก้ไข
                                                    </DropdownMenuItem>
                                                    {isManager && (
                                                        <DropdownMenuItem onClick={() => handleDelete(room.room_id)} className="text-red-600">
                                                            <Trash className="mr-2 h-4 w-4" /> ลบ
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
            }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'แก้ไขห้องพัก' : 'เพิ่มห้องพัก'}</DialogTitle>
                        <DialogDescription>
                            กรอกรายละเอียดห้องพักด้านล่าง
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="room_number" className="text-right">เลขห้อง</Label>
                            <Input id="room_number" name="room_number" value={formData.room_number} onChange={handleInputChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="floor" className="text-right">ชั้น</Label>
                            <Input id="floor" name="floor" type="number" value={formData.floor} onChange={handleInputChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="room_type" className="text-right">ประเภท</Label>
                            <Select value={formData.room_type} onValueChange={(val) => handleSelectChange('room_type', val)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="เลือกประเภท" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="พัดลม">พัดลม</SelectItem>
                                    <SelectItem value="แอร์">แอร์</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">ราคา</Label>
                            <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">สถานะ</Label>
                            <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="เลือกสถานะ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ว่าง">ว่าง</SelectItem>
                                    <SelectItem value="ไม่ว่าง">ไม่ว่าง</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">เฟอร์นิเจอร์</Label>
                            <div className="col-span-3 space-y-2 border rounded-md p-3">
                                {FURNITURE_OPTIONS.map((item) => (
                                    <div key={item} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`furn-${item}`}
                                            checked={formData.furniture_details?.includes(item)}
                                            onCheckedChange={() => handleFurnitureToggle(item)}
                                        />
                                        <Label
                                            htmlFor={`furn-${item}`}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {item}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit">บันทึก</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}


