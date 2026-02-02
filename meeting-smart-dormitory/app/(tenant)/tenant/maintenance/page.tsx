import { getSession } from "@/actions/auth-actions"
import MaintenanceView from "@/components/maintenance/maintenance-view"
import { redirect } from "next/navigation"
import { User } from "@/types/user"

export default async function TenantMaintenancePage() {
    const session = await getSession()
    if (!session) {
        redirect('/login')
    }

    const user: User = {
        id: session.userId,
        username: session.name, // Using name/id as username fallback if needed, or fetch full user
        name: session.name,
        role: session.role as any,
        // Other fields optional
    }

    return (
        <div className="p-4 pb-20"> {/* Add padding for bottom nav */}
            <MaintenanceView user={user} />
        </div>
    )
}
