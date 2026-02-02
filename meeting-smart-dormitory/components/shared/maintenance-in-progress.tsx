import { Construction } from "lucide-react"

export function MaintenanceInProgress() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-4">
            <div className="bg-orange-100 p-4 rounded-full">
                <Construction className="w-12 h-12 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">รายการแจ้งซ่อม</h1>
            <div className="space-y-2">
                <p className="text-xl font-semibold text-orange-600">กำลังปรับปรุง</p>
                <p className="text-slate-600">ระบบกำลังดำเนินการปรับปรุง ขออภัยในความไม่สะดวก</p>
            </div>
        </div>
    )
}
