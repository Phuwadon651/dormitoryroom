'use server'

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

async function getHeaders() {
    const session = (await cookies()).get('session')
    let token = ''

    if (session) {
        try {
            const sessionData = JSON.parse(session.value)
            token = sessionData.token
        } catch (e) {
            console.error('Failed to parse session cookie', e)
        }
    }

    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

export async function getSettings() {
    try {
        const response = await fetch(`${API_URL}/settings`, {
            headers: await getHeaders(),
            cache: 'no-store'
        })

        if (response.status === 403) {
            return { success: false, error: 'Unauthorized' }
        }

        if (!response.ok) throw new Error('Failed to fetch settings')
        const data = await response.json()
        return { success: true, data }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to fetch settings' }
    }
}

export async function updateSettings(data: Record<string, any>) {
    try {
        const response = await fetch(`${API_URL}/settings`, {
            method: 'POST', // Using POST as implemented in backend
            headers: await getHeaders(),
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.message || 'Failed to update settings')
        }

        revalidatePath('/dashboard/settings')
        return { success: true, data: await response.json() }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
