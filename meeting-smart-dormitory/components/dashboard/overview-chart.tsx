"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface OverviewChartProps {
    data: {
        name: string
        total: number
        occupants: number
    }[]
}

export function OverviewChart({ data }: OverviewChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>ภาพรวมรายได้และการเข้าพัก</CardTitle>
                <CardDescription>
                    แสดงแนวโน้มรายได้ (บาท) จำนวนผู้เช่า (คน) รายเดือน
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value: number) => `฿${value.toLocaleString()}`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value: number) => `${value} คน`}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                                formatter={(value: any, name: any) => {
                                    if (name === "รายได้" || name === "total") return [`฿${value.toLocaleString()}`, "รายได้"]
                                    if (name === "ผู้เช่า" || name === "occupants") return [`${value} คน`, "ผู้เช่า"]
                                    return [value, name]
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="total"
                                stroke="#0f172a"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                                name="รายได้"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="occupants"
                                stroke="#22c55e"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                                name="ผู้เช่า"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
