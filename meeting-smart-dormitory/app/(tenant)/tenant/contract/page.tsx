
import { getTenantProfile } from "@/actions/tenant-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, FileText, Shield, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"

export const dynamic = 'force-dynamic'

export default async function TenantContractPage() {
    const data = await getTenantProfile()

    if (!data || !data.profile) {
        return <div className="p-8 text-center text-slate-500">ไม่พบข้อมูลสัญญา</div>
    }

    const tenant = data.profile
    // Assuming active contract is relevant one. 
    // Data structure: tenant has contracts array.
    const activeContract = tenant.contracts?.find((c: any) => c.isActive) || tenant.contracts?.[0]

    return (
        <div className="p-4 space-y-4 pb-24">
            <h1 className="text-xl font-bold mb-4">สัญญาและข้อตกลง</h1>

            {activeContract ? (
                <Card className="border-blue-100 shadow-sm">
                    <CardHeader className="bg-blue-50/50 pb-2">
                        <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            รายละเอียดสัญญาเช่า
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-slate-500 text-xs">ห้องพัก</p>
                                <p className="font-semibold">{tenant.room} - {tenant.building}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">ค่าเช่า</p>
                                <p className="font-semibold">{Number(activeContract.rent_price).toLocaleString()} บาท/เดือน</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-slate-500 text-xs flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> วันเริ่มสัญญา
                                </p>
                                <p className="font-medium">
                                    {format(new Date(activeContract.start_date), 'd MMM yyyy', { locale: th })}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> วันสิ้นสุด
                                </p>
                                <p className="font-medium">
                                    {activeContract.end_date
                                        ? format(new Date(activeContract.end_date), 'd MMM yyyy', { locale: th })
                                        : 'ไม่มีกำหนด'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border flex items-start gap-3">
                            <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-slate-700">เงินประกันความเสียหาย</p>
                                <p className="text-lg font-bold text-slate-800">฿{Number(activeContract.deposit_amount).toLocaleString()}</p>
                                <p className="text-xs text-slate-500">ได้รับคืนเมื่อย้ายออกและห้องพักอยู่ในสภาพสมบูรณ์</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="p-4 border rounded-lg bg-slate-50 text-center text-slate-500">
                    ไม่พบสัญญาเช่าที่ใช้งานอยู่
                </div>
            )}

            <div className="space-y-3">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    กฎระเบียบหอพัก
                </h2>
                <div className="bg-white border rounded-xl p-4 text-sm space-y-3 shadow-sm">
                    <ul className="list-disc list-outside pl-5 space-y-2 text-slate-600">
                        <li>ห้ามส่งเสียงดังรบกวนผู้อื่นหลังเวลา 22.00 น.</li>
                        <li>ห้ามเลี้ยงสัตว์ทุกชนิดภายในห้องพัก</li>
                        <li>ห้ามสูบบุหรี่ภายในห้องพักและทางเดินส่วนกลาง</li>
                        <li>กรุณาทิ้งขยะในจุดที่กำหนดให้เท่านั้น</li>
                        <li>ชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน หากล่าช้ามีค่าปรับ 100 บาท/วัน</li>
                        <li>กรณีทำกุญแจ/คีย์การ์ดหาย คิดค่าปรับ 200 บาท/ชุด</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
