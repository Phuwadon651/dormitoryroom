import { Suspense } from "react"
import { MeterReadingList } from "@/components/utilities/meter-reading-list"
import { getMeterReadings } from "@/actions/meter-actions"
import { Loader2 } from "lucide-react"

// Helper to get default period
function getCurrentPeriod() {
    const now = new Date();
    return {
        month: String(now.getMonth() + 1), // 1-12
        year: String(now.getFullYear()) // 2024
    };
}

export default async function UtilitiesPage({
    searchParams,
}: {
    // แก้ไข 1: เปลี่ยน Type เป็น Promise ตามมาตรฐาน Next.js 15
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { month, year } = getCurrentPeriod();

    // แก้ไข 2: ต้อง await searchParams ก่อนใช้งาน
    const resolvedSearchParams = await searchParams;

    // แก้ไข 3: ใช้ตัวแปรที่ await แล้ว (resolvedSearchParams) แทนตัวเดิม
    const selectedMonth = (resolvedSearchParams?.month as string) || month;
    const selectedYear = (resolvedSearchParams?.year as string) || year;

    // Fetch data
    const readings = await getMeterReadings(selectedMonth, selectedYear);

    // Map API response to MeterReading type
    const formattedReadings = readings.map((item: any) => ({
        room_id: item.room_id,
        room_number: item.room_number,
        has_tenant: item.has_tenant,
        tenant_name: item.tenant_name,
        reading_date: item.reading ? item.reading.date : "",
        month_cycle: `${selectedMonth}/${selectedYear}`,

        prev_water: 0, // Need previous logic if API doesn't provide
        current_water: item.reading ? item.reading.water : 0,
        water_usage: 0,

        prev_electric: 0,
        current_electric: item.reading ? item.reading.electricity : 0,
        electric_usage: 0,

        is_saved: !!item.reading, // <--- Key fix: If reading object exists, it is saved
        id: item.reading ? item.reading.id : undefined
    }));

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">จดมิเตอร์ (Meter Reading)</h2>
                    <p className="text-muted-foreground">
                        บันทึกเลขมิเตอร์น้ำและไฟฟ้าประจำเดือน {selectedMonth}/{selectedYear}
                    </p>
                </div>
            </div>

            <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
                <MeterReadingList
                    initialReadings={formattedReadings}
                    month={selectedMonth}
                    year={selectedYear}
                />
            </Suspense>
        </div>
    )
}