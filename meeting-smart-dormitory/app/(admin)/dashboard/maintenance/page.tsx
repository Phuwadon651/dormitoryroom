import MaintenanceView from "@/components/maintenance/maintenance-view";
import { getSession } from "@/actions/auth-actions";
import { getTechnicians } from "@/actions/user-actions";
import { User, UserRole } from "@/types/user";
import { redirect } from "next/navigation";

export default async function MaintenancePage() {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    const user: User = {
        id: session.userId,
        username: session.name,
        name: session.name,
        role: session.role as UserRole
    };

    let technicians: User[] = [];
    if (['Admin', 'Manager', 'DormAdmin'].includes(user.role)) {
        technicians = await getTechnicians();
    }

    return <MaintenanceView user={user} technicians={technicians} />;
}
