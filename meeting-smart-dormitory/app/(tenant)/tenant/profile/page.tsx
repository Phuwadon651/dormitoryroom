
import { getTenantProfile } from "@/actions/tenant-actions"
import { ProfileForm } from "@/components/tenant/profile-form"

export const dynamic = 'force-dynamic'

export default async function TenantProfilePage() {
    const data = await getTenantProfile()

    if (!data || !data.profile) {
        return <div className="p-8 text-center text-slate-500">ไม่พบข้อมูลผู้เช่า - อาจหมดอายุ</div>
    }

    return (
        <div className="p-4 space-y-4 pb-24">
            <h1 className="text-xl font-bold mb-4">โปรไฟล์ส่วนตัว</h1>
            <ProfileForm profile={data.profile} />
        </div>
    )
}
