import { TenantManagement } from "@/components/tenants/tenant-management"
import { getSession } from "@/actions/auth-actions"

export default async function TenantManagementPage() {
    const session = await getSession();

    return (
        <TenantManagement user={session} />
    )
}
