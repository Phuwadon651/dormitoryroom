'use server'

import { User } from '@/types/user'
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_URL = 'http://127.0.0.1:8000/api';

async function getAuthHeader(): Promise<Record<string, string>> {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (!session) return {};

    try {
        const user = JSON.parse(session.value);
        const token = user.token;

        return {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
    } catch {
        return {};
    }
}

export async function getUsers(): Promise<User[]> {
    try {
        const res = await fetch(`${API_URL}/users`, {
            headers: await getAuthHeader(),
            cache: 'no-store'
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Fetch users failed: ${res.status} ${res.statusText}`, errorText);
            throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
        }
        return await res.json();
    } catch (error) {
        console.error("getUsers error:", error);
        return [];
    }
}

export async function createUser(userData: Omit<User, 'id'>) {
    const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: await getAuthHeader(),
        body: JSON.stringify(userData)
    });

    if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: errorText };
    }

    revalidatePath('/dashboard/admin/users');
    const data = await res.json();
    return { success: true, data };
}

export async function updateUser(id: string, userData: Partial<User>) {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: await getAuthHeader(),
        body: JSON.stringify(userData)
    });

    if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: errorText };
    }

    revalidatePath('/dashboard/admin/users');
    const data = await res.json();
    return { success: true, data };
}

export async function deleteUser(id: string) {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeader()
    });

    if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: errorText };
    }

    revalidatePath('/dashboard/admin/users');
    return { success: true };
}

export async function toggleUserStatus(id: string, isActive: boolean) {
    const res = await fetch(`${API_URL}/users/${id}/toggle-status`, {
        method: 'PATCH',
        headers: await getAuthHeader(),
        body: JSON.stringify({ is_active: isActive })
    });

    if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: errorText };
    }

    revalidatePath('/dashboard/admin/users');
    return { success: true };
}
