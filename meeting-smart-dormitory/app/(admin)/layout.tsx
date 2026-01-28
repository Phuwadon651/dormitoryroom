import Link from "next/link"
import { LayoutWrapper } from "@/components/dashboard/layout-wrapper"
import { getCurrentUser } from "@/lib/auth"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    return (
        <LayoutWrapper currentUser={user}>
            {children}
        </LayoutWrapper>
    )
}
