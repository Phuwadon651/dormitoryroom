
import { getMaintenances } from "@/actions/tenant-actions"
import { MaintenanceList } from "@/components/tenant/maintenance-list"

export const dynamic = 'force-dynamic'

export default async function TenantMaintenancePage() {
    const requests = await getMaintenances()

    return (
        <MaintenanceList requests={requests} />
    )
}
