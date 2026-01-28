'use server'

import { Room } from "@/types/room";
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

function mapRoom(apiRoom: any): Room {
    return {
        room_id: apiRoom.id, // Map ID
        room_number: apiRoom.room_number,
        floor: apiRoom.floor,
        room_type: apiRoom.room_type,
        price: Number(apiRoom.price),
        status: apiRoom.status,
        furniture_details: apiRoom.furniture_details
    };
}

export async function getRooms(): Promise<Room[]> {
    const headers = await getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/rooms`, {
            headers,
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.map(mapRoom);
    } catch (e) {
        return [];
    }
}

export async function createRoom(data: Omit<Room, 'room_id'>): Promise<{ success: boolean, data?: Room, error?: string }> {
    const headers = await getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/rooms`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });

        if (res.ok) {
            revalidatePath('/', 'layout');
            const newRoom = await res.json();
            return { success: true, data: newRoom };
        } else {
            const errorData = await res.json().catch(() => ({ message: 'Failed to create room' }));
            return { success: false, error: errorData.message || 'Failed to create room' };
        }
    } catch (e) {
        return { success: false, error: 'Network error occurred' };
    }
}

export async function updateRoom(id: number, data: Partial<Room>): Promise<{ success: boolean, data?: Room, error?: string }> {
    const headers = await getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/rooms/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });

        if (res.ok) {
            revalidatePath('/', 'layout');
            const updatedRoom = await res.json();
            return { success: true, data: updatedRoom };
        } else {
            const errorData = await res.json().catch(() => ({ message: 'Failed to update room' }));
            return { success: false, error: errorData.message || 'Failed to update room' };
        }
    } catch (e) {
        return { success: false, error: 'Network error occurred' };
    }
}

export async function deleteRoom(id: number): Promise<{ success: boolean, error?: string }> {
    const headers = await getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/rooms/${id}`, {
            method: 'DELETE',
            headers
        });

        if (res.ok) {
            revalidatePath('/', 'layout');
            return { success: true };
        } else {
            const errorData = await res.json().catch(() => ({ message: 'Failed to delete room' }));
            return { success: false, error: errorData.message || 'Failed to delete room' };
        }
    } catch (e) {
        return { success: false, error: 'Network error occurred' };
    }
}

export async function createBulkRooms(
    floor: number,
    startNumber: string,
    quantity: number,
    baseData: Omit<Room, 'room_id' | 'room_number' | 'floor'>
): Promise<{ success: boolean, count: number, error?: string }> {
    let successCount = 0;
    const headers = await getAuthHeaders();

    // Regex to separate prefix and number
    // Captures: 1: prefix, 2: number
    const match = startNumber.match(/^([^\d]*)(\d+)$/);

    let prefix = "";
    let startNumVal = 0;
    let padding = 0;

    if (match) {
        prefix = match[1] || "";
        const numStr = match[2];
        startNumVal = parseInt(numStr, 10);
        padding = numStr.length; // Preserve leading zeros length if needed
    } else {
        // Fallback for purely non-numeric or other weird cases (though unlikely for room numbers)
        // If no number found, we might just append index? Let's assume user inputs something valid-ish or we append.
        prefix = startNumber;
        startNumVal = 1;
    }

    for (let i = 0; i < quantity; i++) {
        const currentNumVal = startNumVal + i;
        // Pad with zeros if the original input had leading zeros or to maintain length
        const currentNumStr = currentNumVal.toString().padStart(padding, '0');
        const roomNum = `${prefix}${currentNumStr}`;

        const payload = {
            ...baseData,
            room_number: roomNum,
            floor: floor,
            status: 'ว่าง'
        };

        const res = await fetch(`${API_URL}/rooms`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            successCount++;
        } else {
            // If forbidden, return immediately
            if (res.status === 403) {
                return { success: false, count: successCount, error: 'Unauthorized: You do not have permission to create rooms.' };
            }
        }
    }

    revalidatePath('/', 'layout');
    return { success: true, count: successCount };
}
