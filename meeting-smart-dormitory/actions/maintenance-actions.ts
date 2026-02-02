"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "./auth-actions"
import { getTenantProfile } from "./tenant-actions"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Helper to get token
async function getToken() {
    const session = await getSession();
    return session?.token;
}

export async function fetchMaintenances(status?: string) {
    const token = await getToken()
    if (!token) return []

    let url = `${API_URL}/maintenances`
    if (status && status !== 'all') {
        url += `?status=${status}`
    }

    try {
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            cache: 'no-store'
        })

        if (!res.ok) throw new Error('Failed to fetch maintenances')

        const data = await res.json()
        return Array.isArray(data) ? data : (data.data || [])
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function createMaintenanceRequest(formData: FormData) {
    const token = await getToken()
    // Get tenant profile to determine room_id automatically
    const profileData = await getTenantProfile();
    const roomId = profileData?.profile?.room?.id;

    if (!token) return { success: false, message: "Unauthorized" }

    // Override room_id with the one from the user's profile to prevent errors/tampering
    if (roomId) {
        formData.set('room_id', String(roomId));
    } else {
        return { success: false, message: "ไม่พบข้อมูลห้องพักของผู้เช่า" };
    }

    try {
        const res = await fetch(`${API_URL}/maintenances`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: formData
        })

        let data;
        try {
            data = await res.json();
        } catch (jsonError) {
            const text = await res.text();
            console.error("Non-JSON response:", text);
            throw new Error(`Server returned ${res.status}: ${text.slice(0, 100)}...`);
        }

        if (!res.ok) {
            return { success: false, message: data.message || `Error ${res.status}: Failed to create request` }
        }

        revalidatePath('/maintenance')
        return { success: true, message: "Created successfully" }
    } catch (error: any) {
        console.error("Create Maintenance Error:", error)
        return { success: false, message: error.message || "Connection error" }
    }
}

export async function acceptMaintenanceJob(id: number) {
    const token = await getToken()
    if (!token) return { success: false, message: "Unauthorized" }

    try {
        // Backend should handle changing status to 'in_progress' and assigning technician_id
        const res = await fetch(`${API_URL}/maintenances/${id}/accept`, {
            method: 'POST', // Corrected to match api.php
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })

        if (!res.ok) {
            const error = await res.json()
            return { success: false, message: error.message || "Failed to accept job" }
        }

        revalidatePath('/maintenance')
        return { success: true, message: "Job accepted" }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Connection error" }
    }
}

export async function completeMaintenanceJob(id: number, formData: FormData) {
    const token = await getToken()
    if (!token) return { success: false, message: "Unauthorized" }

    try {
        const res = await fetch(`${API_URL}/maintenances/${id}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: formData
        })

        if (!res.ok) {
            const error = await res.json()
            return { success: false, message: error.message || "Failed to complete job" }
        }

        revalidatePath('/maintenance')
        return { success: true, message: "Job completed" }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Connection error" }
    }
}

export async function assignMaintenanceJob(id: number | string, technicianId: string) {
    const token = await getToken()
    if (!token) return { success: false, message: "Unauthorized" }

    try {
        const res = await fetch(`${API_URL}/maintenances/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                technician_id: technicianId,
                status: 'in_progress'
            })
        })

        if (!res.ok) {
            const error = await res.json()
            return { success: false, message: error.message || "Failed to assign job" }
        }

        revalidatePath('/maintenance')
        revalidatePath('/dashboard/maintenance')
        return { success: true, message: "Job assigned successfully" }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Connection error" }
    }
}


