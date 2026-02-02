"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2, Image, X } from "lucide-react"
import { createMaintenanceRequest } from "@/actions/maintenance-actions"
import { getRooms } from "@/actions/room-actions"
import { toast } from "sonner"

export default function CreateMaintenanceModal({
    refresh,
    prefilledRoom
}: {
    refresh: () => void;
    prefilledRoom?: {
        id: string | number;
        room_number: string;
        building?: string;
        floor?: string;
    }
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState<any[]>([]);

    // Form
    const [roomId, setRoomId] = useState(prefilledRoom ? String(prefilledRoom.id) : "");
    const [repairType, setRepairType] = useState("");
    const [details, setDetails] = useState("");
    const [images, setImages] = useState<FileList | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (!prefilledRoom) {
                loadRooms();
            } else {
                setRoomId(String(prefilledRoom.id));
            }
        }
    }, [isOpen, prefilledRoom]);

    const loadRooms = async () => {
        try {
            const data = await getRooms();
            setRooms(data);
        } catch (error) {
            console.error("Failed to load rooms", error);
        }
    }

    const handleSubmit = async () => {
        if (!roomId || !repairType || !details) {
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('room_id', roomId);
            formData.append('repair_type', repairType);
            formData.append('damage_details', details);
            formData.append('report_date', new Date().toISOString());

            if (images) {
                Array.from(images).forEach((file, index) => {
                    formData.append(`report_images[${index}]`, file);
                });
            }

            const result = await createMaintenanceRequest(formData);

            if (result.success) {
                toast.success("บันทึกการแจ้งซ่อมเรียบร้อย");
                setIsOpen(false);
                refresh();
                // Reset form
                if (!prefilledRoom) setRoomId("");
                setRepairType("");
                setDetails("");
                setImages(null);
            } else {
                toast.error(result.message || "เกิดข้อผิดพลาด");
            }
        } catch (e) {
            console.error(e);
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Plus className="h-4 w-4" />
                    แจ้งซ่อมใหม่
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800">แจ้งปัญหา / แจ้งซ่อม</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>ห้องพัก <span className="text-red-500">*</span></Label>
                        {prefilledRoom ? (
                            <Input
                                value={`ห้อง ${prefilledRoom.room_number} ${prefilledRoom.floor ? `(ชั้น ${prefilledRoom.floor})` : ''}`}
                                disabled
                                className="bg-slate-50 text-slate-600"
                            />
                        ) : (
                            <Select onValueChange={setRoomId} value={roomId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกห้องที่พบปัญหา" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rooms.map(room => (
                                        <SelectItem key={room.room_id} value={String(room.room_id)}>
                                            ห้อง {room.room_number} {room.floor ? `(ชั้น ${room.floor})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>หมวดหมู่ปัญหา <span className="text-red-500">*</span></Label>
                        <Select onValueChange={setRepairType} value={repairType}>
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ไฟฟ้า">ไฟฟ้า / หลอดไฟ</SelectItem>
                                <SelectItem value="ประปา">น้ำประปา / ท่อน้ำ</SelectItem>
                                <SelectItem value="เครื่องใช้ไฟฟ้า">เครื่องใช้ไฟฟ้า (แอร์/ตู้เย็น)</SelectItem>
                                <SelectItem value="เฟอร์นิเจอร์">เฟอร์นิเจอร์ / ประตู / หน้าต่าง</SelectItem>
                                <SelectItem value="โครงสร้างห้อง/อาคาร">พื้น / ผนัง / เพดาน</SelectItem>
                                <SelectItem value="ความสะอาด">ความสะอาด / ขยะ</SelectItem>
                                <SelectItem value="อื่น">อื่น ๆ</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>รายละเอียดเพิ่มเติม <span className="text-red-500">*</span></Label>
                        <Textarea
                            className="min-h-[100px]"
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            placeholder="อธิบายอาการที่พบ หรือสาเหตุ (ถ้าทราบ)..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>รูปภาพประกอบ</Label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 border-dashed rounded-lg p-4 flex flex-col items-center justify-center w-full transition-colors h-32">
                                <Image className="w-8 h-8 text-slate-400 mb-2" />
                                <span className="text-xs text-slate-500">คลิกเพื่ออัพโหลดรูปภาพ</span>
                                <Input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => setImages(e.target.files)}
                                />
                            </label>
                        </div>
                        {images && indexImagesNames(images)}
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-2" onClick={handleSubmit} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                        {loading ? 'กำลังบันทึก...' : 'ส่งเรื่องแจ้งซ่อม'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function indexImagesNames(files: FileList) {
    return (
        <div className="text-xs text-slate-500 space-y-1">
            {Array.from(files).map((f, i) => (
                <div key={i} className="flex items-center gap-1 text-slate-600">
                    <span className="truncate max-w-[200px]">{f.name}</span>
                </div>
            ))}
        </div>
    )
}
