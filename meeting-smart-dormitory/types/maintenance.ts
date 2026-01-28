import { User } from "./user";
import { Room } from "./room";

export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed';

export interface MaintenanceRequest {
    maintenance_id: number;
    user_id: number;
    room_id: number;
    damage_details: string;
    report_images?: string[] | null;
    repair_type: string;
    technician_id?: number | null;
    report_date: string;
    fix_date?: string | null;
    status: MaintenanceStatus;
    payment_status?: 'pending' | 'paid';
    completion_proof_images?: string[] | null;
    expense_amount?: number | null;
    expense_details?: string | null;
    expense_receipt_image?: string | null;
    created_at?: string;
    updated_at?: string;

    // Relations
    user?: User;
    room?: Room;
    technician?: User;
}

export type MaintenanceMockData = MaintenanceRequest[]; // Placeholder
