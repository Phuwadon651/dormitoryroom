"use client"

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { User } from "@/types/user";
import { MaintenanceRequest } from "@/types/maintenance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import UpdateMaintenanceModal from "./update-maintenance-modal";
import CreateMaintenanceModal from "./create-maintenance-modal";

interface MaintenanceViewProps {
    user: User;
}

export default function MaintenanceView({ user }: MaintenanceViewProps) {
    const isTechnician = user.role === 'Technician';
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/maintenances`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming token storage
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error("Failed to fetch maintenance requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Tabs logic
    // Admin: all, pending, in_progress, completed
    // Tech: all, in_progress, completed, withdrawal

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const currentTab = searchParams.get('status') || 'all';

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('status', value);
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">รายการแจ้งซ่อม</h2>
                {!isTechnician && (
                    <CreateMaintenanceModal refresh={fetchRequests} />
                )}
            </div>

            <Tabs defaultValue="all" value={currentTab} onValueChange={handleTabChange} className="space-y-4">
                {/* TabsList removed as per request - navigation via sidebar */}

                <TabsContent value="all" className="space-y-4">
                    {/* List All */}
                    <MaintenanceList requests={requests} user={user} refresh={fetchRequests} />
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                    <MaintenanceList requests={requests.filter(r => r.status === 'pending')} user={user} refresh={fetchRequests} />
                </TabsContent>

                <TabsContent value="in_progress" className="space-y-4">
                    <MaintenanceList requests={requests.filter(r => r.status === 'in_progress')} user={user} refresh={fetchRequests} />
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    <MaintenanceList requests={requests.filter(r => r.status === 'completed')} user={user} refresh={fetchRequests} />
                </TabsContent>

                {isTechnician && (
                    <TabsContent value="withdrawal" className="space-y-4">
                        {/* Withdrawal List */}
                        <MaintenanceList requests={requests.filter(r => r.status === 'completed')} user={user} type="withdrawal" refresh={fetchRequests} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

function MaintenanceList({ requests, user, type = 'default', refresh }: { requests: MaintenanceRequest[], user: User, type?: string, refresh: () => void }) {
    if (requests.length === 0) {
        return <div className="text-center py-10 text-slate-500">ไม่มีรายการ</div>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map(req => (
                <MaintenanceCard key={req.maintenance_id} request={req} user={user} type={type} refresh={refresh} />
            ))}
        </div>
    );
}



function MaintenanceCard({ request, user, type, refresh }: { request: MaintenanceRequest, user: User, type: string, refresh: () => void }) {
    // Determine Status Color
    const statusColor = {
        pending: "bg-yellow-100 text-yellow-800",
        in_progress: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800"
    }[request.status];

    const statusLabel = {
        pending: "รอแจ้งซ่อม",
        in_progress: "กำลังซ่อม",
        completed: "ซ่อมเสร็จสิ้น"
    }[request.status];

    const isTechnician = user.role === 'Technician';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    ห้อง {request.room?.room_number || request.room_id}
                </CardTitle>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                    {statusLabel}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-slate-500 mb-2">
                    {new Date(request.report_date).toLocaleDateString('th-TH')}
                </div>
                <div className="space-y-2">
                    <p className="text-sm font-medium">{request.repair_type}</p>
                    <p className="text-sm text-slate-600 line-clamp-2">{request.damage_details}</p>
                </div>

                <div className="mt-4">
                    <UpdateMaintenanceModal request={request} user={user} type={type} refresh={refresh} />
                </div>
            </CardContent>
        </Card>
    )
}
