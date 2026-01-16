import { Wifi, ShieldCheck, Car, Wind } from "lucide-react"

export function Features() {
    return (
        <section id="features" className="w-full py-16 md:py-24 bg-white">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                        สิ่งอำนวยความสะดวก
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-slate-800">ชีวิตที่สะดวกสบายกว่า</h2>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-4 md:grid-cols-2">

                    <div className="flex flex-col items-center space-y-4 rounded-xl border border-emerald-50/50 bg-emerald-50/30 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div className="p-3 bg-white rounded-full shadow-sm text-emerald-600">
                            <Wifi className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">ฟรี Wi-Fi ความเร็วสูง</h3>
                        <p className="text-sm text-slate-500 text-center">
                            อินเทอร์เน็ตไฟเบอร์ออปติก ครอบคลุมทุกพื้นที่
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4 rounded-xl border border-emerald-50/50 bg-emerald-50/30 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div className="p-3 bg-white rounded-full shadow-sm text-emerald-600">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">ระบบความปลอดภัย</h3>
                        <p className="text-sm text-slate-500 text-center">
                            กล้องวงจรปิด 24 ชม. และระบบคีย์การ์ดเข้า-ออก
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4 rounded-xl border border-emerald-50/50 bg-emerald-50/30 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div className="p-3 bg-white rounded-full shadow-sm text-emerald-600">
                            <Car className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">ที่จอดรถกว้างขวาง</h3>
                        <p className="text-sm text-slate-500 text-center">
                            รองรับทั้งรถยนต์และรถจักรยานยนต์อย่างเพียงพอ
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4 rounded-xl border border-emerald-50/50 bg-emerald-50/30 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div className="p-3 bg-white rounded-full shadow-sm text-emerald-600">
                            <Wind className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">บรรยากาศร่มรื่น</h3>
                        <p className="text-sm text-slate-500 text-center">
                            แวดล้อมด้วยต้นไม้และการออกแบบที่โปร่งสบาย
                        </p>
                    </div>

                </div>
            </div>
        </section>
    )
}
