'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitBookingRequest } from "@/actions/booking-actions"
import { Room } from "@/types/room"

interface BookingModalProps {
    room: Room
    isOpen: boolean
    onClose: () => void
}

export function BookingModal({ room, isOpen, onClose }: BookingModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        lineId: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await submitBookingRequest({
                roomId: room.room_id,
                roomNumber: room.room_number,
                customerName: formData.name,
                customerPhone: formData.phone,
                lineId: formData.lineId
            })
            setIsSuccess(true)
        } catch (error) {
            console.error("Booking failed", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setIsSuccess(false)
        setFormData({ name: '', phone: '', lineId: '' })
        onClose()
    }

    if (isSuccess) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-emerald-600">จองสำเร็จ!</DialogTitle>
                        <DialogDescription className="text-center">
                            ขอบคุณที่สนใจห้องพักของเรา ทางเราได้รับข้อมูลแล้ว <br />
                            เจ้าหน้าที่จะติดต่อกลับไปยังเบอร์ <strong>{formData.phone}</strong> โดยเร็วที่สุดครับ
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button onClick={handleClose} className="bg-emerald-600 hover:bg-emerald-700">
                            รับทราบ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>จองห้องพัก {room.room_number}</DialogTitle>
                    <DialogDescription>
                        กรุณากรอกข้อมูลเพื่อให้เจ้าหน้าที่ติดต่อกลับ
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                        <Input
                            id="name"
                            required
                            placeholder="เช่น สมชาย ใจดี"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                        <Input
                            id="phone"
                            required
                            type="tel"
                            placeholder="08x-xxx-xxxx"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lineId">Line ID</Label>
                        <Input
                            id="lineId"
                            required
                            placeholder="ID สำหรับติดต่อกลับ"
                            value={formData.lineId}
                            onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                            {isLoading ? 'กำลังส่งข้อมูล...' : 'ยืนยันการจอง'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
