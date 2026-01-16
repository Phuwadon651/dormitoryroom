import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
    return (
        <section className="relative w-full py-20 md:py-32 lg:py-48 bg-gradient-to-b from-emerald-50 to-white overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-teal-100/50 blur-3xl"></div>

            <div className="container relative px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-slate-800">
                            พักผ่อนสบาย ในบรรยากาศ<span className="text-emerald-600">เป็นธรรมชาติ</span>
                        </h1>
                        <p className="mx-auto max-w-[700px] text-slate-600 md:text-xl">
                            SmartDorm หอพักทันสมัย สะอาด ปลอดภัย พร้อมสิ่งอำนวยความสะดวกครบครัน
                            ตอบโจทย์ชีวิตคนเมืองที่ต้องการความสงบ
                        </p>
                    </div>
                    <div className="space-x-4">
                        <Link href="#rooms">
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8">
                                ดูห้องพักว่าง
                            </Button>
                        </Link>
                        <Link href="#contact">
                            <Button variant="outline" size="lg" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-full px-8">
                                สอบถามข้อมูล
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
