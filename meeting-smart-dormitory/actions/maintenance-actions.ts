'use server'

import { MaintenanceRequest } from "@/types/maintenance"
import { getSession } from "./auth-actions"

const API_URL = 'http://127.0.0.1:8000/api'

async function getAuthHeaders() {
    const session = await getSession();
    return {
        'Content-Type': 'application/json',
        'Authorization': session ? `Bearer ${session.token}` : ''
    };
}

function mapMaintenanceRequest(data: any): MaintenanceRequest {
    return {
        maintenance_id: data.id,
        user_id: data.user_id,
        room_id: data.room_id,
        damage_details: data.damage_details,
        report_images: data.report_images,
        repair_type: data.repair_type,
        technician_id: data.technician_id,
        report_date: data.report_date,
        fix_date: data.fix_date,
        status: data.status,
        payment_status: data.payment_status,
        completion_proof_images: data.completion_proof_images,
        expense_amount: data.expense_amount ? Number(data.expense_amount) : undefined,
        expense_details: data.expense_details,
        expense_receipt_image: data.expense_receipt_image,
        created_at: data.created_at,
        updated_at: data.updated_at,

        // Relationships if loaded
        user: data.user,
        room: data.room,
        technician: data.technician,
    }
}

export async function getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    const headers = await getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/maintenances`, { headers, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data.map(mapMaintenanceRequest);
    } catch (error) {
        console.error("Failed to fetch maintenance requests:", error);
        return [];
    }
}
