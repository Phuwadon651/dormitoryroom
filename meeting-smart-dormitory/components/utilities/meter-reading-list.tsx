"use client"

import { useState, useEffect, useMemo } from "react"
import { Building2, Save, AlertTriangle, Camera, CheckCircle2, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { MeterReading, MeterReadingPayload } from "@/types/meter"
import { saveMeterReading, saveBulkMeterReadings } from "@/actions/meter-actions"
import { cn } from "@/lib/utils"

interface MeterReadingListProps {
    initialReadings: MeterReading[];
    month: string;
    year: string;
}

export function MeterReadingList({ initialReadings, month, year }: MeterReadingListProps) {
    const [readings, setReadings] = useState<MeterReading[]>(Array.isArray(initialReadings) ? initialReadings : []);
    const [filterFloor, setFilterFloor] = useState<string>("all");
    const [saving, setSaving] = useState(false);

    // Update local state when prop changes
    useEffect(() => {
        setReadings(Array.isArray(initialReadings) ? initialReadings : []);
    }, [initialReadings]);

    const handleInputChange = (roomId: number, field: 'current_water' | 'current_electric', value: string) => {
        // Prevent NaN by falling back to 0 if parsing fails
        let numValue = value === '' ? 0 : Number(value);
        if (isNaN(numValue)) numValue = 0;

        setReadings(prev => prev.map(r => {
            if (r.room_id !== roomId) return r;

            const updated = { ...r, [field]: numValue };

            // Calculate usage immediately
            if (field === 'current_water') {
                updated.water_usage = updated.current_water - (updated.prev_water ?? 0);
            } else {
                updated.electric_usage = updated.current_electric - (updated.prev_electric ?? 0);
            }

            // Reset saved status on edit
            updated.is_saved = false;

            return updated;
        }));
    };

    const validateReading = (reading: MeterReading) => {
        const errors = [];
        const prev_water = reading.prev_water ?? 0;
        const prev_electric = reading.prev_electric ?? 0;

        if (reading.current_water < prev_water && reading.current_water !== 0) { // Assuming 0 means not filled or special case
            // Handle meter loop (9999 -> 0001) later if needed, for now simple warning
            errors.push("เลขมิเตอร์น้ำต่ำกว่าครั้งก่อน");
        }
        if (reading.current_electric < prev_electric && reading.current_electric !== 0) {
            errors.push("เลขมิเตอร์ไฟต่ำกว่าครั้งก่อน");
        }

        // Spike detection (example thresholds, can be adjustable)
        // Check if usage is > 1.5x of previous month's usage??
        // Since we don't have prev usage in this type easily effectively, 
        // We'll trust the user sees the usage number.
        // Or hardcode reasonable limits: 
        // Water > 50 units
        // Electric > 500 units
        if (reading.water_usage > 50) errors.push("ค่าน้ำสูงผิดปกติ (>50)");
        if (reading.electric_usage > 1000) errors.push("ค่าไฟสูงผิดปกติ (>1000)");

        return errors;
    };

    const handleSave = async (reading: MeterReading) => {
        const errors = validateReading(reading);
        if (errors.length > 0 && !confirm(`พบข้อควรระวัง:\n- ${errors.join('\n- ')}\n\nยืนยันจะบันทึกหรือไม่?`)) {
            return;
        }

        const payload: MeterReadingPayload = {
            room_id: reading.room_id,
            reading_date: new Date().toISOString().split('T')[0], // Today
            water_meter: reading.current_water,
            electricity_meter: reading.current_electric,
            image_proof: reading.image_proof
        };

        const res = await saveMeterReading(payload);
        if (res.success) {
            toast.success(`บันทึกห้อง ${reading.room_number} เรียบร้อย`);
            setReadings(prev => prev.map(r => r.room_id === reading.room_id ? { ...r, is_saved: true } : r));
        } else {
            toast.error(`บันทึกห้อง ${reading.room_number} ไม่สำเร็จ: ${res.error}`);
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        // Filter only modified or unsaved (logic can be adjusted)
        // For now, save all that show 'unsaved'? Or just active ones.
        // Let's filtered list
        const toSave = filteredReadings.filter(r => !r.is_saved && (r.current_water > 0 || r.current_electric > 0)); // Very basic check

        if (toSave.length === 0) {
            toast.info("ไม่มีรายการที่ต้องบันทึกเพิ่ม");
            setSaving(false);
            return;
        }

        const payloads: MeterReadingPayload[] = toSave.map(r => ({
            room_id: r.room_id,
            reading_date: new Date().toISOString().split('T')[0],
            water_meter: r.current_water,
            electricity_meter: r.current_electric,
            image_proof: r.image_proof
        }));

        await saveBulkMeterReadings(payloads);
        toast.success("บันทึกข้อมูลทั้งหมดเรียบร้อย");

        // Optimistically update all to saved (refresh will confirm)
        setReadings(prev => prev.map(r => toSave.find(ts => ts.room_id === r.room_id) ? { ...r, is_saved: true } : r));

        setSaving(false);
    };

    const floors = useMemo(() => {
        const uniqueFloors = Array.from(new Set(readings.map(r => r.room_number.charAt(0)))); // Assuming 1st char is floor, or use floor field from Room
        return uniqueFloors.sort();
    }, [readings]);

    const filteredReadings = readings.filter(r => filterFloor === 'all' || r.room_number.startsWith(filterFloor));

    const progress = Math.round((readings.filter(r => r.is_saved).length / readings.length) * 100) || 0;

    return (
        <div className="space-y-6">
            {/* Filters & Header */}
            <Card className="bg-slate-50 border-none shadow-sm">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={filterFloor} onValueChange={setFilterFloor}>
                            <SelectTrigger className="w-[140px] bg-white">
                                <SelectValue placeholder="เลือกชั้น" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกชั้น</SelectItem>
                                {floors.map(f => (
                                    <SelectItem key={f} value={f}>ชั้น {f}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="text-sm text-muted-foreground flex items-center bg-white px-3 rounded-md border">
                            {readings.filter(r => r.is_saved).length} / {readings.length} ห้อง
                        </div>
                    </div>

                    <div className="w-full sm:w-auto flex gap-2">
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            <History className="mr-2 h-4 w-4" /> รีเฟรช
                        </Button>
                        <Button onClick={handleSaveAll} disabled={saving} className="bg-green-600 hover:bg-green-700">
                            <Save className="mr-2 h-4 w-4" /> {saving ? "กำลังบันทึก..." : "บันทึกทั้งชั้น"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Progress Bar (Visual Only) */}
            <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Reading Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredReadings.map((reading) => (
                    <Card key={reading.room_id} className={cn("transition-all duration-200", reading.is_saved ? "border-green-200 bg-green-50/30" : "hover:border-blue-300")}>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">{reading.room_number}</h3>
                                    {reading.has_tenant ? (
                                        <p className="text-sm text-blue-600 font-medium truncate w-full" title={reading.tenant_name}>{reading.tenant_name}</p>
                                    ) : (
                                        <p className="text-sm text-slate-400">ห้องว่าง</p>
                                    )}
                                </div>
                                {reading.is_saved && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> บันทึกแล้ว</Badge>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>ยูนิตน้ำ (Water)</span>
                                    <span>ครั้งก่อน: {reading.prev_water ?? 0}</span>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <div className="relative flex-1">
                                        <Input
                                            type="number"
                                            className={cn("pr-12 border-blue-200 focus-visible:ring-blue-500",
                                                reading.water_usage < 0 ? "text-red-600 border-red-300" : "text-blue-900 font-semibold"
                                            )}
                                            value={reading.current_water?.toString() ?? ''}
                                            onChange={(e) => handleInputChange(reading.room_id, 'current_water', e.target.value)}
                                            placeholder={(reading.prev_water ?? 0).toString()}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600">
                                            {reading.water_usage > 0 ? `+${reading.water_usage}` : '0'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Electric Input */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>ยูนิตไฟ (Electric)</span>
                                    <span>ครั้งก่อน: {reading.prev_electric ?? 0}</span>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <div className="relative flex-1">
                                        <Input
                                            type="number"
                                            className={cn("pr-12 border-yellow-200 focus-visible:ring-yellow-500",
                                                reading.electric_usage < 0 ? "text-red-600 border-red-300" : "text-yellow-900 font-semibold"
                                            )}
                                            value={reading.current_electric?.toString() ?? ''}
                                            onChange={(e) => handleInputChange(reading.room_id, 'current_electric', e.target.value)}
                                            placeholder={(reading.prev_electric ?? 0).toString()}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-yellow-600">
                                            {reading.electric_usage > 0 ? `+${reading.electric_usage}` : '0'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="icon" className="shrink-0" title="ถ่ายรูปหลักฐาน">
                                    <Camera className="w-4 h-4 text-slate-400" />
                                </Button>
                                <Button
                                    className="flex-1 bg-slate-900 hover:bg-slate-800"
                                    onClick={() => handleSave(reading)}
                                    disabled={reading.is_saved} // Disable if saved to prevent accidental double tap
                                >
                                    {reading.is_saved ? 'บันทึกแล้ว' : 'บันทึก'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
