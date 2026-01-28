"use server"

import { Tenant } from "@/types/tenant";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth-actions";

const API_URL = 'http://127.0.0.1:8000/api';

async function getAuthHeaders() {
    const session = await getSession();
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': session ? `Bearer ${session.token}` : ''
    };
}

function mapToFrontend(apiTenant: any): Tenant {
    return {
        id: apiTenant.id.toString(),
        name: apiTenant.name,
        phone: apiTenant.phone,
        room: apiTenant.room ? apiTenant.room.room_number : '', // Flatten room object to string
        building: 'อาคาร A', // Default or fetch from room if added
        floor: apiTenant.room ? apiTenant.room.floor.toString() : '',
        status: apiTenant.status,
        email: apiTenant.email,
        moveInDate: apiTenant.move_in_date,
        avatar: '',
        username: apiTenant.user ? apiTenant.user.username : '',
        plain_password: apiTenant.plain_password || ''
    };
}

export async function getTenants(): Promise<Tenant[]> {
    const headers = await getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/tenants`, {
            headers,
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.map(mapToFrontend);
    } catch (error) {
        return [];
    }
}

export async function createTenant(data: Omit<Tenant, 'id'>): Promise<{ success: boolean; data?: Tenant; error?: string }> {
    const headers = await getAuthHeaders();

    // 1. Look up Room ID
    let roomId = null;
    let roomFloor = data.floor || '1'; // Default or preserve

    if (data.room) {
        try {
            const roomRes = await fetch(`${API_URL}/rooms`, { headers });
            if (roomRes.ok) {
                const rooms = await roomRes.json();
                // Loose comparison for room number (string vs number)
                const found = rooms.find((r: any) => String(r.room_number) === String(data.room));
                if (found) {
                    roomId = found.id;
                    roomFloor = found.floor;
                }
            }
        } catch (e) {
            console.error("Room lookup failed", e);
        }
    }

    if (!roomId) {
        return { success: false, error: `ไม่พบข้อมูลห้องพักเลขที่ ${data.room}` };
    }

    const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        room_id: roomId,
        status: data.status,
        move_in_date: data.moveInDate,
        line_id: '',
        username: data.username,
        password: data.password,
        skip_contract: (data as any).skipContract,
    };

    try {
        const res = await fetch(`${API_URL}/tenants`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const text = await res.text();
            console.error('Create Tenant Failed:', res.status, text);

            // Try to parse Laravel validation error
            try {
                const jsonErr = JSON.parse(text);
                if (jsonErr.message) {
                    let msg = jsonErr.message;
                    // Translate common errors
                    if (msg.includes('email has already been taken')) msg = 'อีเมลนี้มีผู้ใช้งานในระบบแล้ว';
                    else if (msg.includes('username has already been taken')) msg = 'เบอร์โทรศัพท์นี้มีผู้ใช้งานในระบบแล้ว';
                    else if (msg.includes('phone has already been taken')) msg = 'เบอร์โทรศัพท์นี้ถูกลงทะเบียนแล้ว';

                    return { success: false, error: msg };
                }
            } catch { }

            return { success: false, error: `บันทึกไม่สำเร็จ (Status: ${res.status})` };
        }

        const newItem = await res.json();
        revalidatePath('/', 'layout');
        return {
            success: true,
            data: mapToFrontend(newItem)
        };

    } catch (e) {
        console.error('Create Tenant Exception:', e);
        return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์' };
    }
}

export async function updateTenant(id: string, data: Partial<Tenant>): Promise<{ success: boolean; data?: Tenant; error?: string }> {
    const headers = await getAuthHeaders();

    const payload: any = { ...data };
    if (data.moveInDate) payload.move_in_date = data.moveInDate;

    // Look up Room ID if room is provided
    if (data.room) {
        try {
            const roomRes = await fetch(`${API_URL}/rooms`, { headers });
            if (roomRes.ok) {
                const rooms = await roomRes.json();
                const found = rooms.find((r: any) => String(r.room_number) === String(data.room));
                if (found) {
                    payload.room_id = found.id;
                }
            }
        } catch (e) {
            console.error("Room lookup failed", e);
        }
    }

    try {
        const res = await fetch(`${API_URL}/tenants/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            revalidatePath('/', 'layout');
            const updatedData = await res.json();
            return { success: true, data: mapToFrontend(updatedData) };
        }

        const text = await res.text();
        try {
            const jsonErr = JSON.parse(text);
            if (jsonErr.message) return { success: false, error: jsonErr.message };
        } catch { }

        return { success: false, error: `Update failed: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}` };

    } catch (e) {
        return { success: false, error: 'Connection error' };
    }
}

export async function deleteTenant(id: string): Promise<{ success: boolean; error?: string }> {
    const headers = await getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/tenants/${id}`, {
            method: 'DELETE',
            headers
        });

        if (res.ok) {
            revalidatePath('/', 'layout');
            return { success: true };
        }

        const text = await res.text();
        try {
            const jsonErr = JSON.parse(text);
            if (jsonErr.message) return { success: false, error: jsonErr.message };
        } catch { }

        return { success: false, error: `Delete failed: ${text.substring(0, 100)}` };

    } catch (e) {
        return { success: false, error: 'Network error occurred' };
    }
}

export async function getTenantProfile() {
    const headers = await getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/tenants/me`, {
            headers,
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error('Get Tenant Profile Error:', e);
        return null;
    }
}

export async function getTenantDashboardData() {
    const profileData = await getTenantProfile();
    if (!profileData || !profileData.profile) {
        return null;
    }

    const tenant = profileData.profile;
    let totalBalance = 0;

    // Calculate Balance from Contracts -> Invoices
    if (tenant.contracts) {
        tenant.contracts.forEach((contract: any) => {
            if (contract.invoices) {
                contract.invoices.forEach((inv: any) => {
                    if (inv.status === 'Pending' || inv.status === 'Overdue') {
                        totalBalance += Number(inv.total_amount);
                    }
                });
            }
        });
    }

    // Mock Announcements & Parcels for now as backend might not have them
    const announcements = [
        { id: 1, title: 'แจ้งปิดปรับปรุงระบบน้ำ', date: '2024-01-20', content: 'จะมีการปิดปรับปรุงระบบน้ำในวันที่ 25 ม.ค. เวลา 10:00 - 12:00 น.' },
        { id: 2, title: 'กำหนดการชำระค่าเช่า', date: '2024-01-01', content: 'กรุณาชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน' }
    ];

    const parcels: any[] = [
        // { id: 1, arrived_at: '2024-01-22', carrier: 'Kerry', tracking: 'KER123456' } 
    ];

    return {
        tenant,
        balance: totalBalance,
        announcements,
        parcels
    };
}

export async function getTenantInvoices() {
    const profileData = await getTenantProfile();
    if (!profileData || !profileData.profile) return [];

    const invoices: any[] = [];
    if (profileData.profile.contracts) {
        profileData.profile.contracts.forEach((c: any) => {
            if (c.invoices) {
                invoices.push(...c.invoices);
            }
        });
    }

    return invoices.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
}

export async function getMaintenances() {
    const profileData = await getTenantProfile();
    return profileData?.maintenances || [];
}

export async function createMaintenance(formData: FormData) {
    const headers = await getAuthHeaders();
    // Remove Content-Type: application/json to let fetch generate boundary for FormData
    const { 'Content-Type': ct, ...restHeaders } = headers;

    try {
        const res = await fetch(`${API_URL}/maintenances`, {
            method: 'POST',
            headers: restHeaders,
            body: formData as any
        });

        if (res.ok) {
            revalidatePath('/', 'layout');
            return { success: true };
        }

        const text = await res.text();
        return { success: false, message: "บันทึกไม่สำเร็จ: " + text };
    } catch (e) {
        return { success: false, message: 'Connection error' };
    }
}
