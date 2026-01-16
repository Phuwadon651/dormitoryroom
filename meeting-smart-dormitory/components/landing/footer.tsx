import Link from "next/link"
import { Building2, Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
    return (
        <footer id="contact" className="w-full py-12 bg-slate-900 text-slate-200">
            <div className="container px-4 md:px-6">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

                    <div className="space-y-4">
                        <Link className="flex items-center gap-2 font-bold text-emerald-400 text-xl" href="/">
                            <Building2 className="h-6 w-6" />
                            <span>SmartDorm</span>
                        </Link>
                        <p className="text-sm text-slate-400">
                            หอพักยุคใหม่ ใส่ใจคุณภาพชีวิต สะอาด ปลอดภัย
                            และเป็นมิตรกับสิ่งแวดล้อม
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-white">เมนูลัด</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">หน้าแรก</Link></li>
                            <li><Link href="#features" className="hover:text-emerald-400 transition-colors">สิ่งอำนวยความสะดวก</Link></li>
                            <li><Link href="#rooms" className="hover:text-emerald-400 transition-colors">ห้องพัก</Link></li>
                            <li><Link href="/login" className="hover:text-emerald-400 transition-colors">เข้าสู่ระบบลูกบ้าน</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-white">ติดต่อเรา</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-emerald-400" />
                                <span>081-234-5678</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-emerald-400" />
                                <span>contact@smartdorm.com</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-emerald-400 mt-1" />
                                <span>123 ถ.สุขุมวิท เขตวัฒนา กรุงเทพฯ 10110</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-white">ติดตามข่าวสาร</h3>
                        <div className="flex space-x-4">
                            <Link href="#" className="p-2 rounded-full bg-slate-800 hover:bg-emerald-600 hover:text-white transition-all">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-slate-800 hover:bg-pink-600 hover:text-white transition-all">
                                <Instagram className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                </div>
                <div className="mt-12 border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
                    © 2024 SmartDormitory. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
