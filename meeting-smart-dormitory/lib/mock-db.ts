import { Room } from "@/types/room";
import { User } from "@/types/user";
import { Contract, Invoice, Payment } from "@/types/finance";

import { Tenant } from "@/types/tenant";

export interface Activity {
    id: string
    title: string
    description: string
    timestamp: string
    type: 'info' | 'warning' | 'success' | 'error'
}

export interface Notification {
    id: string
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
}

class MockDatabase {
    public rooms: Room[] = [];
    public contracts: Contract[] = [];
    public invoices: Invoice[] = [];
    public payments: Payment[] = [];
    public tenants: Tenant[] = [
        {
            id: "1",
            name: "นายสมชาย ใจดี",
            phone: "081-234-5678",
            room: "404",
            building: "อาคาร A",
            floor: "4",
            status: "Active",
            email: "somchai@example.com",
            moveInDate: "01/01/2025"
        },
        {
            id: "2",
            name: "นางสาวสมหญิง รักเรียน",
            phone: "089-987-6543",
            room: "202",
            building: "อาคาร B",
            floor: "2",
            status: "Active",
            email: "somying@example.com",
            moveInDate: "15/02/2025"
        },
        {
            id: "3",
            name: "นายเอกพล คนขยัน",
            phone: "090-111-2222",
            room: "101",
            building: "อาคาร A",
            floor: "1",
            status: "Pending",
            email: "ekapol@example.com",
            moveInDate: "-"
        },
        {
            id: "4",
            name: "นางสาววิภาวดี มีทรัพย์",
            phone: "088-555-4444",
            room: "305",
            building: "อาคาร B",
            floor: "3",
            status: "MovingOut",
            email: "wipawadee@example.com",
            moveInDate: "10/12/2024"
        }
    ];

    public users: User[] = [
        { id: '1', username: 'Administrator', password: 'Administrator', name: 'ผู้ดูแลระบบสูงสุด', role: 'Admin', email: 'admin@system.com', isActive: true },
        { id: '2', username: 'Admin', password: 'Admin', name: 'ผู้ดูแลหอพัก', role: 'DormAdmin', isActive: true },
        { id: '3', username: 'Manager', password: 'Manager', name: 'ผู้จัดการหอพัก', role: 'Manager', isActive: true },
        { id: '4', username: 'Tenant1', password: 'Tenant1', name: 'สมชาย ใจดี', role: 'Tenant', isActive: true },
        { id: '5', username: 'Technician1', password: 'Technician1', name: 'ช่างสมศักดิ์', role: 'Technician', isActive: true },
        { id: '6', username: 'NewManager', password: 'NewManager', name: 'ผู้จัดการคนใหม่', role: 'Manager', isActive: true },
    ];
    // ... rest of the file

    public activities: Activity[] = [
        {
            id: '1',
            title: 'แจ้งซ่อมใหม่',
            description: 'ห้อง 102 แจ้งซ่อมก๊อกน้ำรั่ว',
            timestamp: '10 นาทีที่แล้ว',
            type: 'warning'
        },
        {
            id: '2',
            title: 'ชำระค่าเช่า',
            description: 'ห้อง 201 ชำระค่าเช่าเดือนมกราคม',
            timestamp: '30 นาทีที่แล้ว',
            type: 'success'
        },
        {
            id: '3',
            title: 'ผู้เช่าใหม่',
            description: 'ทำสัญญาเช่าห้อง 305',
            timestamp: '2 ชั่วโมงที่แล้ว',
            type: 'info'
        },
        {
            id: '4',
            title: 'แจ้งเตือนมิเตอร์',
            description: 'ถึงกำหนดจดมิเตอร์น้ำ-ไฟ',
            timestamp: '5 ชั่วโมงที่แล้ว',
            type: 'info'
        }
    ];

    addActivity(title: string, description: string, type: Activity['type'] = 'info') {
        const newActivity: Activity = {
            id: Math.random().toString(36).substring(7),
            title,
            description,
            timestamp: 'เมื่อสักครู่',
            type
        };
        this.activities.unshift(newActivity);
        // Keep only last 20 activities
        if (this.activities.length > 20) {
            this.activities = this.activities.slice(0, 20);
        }
        return newActivity;
    }
}

// Singleton instance
const globalForMockDb = globalThis as unknown as {
    mockDb: MockDatabase | undefined
}

export const mockDb = globalForMockDb.mockDb ?? new MockDatabase()

// Force init for existing singleton (HMR support)
if (!mockDb.contracts) mockDb.contracts = []
if (!mockDb.invoices) mockDb.invoices = []
if (!mockDb.payments) mockDb.payments = []
if (!mockDb.tenants) mockDb.tenants = []

if (process.env.NODE_ENV !== 'production') {
    globalForMockDb.mockDb = mockDb
}
