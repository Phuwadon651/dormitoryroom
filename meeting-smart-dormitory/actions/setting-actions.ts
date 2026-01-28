'use server'

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

async function getAuthHeader(): Promise<Record<string, string>> {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

    if (sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie.value)
            if (session.token) {
                headers['Authorization'] = `Bearer ${session.token}`
            }
        } catch (e) {
            console.error('Failed to parse session cookie', e)
        }
    }

    return headers
}

export async function getSettings() {
    const headers = await getAuthHeader()
    try {
        const res = await fetch(`${API_URL}/settings`, { headers, cache: 'no-store' })

        if (!res.ok) {
            console.error(`Fetch settings failed: ${res.status} ${res.statusText}`)
            return null
        }

        return res.json()
    } catch (error) {
        console.error("Fetch settings error:", error)
        return null
    }
}

export async function updateSettings(settings: { key: string, value: any }[]) {
    const headers = await getAuthHeader()
    const res = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ settings })
    })

    if (!res.ok) {
        const text = await res.text()
        let errorMessage = 'Failed to update settings'
        try {
            const json = JSON.parse(text)
            errorMessage = json.message || errorMessage
        } catch (e) {
            errorMessage = `${errorMessage}: ${text}`
        }
        console.error('Update Settings Error:', errorMessage)
        return { success: false, error: errorMessage }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}

export async function uploadQrImage(formData: FormData) {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    const headers: Record<string, string> = {
        'Accept': 'application/json'
    }

    if (sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie.value)
            headers['Authorization'] = `Bearer ${session.token}`
        } catch (e) { }
    }

    const res = await fetch(`${API_URL}/settings/upload-qr`, {
        method: 'POST',
        headers, // Do NOT set Content-Type for FormData, fetch handles boundaries
        body: formData
    })

    if (!res.ok) {
        const text = await res.text()
        return { success: false, error: text }
    }

    return res.json()
}
