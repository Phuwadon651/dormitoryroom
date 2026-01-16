"use client"

import { useState } from "react"
import { Room } from "@/types/room"
import { RoomCard } from "./room-card"
import { Button } from "@/components/ui/button"
import { Fan, Wind, ArrowLeft } from "lucide-react"

interface RoomShowcaseClientProps {
    rooms: Room[]
}

export function RoomShowcaseClient({ rooms }: RoomShowcaseClientProps) {
    const [selectedType, setSelectedType] = useState<'NONE' | 'พัดลม' | 'แอร์'>('NONE')

    const fanRooms = rooms.filter(r => r.room_type === 'พัดลม')
    const airRooms = rooms.filter(r => r.room_type === 'แอร์')

    const filteredRooms = rooms
        .filter(r => r.room_type === selectedType)
        .sort((a, b) => {
            if (a.status === 'ว่าง' && b.status !== 'ว่าง') return -1
            if (a.status !== 'ว่าง' && b.status === 'ว่าง') return 1
            return a.room_number.localeCompare(b.room_number)
        })

    if (selectedType === 'NONE') {
        return (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
                <div
                    onClick={() => setSelectedType('พัดลม')}
                    className="group cursor-pointer relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-emerald-500 text-center"
                >
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 group-hover:scale-110 transition-transform">
                        <Fan className="h-10 w-10 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">ห้องพัดลม</h3>
                    <p className="text-slate-500 mb-4">เย็นสบาย อากาศถ่ายเทสะดวก</p>
                    <p className="text-sm font-medium text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full px-4">
                        ว่าง {fanRooms.filter(r => r.status === 'ว่าง').length} ห้อง
                    </p>
                </div>

                <div
                    onClick={() => setSelectedType('แอร์')}
                    className="group cursor-pointer relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 text-center"
                >
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 group-hover:scale-110 transition-transform">
                        <Wind className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">ห้องแอร์</h3>
                    <p className="text-slate-500 mb-4">เย็นฉ่ำ สบายตัว พร้อมเฟอร์นิเจอร์</p>
                    <p className="text-sm font-medium text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full px-4">
                        ว่าง {airRooms.filter(r => r.status === 'ว่าง').length} ห้อง
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <Button
                    variant="ghost"
                    onClick={() => setSelectedType('NONE')}
                    className="gap-2 text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" /> ย้อนกลับ
                </Button>

                <div className="flex gap-2">
                    <Button
                        variant={selectedType === 'พัดลม' ? 'default' : 'outline'}
                        onClick={() => setSelectedType('พัดลม')}
                        className={selectedType === 'พัดลม' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >
                        <Fan className="mr-2 h-4 w-4" /> ห้องพัดลม
                    </Button>
                    <Button
                        variant={selectedType === 'แอร์' ? 'default' : 'outline'}
                        onClick={() => setSelectedType('แอร์')}
                        className={selectedType === 'แอร์' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                    >
                        <Wind className="mr-2 h-4 w-4" /> ห้องแอร์
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredRooms.map((room) => (
                    <RoomCard key={room.room_id} room={room} />
                ))}
                {filteredRooms.length === 0 && (
                    <div className="col-span-full text-center py-20 text-slate-400">
                        ไม่พบห้องพักในหมวดนี้
                    </div>
                )}
            </div>
        </div>
    )
}
