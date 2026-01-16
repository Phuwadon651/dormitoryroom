'use server'

import { cookies } from 'next/headers'
import { mockDb } from './mock-db'
import { User } from '@/types/user'

export async function getCurrentUser(): Promise<User> {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie.value)
            // Hydrate user from session data (which comes from Real Backend)
            return {
                id: session.userId || 'unknown',
                name: session.name || 'Unknown User',
                email: session.email || '', // Session might not have email, keep empty or add to login
                role: session.role || 'Visitor', // This is the CRITICAL part
                username: session.username || '',
                isActive: true, // Default active if logged in
                permissions: session.permissions || {}
            } as User;
        } catch (e) {
            console.error("Failed to parse session", e)
        }
    }

    // Default Fallback
    return {
        id: 'guest',
        name: 'Guest',
        role: 'Visitor',
        email: '',
        username: 'guest',
        isActive: true
    } as User;
}

export async function switchRole(role: string) {
    const cookieStore = await cookies()
    cookieStore.set('mock_role', role)
}
