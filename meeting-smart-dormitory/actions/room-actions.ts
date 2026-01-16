'use server'

import { Room } from "@/types/room";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth-actions";

const API_URL = 'http://127.0.0.1:8000/api';

async function getAuthHeaders() {
    const session = await getSession();
    return {
        'Content-Type': 'application/json',
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

export async function createRoom(data: Omit<Room, 'room_id'>): Promise<Room | null> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    });

    if (res.ok) {
        revalidatePath('/', 'layout');
        return await res.json();
    }
    return null;
}

export async function updateRoom(id: number, data: Partial<Room>): Promise<Room | null> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/rooms/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
    });

    if (res.ok) {
        revalidatePath('/', 'layout');
        return await res.json();
    }
    return null;
}

export async function deleteRoom(id: number): Promise<boolean> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/rooms/${id}`, {
        method: 'DELETE',
        headers
    });

    revalidatePath('/', 'layout');
    return res.ok;
}

export async function createBulkRooms(
    floor: number,
    startNumber: number,
    quantity: number,
    baseData: Omit<Room, 'room_id' | 'room_number' | 'floor'>
): Promise<Room[]> {
    const createdRooms: Room[] = [];
    const headers = await getAuthHeaders();

    for (let i = 0; i < quantity; i++) {
        const roomNum = (startNumber + i).toString();
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
            createdRooms.push(await res.json());
        }
    }

    revalidatePath('/', 'layout');
    return createdRooms;
}
