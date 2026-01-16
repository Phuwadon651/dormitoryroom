'use client'

import { useState } from "react"
import { Room } from "@/types/room"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Wind, Fan } from "lucide-react"
import { BookingModal } from "./booking-modal"

interface RoomCardProps {
    room: Room
}

export function RoomCard({ room }: RoomCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const isAvailable = room.status === 'ว่าง'

    return (
        <>
            <Card className="flex flex-col hover:border-emerald-200 hover:shadow-lg transition-all">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800">ห้อง {room.room_number}</CardTitle>
                            <CardDescription className="text-emerald-600 font-medium mt-1">
                                {room.room_type === 'แอร์' ? (
                                    <span className="flex items-center gap-1"><Wind className="h-4 w-4" /> ห้องแอร์</span>
                                ) : (
                                    <span className="flex items-center gap-1"><Fan className="h-4 w-4" /> ห้องพัดลม</span>
                                )}
                            </CardDescription>
                        </div>
                        <Badge variant={isAvailable ? "secondary" : "destructive"} className={isAvailable ? "bg-emerald-100 text-emerald-800" : ""}>
                            {isAvailable ? "ว่าง" : "ไม่ว่าง"}
                        </Badge>
                    </div>
                    <div className="text-2xl font-bold mt-4">฿{room.price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ เดือน</span></div>
                </CardHeader>
                <CardContent className="flex-1">
                    <p className="text-sm text-slate-500 mb-4">ชั้น {room.floor}</p>
                    {room.furniture_details && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-700">เฟอร์นิเจอร์:</p>
                            <ul className="text-sm text-slate-600 space-y-1">
                                {room.furniture_details.split(',').map((item, index) => (
                                    <li key={index} className="flex items-center">
                                        <Check className="mr-2 h-3 w-3 text-emerald-500" />
                                        {item.trim()}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        className={`w-full ${isAvailable ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300 cursor-not-allowed text-slate-500'}`}
                        disabled={!isAvailable}
                        onClick={() => isAvailable && setIsModalOpen(true)}
                    >
                        {isAvailable ? 'จองห้องพักนี้' : 'ห้องพักเต็ม'}
                    </Button>
                </CardFooter>
            </Card>

            <BookingModal
                room={room}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
