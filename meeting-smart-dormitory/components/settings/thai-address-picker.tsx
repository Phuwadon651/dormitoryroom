import { useState, useMemo, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useThaiAddress } from "@/hooks/use-thai-address"

interface AddressState {
    province: string
    amphoe: string
    district: string
    zipcode: string
}

interface ThaiAddressPickerProps {
    value: AddressState
    onChange: (value: AddressState) => void
}

export function ThaiAddressPicker({ value, onChange }: ThaiAddressPickerProps) {
    const { data, loading } = useThaiAddress()

    // Get unique Provinces
    const provinces = useMemo(() => {
        const p = new Set(data.map(d => d.province))
        return Array.from(p).sort()
    }, [data])

    // Get Amphoes based on Province
    const amphoes = useMemo(() => {
        if (!value.province) return []
        const a = new Set(data.filter(d => d.province === value.province).map(d => d.amphoe))
        return Array.from(a).sort()
    }, [data, value.province])

    // Get Districts (Tambons) based on Province and Amphoe
    // Note: Some Tambon names might duplicate across amphoes (rare but possible), filtering by Parent ID is safer technically but names work for 99%
    const districts = useMemo(() => {
        if (!value.province || !value.amphoe) return []
        const d = data.filter(item => item.province === value.province && item.amphoe === value.amphoe)
        return d
    }, [data, value.province, value.amphoe])

    const handleProvinceChange = (p: string) => {
        onChange({ ...value, province: p, amphoe: '', district: '', zipcode: '' })
    }

    const handleAmphoeChange = (a: string) => {
        onChange({ ...value, amphoe: a, district: '', zipcode: '' })
    }

    const handleDistrictChange = (dName: string) => {
        // Find the specific entry to get zipcode
        const selected = districts.find(item => item.district === dName)
        onChange({
            ...value,
            district: dName,
            zipcode: selected ? selected.zipcode.toString() : ''
        })
    }

    if (loading) return <div className="text-sm text-slate-500">กำลังโหลดข้อมูลที่อยู่...</div>

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>จังหวัด</Label>
                <Select value={value.province} onValueChange={handleProvinceChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="เลือกจังหวัด" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {provinces.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>เขต/อำเภอ</Label>
                <Select value={value.amphoe} onValueChange={handleAmphoeChange} disabled={!value.province}>
                    <SelectTrigger>
                        <SelectValue placeholder="เลือกเขต/อำเภอ" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {amphoes.map(a => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>แขวง/ตำบล</Label>
                <Select value={value.district} onValueChange={handleDistrictChange} disabled={!value.amphoe}>
                    <SelectTrigger>
                        <SelectValue placeholder="เลือกแขวง/ตำบล" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {districts.map((d, i) => (
                            <SelectItem key={`${d.district}-${i}`} value={d.district}>{d.district}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>รหัสไปรษณีย์</Label>
                <Input value={value.zipcode} readOnly className="bg-slate-50" />
            </div>
        </div>
    )
}
