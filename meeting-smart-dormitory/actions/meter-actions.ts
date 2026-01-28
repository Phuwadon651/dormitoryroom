'use server'

import { MeterReading, MeterReadingPayload } from "@/types/meter"
import { revalidatePath } from "next/cache"
import { getSession } from "./auth-actions"

const API_URL = 'http://127.0.0.1:8000/api'

async function getAuthHeaders() {
    const session = await getSession();
    return {
        'Content-Type': 'application/json',
        'Authorization': session ? `Bearer ${session.token}` : ''
    };
}

export async function getMeterReadings(month: string | number, year: string | number, floor?: string): Promise<any[]> {
    const headers = await getAuthHeaders();
    try {
        const query = new URLSearchParams({ month: month.toString(), year: year.toString() });
        if (floor) query.append('floor', floor);

        const res = await fetch(`${API_URL}/meter-readings?${query.toString()}`, {
            headers,
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error('API Error:', res.status, res.statusText);
            const text = await res.text();
            console.error('API Response:', text);
            return [];
        }
        return await res.json();
    } catch (e) {
        console.error('Fetch Meter Readings Error:', e);
        return [];
    }
}

export async function getMeterSummary(month: string | number, year: string | number) {
    const headers = await getAuthHeaders();
    try {
        const query = new URLSearchParams({ month: month.toString(), year: year.toString() });
        const res = await fetch(`${API_URL}/meter-readings/summary?${query.toString()}`, {
            headers,
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('Failed to fetch summary');
        return await res.json();
    } catch (e) {
        return {
            total_rooms: 0,
            recorded_rooms: 0,
            pending_rooms: 0,
            total_electricity_meter: 0,
            total_water_meter: 0
        };
    }
}

export async function saveMeterReading(data: MeterReadingPayload) {
    const headers = await getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/meter-readings`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });

        if (res.ok) {
            revalidatePath('/dashboard/dorm-admin/utilities'); // Update path as needed
            const savedData = await res.json();
            return { success: true, data: savedData };
        } else {
            const errorData = await res.json().catch(() => ({ message: 'Failed to save' }));
            return { success: false, error: errorData.message };
        }
    } catch (e) {
        return { success: false, error: 'Network error' };
    }
}


export async function deleteMeterReading(id: number) {
    const headers = await getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/meter-readings/${id}`, {
            method: 'DELETE',
            headers
        });

        if (res.ok) {
            revalidatePath('/dashboard/dorm-admin/utilities');
            return { success: true };
        } else {
            return { success: false, error: 'Failed to delete' };
        }
    } catch (e) {
        return { success: false, error: 'Network error' };
    }
}

export async function getMeterHistory(roomId: number) {
    const headers = await getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/meter-readings/${roomId}/history`, {
            headers,
            cache: 'no-store'
        });

        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        return [];
    }
}

export async function saveBulkMeterReadings(readings: MeterReadingPayload[]) {
    // Implement bulk save if backend/API supports or loop
    // For efficiency, looping here if API doesn't support bulk
    // Ideally create a bulk endpoint in Laravel
    const results = [];
    for (const data of readings) {
        const result = await saveMeterReading(data);
        results.push(result);
    }
    revalidatePath('/dashboard/dorm-admin/utilities');
    return { success: true, results };
}
