import { Suspense } from "react"
import { getSettings } from "@/actions/settings-actions"
import { SettingsForm } from "@/components/settings/settings-form"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
    const { success, data, error } = await getSettings()

    if (!success) {
        // If unauthorized or error, handle gracefull
        // For 403, maybe redirect or show error component
        if (error === 'Unauthorized') {
            // Depending on how auth actions work, maybe redirect to login or dashboard
            // But usually middleware handles this. 
            // If we get here, it means backend rejected us.
            return (
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                    <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                </div>
            )
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">ตั้งค่าระบบ (Settings)</h1>
                <p className="text-muted-foreground">
                    กำหนดค่าต่างๆ ของหอพัก ข้อมูลการเงิน และการแจ้งเตือน
                </p>
            </div>

            <Suspense fallback={<div>Loading settings...</div>}>
                <SettingsForm initialSettings={data || {}} />
            </Suspense>
        </div>
    )
}
