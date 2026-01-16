import { Metadata } from "next"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
    title: "Login - SmartDormitory",
    description: "Login to your account",
}

export default function LoginPage() {
    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-zinc-900 p-10 text-white dark:border-r lg:flex overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                        backgroundSize: '32px 32px'
                    }}
                />

                {/* Gradient Overlay for Depth */}
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-900 via-transparent to-zinc-900/50" />
                <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-zinc-950 to-transparent" />

                {/* Content */}
                <div className="relative z-20 flex items-center text-lg font-medium tracking-tight">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm mr-3 border border-white/20 shadow-inner">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-white"
                        >
                            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold">SmartDormitory</span>
                </div>

                <div className="relative z-20 mt-auto max-w-md">
                    <blockquote className="space-y-4">
                        <p className="text-3xl font-bold leading-tight tracking-tight text-white/90 drop-shadow-sm">
                            &ldquo;วิธีที่ดีที่สุดในการจัดการหอพักของคุณ ตั้งแต่ผู้เช่าไปจนถึงช่างซ่อม&rdquo;
                        </p>
                        <footer className="text-sm font-medium text-white/60">
                            แพลตฟอร์มบริหารจัดการหอพักอัจฉริยะแบบครบวงจร
                        </footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            เข้าสู่ระบบบัญชีของคุณ
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            เลือกบทบาทของคุณเพื่อดำเนินการต่อ
                        </p>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>ลงชื่อเข้าใช้</CardTitle>
                            <CardDescription>กรอกข้อมูลเพื่อเข้าสู่ระบบ</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LoginForm />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
