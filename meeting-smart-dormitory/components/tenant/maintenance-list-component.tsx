
import { MaintenanceRequest } from "@/types/maintenance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, CheckCircle2, AlertCircle, Clock } from "lucide-react"

interface MaintenanceListProps {
    requests: MaintenanceRequest[];
    onClick: (req: MaintenanceRequest) => void;
}

export function MaintenanceList({ requests, onClick }: MaintenanceListProps) {
    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                <Wrench className="w-10 h-10 mb-2 opacity-20" />
                <p>ไม่มีรายการ</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map(req => (
                <MaintenanceCard key={req.maintenance_id} request={req} onClick={() => onClick(req)} />
            ))}
        </div>
    );
}

function MaintenanceCard({ request, onClick }: { request: MaintenanceRequest, onClick: () => void }) {
    // Determine Status Config
    const statusConfig = {
        pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "รอรับงาน", icon: AlertCircle },
        in_progress: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "กำลังดำเนินการ", icon: Wrench },
        completed: { color: "bg-green-100 text-green-800 border-green-200", label: "เสร็จสิ้น", icon: CheckCircle2 }
    }[request.status as 'pending' | 'in_progress' | 'completed'] || { color: "bg-gray-100", label: request.status, icon: AlertCircle };

    const StatusIcon = statusConfig.icon

    return (
        <Card className="cursor-pointer hover:shadow-md transition-all border-slate-200 hover:border-blue-300 group" onClick={onClick}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        ห้อง {request.room?.room_number || request.room_id}
                    </CardTitle>
                    <p className="text-xs text-slate-500">ชั้น {request.room?.floor || '-'}</p>
                </div>
                <Badge variant="outline" className={`${statusConfig.color} border gap-1 shadow-sm`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 border-b pb-2">
                        <Clock className="w-3 h-3" />
                        {new Date(request.report_date).toLocaleDateString('th-TH')}
                    </div>

                    <div>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-600 mb-1 inline-block">
                            {request.repair_type}
                        </span>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1 leading-relaxed min-h-[40px]">
                            {request.damage_details}
                        </p>
                    </div>

                    {request.report_images && request.report_images.length > 0 && (
                        <div className="flex gap-1 mt-2">
                            <div className="text-[10px] bg-slate-100 px-1 rounded flex items-center text-slate-500 font-medium">
                                + มีรูปภาพแนบ
                            </div>
                        </div>
                    )}

                    {/* Expense Badge if > 0 */}
                    {Number(request.expense_amount) > 0 && (
                        <div className="mt-2 pt-2 border-t flex justify-between items-center text-xs">
                            <span className="text-slate-500">ค่าใช้จ่าย:</span>
                            <span className="font-bold text-red-600">{Number(request.expense_amount).toLocaleString()} ฿</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
