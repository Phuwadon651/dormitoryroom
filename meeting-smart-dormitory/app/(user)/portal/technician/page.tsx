import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function TechnicianPortal() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">งานซ่อมบำรุง</h2>
                <div className="flex space-x-2">
                    <Button size="sm" variant="outline">ประวัติงาน</Button>
                    <Button size="sm">งานใหม่ (3)</Button>
                </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-4">งานที่รอรับดำเนินการ</h3>
            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>ซ่อมแอร์ไม่เย็น</CardTitle>
                                <CardDescription>ห้อง 404 - ตึก A • แจ้งเมื่อ 2 ชม. ที่แล้ว</CardDescription>
                            </div>
                            <Button size="sm">รับงาน</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">รายละเอียด: แอร์มีแต่ลมร้อนออกมา ช่วยมาดูให้หน่อยครับ</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>ท่อน้ำรั่ว</CardTitle>
                                <CardDescription>ห้อง 201 - ตึก B • แจ้งเมื่อ 4 ชม. ที่แล้ว</CardDescription>
                            </div>
                            <Button size="sm">รับงาน</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">รายละเอียด: น้ำหยดมาจากใต้อ่างล้างหน้า</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
