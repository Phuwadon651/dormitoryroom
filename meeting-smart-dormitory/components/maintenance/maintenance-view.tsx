"use client"

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { User } from "@/types/user";
import { MaintenanceRequest } from "@/types/maintenance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import CreateMaintenanceModal from "./create-maintenance-modal";
import MaintenanceDetailDialog from "./maintenance-detail-dialog";
import { fetchMaintenances } from "@/actions/maintenance-actions";
import { getRooms } from "@/actions/room-actions";

interface MaintenanceViewProps {
    user: User;
    technicians?: User[];
}

export default function MaintenanceView({ user, technicians = [] }: MaintenanceViewProps) {
    const isTechnician = user.role === 'Technician';
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [roomMap, setRoomMap] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const loadRequests = async () => {
        setLoading(true);
        const [data, roomsData] = await Promise.all([fetchMaintenances(), getRooms()]);

        // Build map
        const map: Record<number, string> = {};
        roomsData.forEach(r => map[r.room_id] = r.room_number);
        setRoomMap(map);

        setRequests(data);
        setLoading(false);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const currentTab = searchParams.get('status') || 'all';

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('status', value);
        router.push(`${pathname}?${params.toString()}`);
    }

    const handleCardClick = (req: MaintenanceRequest) => {
        setSelectedRequest(req);
        setDetailOpen(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">รายการแจ้งซ่อม</h2>
                {!isTechnician && (
                    <CreateMaintenanceModal refresh={loadRequests} />
                )}
            </div>

            <Tabs defaultValue="all" value={currentTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsContent value="all" className="space-y-4">
                    <MaintenanceList requests={requests} onClick={handleCardClick} user={user} roomMap={roomMap} />
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                    <MaintenanceList requests={requests.filter(r => r.status === 'pending')} onClick={handleCardClick} user={user} roomMap={roomMap} />
                </TabsContent>

                <TabsContent value="in_progress" className="space-y-4">
                    <MaintenanceList requests={requests.filter(r => r.status === 'in_progress')} onClick={handleCardClick} user={user} roomMap={roomMap} />
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    <MaintenanceList requests={requests.filter(r => r.status === 'completed')} onClick={handleCardClick} user={user} roomMap={roomMap} />
                </TabsContent>

                {isTechnician && (
                    <TabsContent value="withdrawal" className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4 text-sm text-yellow-800">
                            แสดงรายการที่ซ่อมเสร็จแล้วและมีการเบิกค่าใช้จ่าย
                        </div>
                        <MaintenanceList
                            requests={requests.filter(r => r.status === 'completed' && Number(r.expense_amount) > 0)}
                            onClick={handleCardClick}
                            user={user}
                            roomMap={roomMap}
                        />
                    </TabsContent>
                )}
            </Tabs>

            <MaintenanceDetailDialog
                request={selectedRequest}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                user={user}
                onSuccess={loadRequests}
                technicians={technicians}
                roomMap={roomMap}
            />
        </div>
    );
}

function MaintenanceList({ requests, onClick, user, roomMap }: { requests: MaintenanceRequest[], onClick: (req: MaintenanceRequest) => void, user: User, roomMap: Record<number, string> }) {
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
                <MaintenanceCard key={req.maintenance_id} request={req} onClick={() => onClick(req)} user={user} roomMap={roomMap} />
            ))}
        </div>
    );
}

function MaintenanceCard({ request, onClick, user, roomMap }: { request: MaintenanceRequest, onClick: () => void, user: User, roomMap: Record<number, string> }) {
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
                        ห้อง {request.room?.room_number ?? roomMap[request.room_id] ?? request.room_id}
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
                    {Number(request.expense_amount) > 0 && user.role.toLowerCase() !== 'tenant' && (
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
