import { getCurrentUser } from "@/lib/auth"
import { getUsers } from "@/actions/user-actions"
import { getRoles } from "@/actions/role-actions"
import { RoleManagement } from "@/components/roles/role-management"
import { redirect } from "next/navigation"

export default async function RoleManagementPage() {
    const user = await getCurrentUser()
    if (!user) {
        redirect("/login")
    }

    // Parallel fetching
    const [users, rolesResult] = await Promise.all([
        getUsers(),
        getRoles()
    ])

    const roles = rolesResult.success ? rolesResult.data : []

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">การจัดการบทบาท (Role Management)</h1>
                <p className="text-muted-foreground">
                    กำหนดสิทธิ์การเข้าถึงและจัดการบทบาทผู้ใช้งานในระบบ
                </p>
            </div>

            <RoleManagement
                initialRoles={roles}
                users={users}
                currentUserId={user.id}
            />
        </div>
    )
}
