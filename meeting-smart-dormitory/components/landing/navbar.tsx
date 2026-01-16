import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <Link className="flex items-center gap-2 font-bold text-emerald-600" href="/">
                    <Building2 className="h-6 w-6" />
                    <span>SmartDorm</span>
                </Link>
                <nav className="flex items-center gap-6">
                    <Link className="text-sm font-medium hover:text-emerald-600 transition-colors hidden md:block" href="#features">
                        สิ่งอำนวยความสะดวก
                    </Link>
                    <Link className="text-sm font-medium hover:text-emerald-600 transition-colors hidden md:block" href="#rooms">
                        ห้องพัก
                    </Link>
                    <Link className="text-sm font-medium hover:text-emerald-600 transition-colors hidden md:block" href="#contact">
                        ติดต่อเรา
                    </Link>
                    <Link href="/login">
                        <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                            เข้าสู่ระบบ
                        </Button>
                    </Link>
                </nav>
            </div>
        </header>
    )
}
