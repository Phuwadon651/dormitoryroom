import { getRooms } from "@/actions/room-actions"
import { RoomShowcaseClient } from "./room-showcase-client"

export async function RoomShowcase() {
    const rooms = await getRooms()

    return (
        <section id="rooms" className="w-full py-16 md:py-24 bg-slate-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
                    <div className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                        ห้องพักของเรา
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-slate-800">เลือกห้องพักที่ใช่สำหรับคุณ</h2>
                    <p className="text-slate-500 md:w-1/2">
                        เรามีห้องพักให้เลือกหลากหลายรูปแบบ ทั้งห้องพัดลมและห้องแอร์ พร้อมเฟอร์นิเจอร์ครบครัน หิ้วกระเป๋าเข้าอยู่ได้เลย
                    </p>
                </div>

                <RoomShowcaseClient rooms={rooms} />
            </div>
        </section>
    )
}
