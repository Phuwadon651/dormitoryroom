"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserRole } from "@/types/user"
import { Loader2 } from "lucide-react"

export function LoginForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(event.currentTarget)
        const result = await login(formData)

        if (result.success) {
            // Redirect based on role
            const role = result.role as UserRole
            switch (role) {
                case 'Admin':
                case 'DormAdmin':
                case 'Manager':
                    router.push('/dashboard/admin') // All Ops roles go to main dashboard
                    break;
                case 'Tenant':
                    router.push('/portal/tenant')
                    break;
                case 'Technician':
                    router.push('/dashboard/technician/jobs')
                    break;
                default:
                    router.push('/dashboard/admin')
            }
        } else {
            setError(result.message || "การเข้าสู่ระบบล้มเหลว")
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="username">ชื่อผู้ใช้</Label>
                <Input
                    id="username"
                    name="username"
                    placeholder="กรอกชื่อผู้ใช้ของคุณ"
                    required
                    autoCapitalize="none"
                    autoComplete="username"
                    autoCorrect="off"
                />
            </div>
            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">รหัสผ่าน</Label>
                    <a href="#" className="text-sm font-medium text-muted-foreground hover:underline">
                        ลืมรหัสผ่าน?
                    </a>
                </div>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                />
            </div>

            {error && (
                <div className="text-sm text-red-500 font-medium">
                    {error}
                </div>
            )}

            <Button disabled={loading} type="submit" className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                เข้าสู่ระบบ
            </Button>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Demo Accounts</span>
                </div>
            </div>

            <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>Admin: Administrator / Administrator</p>
                <p>Dorm Admin: Admin / Admin</p>
                <p>Manager: Manager / Manager</p>
                <p>Tenant: Tenant1 / Tenant1</p>
                <p>Technician: Technician1 / Technician1</p>
            </div>
        </form>
    )
}
