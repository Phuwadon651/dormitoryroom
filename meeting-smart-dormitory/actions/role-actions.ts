'use server'

import { Role } from "@/types/role"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

async function getHeaders() {
    const token = (await cookies()).get('token')?.value
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

export async function getRoles() {
    try {
        const response = await fetch(`${API_URL}/roles`, {
            headers: await getHeaders(),
            cache: 'no-store'
        })

        if (!response.ok) throw new Error('Failed to fetch roles')
        const data = await response.json()
        return { success: true, data }
    } catch (error) {
        return { success: false, error: 'Failed to fetch roles' }
    }
}

export async function createRole(data: Partial<Role>) {
    try {
        const response = await fetch(`${API_URL}/roles`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.message || 'Failed to create role')
        }

        revalidatePath('/dashboard/admin/users')
        return { success: true, data: await response.json() }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function updateRole(id: number, data: Partial<Role>) {
    try {
        const response = await fetch(`${API_URL}/roles/${id}`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.message || 'Failed to update role')
        }

        revalidatePath('/dashboard/admin/users')
        return { success: true, data: await response.json() }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function deleteRole(id: number) {
    try {
        const response = await fetch(`${API_URL}/roles/${id}`, {
            method: 'DELETE',
            headers: await getHeaders()
        })

        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.message || 'Failed to delete role')
        }

        revalidatePath('/dashboard/admin/users')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function assignUserToRole(roleId: number, userId: number) {
    try {
        const response = await fetch(`${API_URL}/roles/${roleId}/users`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify({ user_id: userId })
        })

        if (!response.ok) throw new Error('Failed to assign user')

        revalidatePath('/dashboard/admin/users')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function removeUserFromRole(roleId: number, userId: number) {
    try {
        const response = await fetch(`${API_URL}/roles/${roleId}/users`, {
            method: 'DELETE',
            headers: await getHeaders(),
            body: JSON.stringify({ user_id: userId })
        })

        if (!response.ok) throw new Error('Failed to remove user from role')

        revalidatePath('/dashboard/admin/users')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
