'use server'

import { revalidatePath } from "next/cache";

const API_URL = 'http://127.0.0.1:8000/api';

export interface BookingDetails {
    roomId: number;
    roomNumber: string;
    customerName: string;
    customerPhone: string;
    lineId: string;
}

export async function submitBookingRequest(data: BookingDetails) {
    // Current API des not support booking directly, but we can log it or create an activity?
    // Or just simulate success for now as per previous mock logic.
    // Ideally we POST to /api/bookings if it existed.

    // For now, simple return success to allow UI to flow.
    await new Promise((resolve) => setTimeout(resolve, 500));

    // We could create an activity via API if we had the endpoint publicly accessible 
    // but auth is required for most endpoints.

    return { success: true };
}
