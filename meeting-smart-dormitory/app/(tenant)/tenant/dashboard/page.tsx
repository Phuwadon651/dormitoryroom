
import { getTenantDashboardData } from "@/actions/tenant-actions"
import Link from "next/link"
import { Megaphone, Package, ChevronRight } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function TenantDashboard() {
    const data = await getTenantDashboardData()

    if (!data) {
        return (
            <div className="p-8 text-center text-slate-500">
                ไม่พบข้อมูลผู้เช่า หรือเซสชั่นหมดอายุ
            </div>
        )
    }

    const { tenant, balance, announcements, parcels } = data

    return (
        <div className="p-4 space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">สวัสดี, {tenant.name.split(' ')[0]}</h1>
                    <p className="text-slate-500 text-sm">ห้อง {tenant.room} - {tenant.building}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">{tenant.name.charAt(0)}</span>
                </div>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    {/* Decorative Icon */}
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05 1.18 1.91 2.53 1.91 1.29 0 2.13-.72 2.13-1.55 0-.8-.67-1.17-1.98-1.48l-1.24-.29c-1.96-.46-2.9-1.54-2.9-2.77 0-2.03 1.58-3.07 3.24-3.41V5h2.67v1.9c1.42.35 2.53 1.25 2.65 2.97h-1.99c-.11-.8-1.02-1.35-2.22-1.35-1.26 0-1.94.62-1.94 1.48 0 .8.82 1.13 1.83 1.37l1.37.31c1.94.46 2.87 1.63 2.87 2.88 0 1.94-1.54 3.03-3.26 3.42z" /></svg>
                </div>

                <p className="text-blue-100 text-sm mb-1">ยอดชำระรอบปัจจุบัน</p>
                <div className="flex items-end gap-2 mb-4 relative z-10">
                    <h2 className="text-4xl font-bold">฿{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                </div>

                {balance > 0 ? (
                    <Link href="/tenant/invoices" className="block text-center w-full bg-white text-blue-600 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm">
                        ชำระเงิน
                    </Link>
                ) : (
                    <div className="w-full bg-white/20 text-white py-2.5 rounded-xl text-center font-medium text-sm backdrop-blur-sm">
                        ไม่มียอดค้างชำระ
                    </div>
                )}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border text-left rounded-xl p-4 flex flex-col justify-between h-28 hover:bg-slate-50 transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 text-slate-50 group-hover:text-slate-100 transition-colors">
                        <Megaphone size={80} />
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-2 z-10">
                        <Megaphone className="w-5 h-5" />
                    </div>
                    <div className="z-10">
                        <span className="text-2xl font-bold text-slate-800 block">{announcements.length}</span>
                        <span className="text-xs text-slate-500 font-medium">ประกาศหอพัก</span>
                    </div>
                </div>

                <div className="bg-white border text-left rounded-xl p-4 flex flex-col justify-between h-28 hover:bg-slate-50 transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 text-slate-50 group-hover:text-slate-100 transition-colors">
                        <Package size={80} />
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2 z-10">
                        <Package className="w-5 h-5" />
                    </div>
                    <div className="z-10">
                        <span className="text-2xl font-bold text-slate-800 block">{parcels.length}</span>
                        <span className="text-xs text-slate-500 font-medium">พัสดุมาถึง</span>
                    </div>
                </div>
            </div>

            {/* Recent Announcements Preview */}
            {announcements.length > 0 && (
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-700">ประกาศล่าสุด</h3>
                        <span className="text-xs text-slate-400">ดูทั้งหมด</span>
                    </div>
                    <div>
                        {announcements.slice(0, 2).map((item: any, idx) => (
                            <div key={item.id} className={`p-4 ${idx !== 0 ? 'border-t' : ''}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                                        {new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">{item.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
