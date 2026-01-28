import { getSettings } from "@/actions/setting-actions"
import { SettingsForm } from "@/components/settings/settings-form"
import { Settings } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const currentUser = await getCurrentUser()
    let settings = {}
    try {
        const result = await getSettings()
        settings = result || {}
    } catch (error) {
        console.error("Failed to load settings:", error)
        // Fallback to empty object to allow page to render "Under Construction" state
        settings = {}
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                    <Settings className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">ตั้งค่าระบบ</h2>
                    <p className="text-muted-foreground">จัดการข้อมูลหอพักและการตั้งค่าต่างๆ</p>
                </div>
            </div>

            <SettingsForm initialSettings={settings} currentUser={currentUser} />
        </div>
    )
}
