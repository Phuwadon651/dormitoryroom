'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API_URL = 'http://127.0.0.1:8000/api'

export async function login(formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password }),
        })

        const data = await res.json()
        console.log("LOGIN DEBUG: Backend Response:", JSON.stringify(data, null, 2));

        if (!res.ok || !data.success) {
            return { success: false, message: data.message || 'Login failed' }
        }

        const sessionData = JSON.stringify({
            userId: data.user.id,
            role: data.role,
            name: data.user.name,
            token: data.token,
            permissions: data.user.permissions || {}
        })

        const cookieStore = await cookies()
        cookieStore.set('session', sessionData, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        })

        return { success: true, role: data.role }

    } catch (error) {
        console.error('Login error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, message: `Connection Error: ${errorMessage}` }
    }
}

export async function logout() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')

    if (session) {
        const data = JSON.parse(session.value)
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                },
            })
        } catch (e) {
            // Ignore logout errors
        }
    }

    cookieStore.delete('session')
    redirect('/login')
}

export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')
    if (!session) return null
    try {
        return JSON.parse(session.value) as { userId: string, role: string, name: string, token: string }
    } catch {
        return null
    }
}
