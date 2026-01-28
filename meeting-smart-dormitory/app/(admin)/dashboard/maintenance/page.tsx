import { getCurrentUser } from "@/lib/auth";
import MaintenanceView from "@/components/maintenance/maintenance-view";

export default async function MaintenancePage() {
    const user = await getCurrentUser();
    return <MaintenanceView user={user} />;
}
