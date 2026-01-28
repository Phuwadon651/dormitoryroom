import { MeterManagement } from "@/components/meter/meter-management"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export default async function MeterReadingsPage() {
    const user = await getCurrentUser()

    return (
        <div className="space-y-6">
            <MeterManagement currentUser={user} />
        </div>
    )
}
