import { getCurrentUser } from "@/lib/auth"
import { getUsers } from "@/actions/user-actions"
import { UserManagement } from "@/components/users/user-management"
import { redirect } from "next/navigation"

export default async function UsersPage() {
    const user = await getCurrentUser()
    if (!user) {
        redirect("/login")
    }

    const users = await getUsers()

    return (
        <div className="container mx-auto p-6 space-y-6">
            <UserManagement
                initialUsers={users}
                currentUser={user}
            />
        </div>
    )
}
