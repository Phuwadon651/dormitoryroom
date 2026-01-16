import { getCurrentUser } from "@/lib/auth"
import { getUsers } from "@/actions/user-actions"
import { UserManagement } from "@/components/users/user-management"
import { redirect } from "next/navigation"

export default async function UserListPage() {
    const user = await getCurrentUser()
    if (!user) {
        redirect("/login")
    }

    const users = await getUsers()

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">รายชื่อผู้ใช้งาน</h1>
                <p className="text-muted-foreground">
                    จัดการข้อมูลผู้ใช้งานในระบบ
                </p>
            </div>

            <UserManagement
                initialUsers={users}
                currentUser={user}
            />
        </div>
    )
}
