"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

export default function CreateMaintenanceModal({ refresh }: { refresh: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState<any[]>([]);

    // Form
    const [roomId, setRoomId] = useState("");
    const [repairType, setRepairType] = useState("");
    const [details, setDetails] = useState("");
    const [images, setImages] = useState<FileList | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Fetch rooms for selection
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/rooms`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
                .then(res => res.json())
                .then(data => setRooms(Array.isArray(data) ? data : data.data || [])) // Handle potential pagination
                .catch(err => console.error(err));
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!roomId || !repairType || !details) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('room_id', roomId);
            formData.append('repair_type', repairType);
            formData.append('damage_details', details);
            // Current date as report_date
            formData.append('report_date', new Date().toISOString().split('T')[0]);

            if (images) {
                Array.from(images).forEach((file, index) => {
                    formData.append(`report_images[${index}]`, file);
                });
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/maintenances`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            if (res.ok) {
                setIsOpen(false);
                refresh();
                // Reset form
                setRoomId("");
                setRepairType("");
                setDetails("");
                setImages(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    แจ้งซ่อม
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>แจ้งซ่อม / แจ้งปัญหา</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label>ห้อง</Label>
                        <Select onValueChange={setRoomId} value={roomId}>
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกห้อง" />
                            </SelectTrigger>
                            <SelectContent>
                                {rooms.map(room => (
                                    <SelectItem key={room.room_id} value={String(room.room_id)}>
                                        ห้อง {room.room_number}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>ประเภทการแจ้ง</Label>
                        <Select onValueChange={setRepairType} value={repairType}>
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ไฟฟ้า">ไฟฟ้า</SelectItem>
                                <SelectItem value="ประปา">ประปา</SelectItem>
                                <SelectItem value="เครื่องใช้ไฟฟ้า">เครื่องใช้ไฟฟ้า</SelectItem>
                                <SelectItem value="เฟอร์นิเจอร์">เฟอร์นิเจอร์</SelectItem>
                                <SelectItem value="โครงสร้างห้อง/อาคาร">โครงสร้างห้อง/อาคาร</SelectItem>
                                <SelectItem value="อื่น">อื่น ๆ</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>รายละเอียดปัญหา</Label>
                        <Textarea
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            placeholder="ระบุอาการหรือรายละเอียด..."
                        />
                    </div>

                    <div>
                        <Label>รูปภาพประกอบ (ถ้ามี)</Label>
                        <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={e => setImages(e.target.files)}
                        />
                    </div>

                    <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'กำลังบันทึก...' : 'บันทึกรายการ'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
