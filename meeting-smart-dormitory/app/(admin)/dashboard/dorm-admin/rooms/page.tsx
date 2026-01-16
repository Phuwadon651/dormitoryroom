import { getRooms } from "@/actions/room-actions"
import { RoomManagement } from "@/components/rooms/room-management"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export default async function RoomsPage() {
    const rooms = await getRooms()
    const user = await getCurrentUser()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">รายการห้องพัก</h2>
                    <p className="text-muted-foreground">จัดการข้อมูลห้องพักและสถานะ</p>
                </div>
            </div>

            <RoomManagement initialRooms={rooms} currentUser={user} />
        </div>
    )
}
