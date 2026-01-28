
export interface MeterReading {
    id?: string; // or number, depends on DB
    room_id: number;
    room_number: string;
    has_tenant?: boolean;
    tenant_name?: string;
    reading_date: string;
    month_cycle: string; // "MM/YYYY"

    prev_water: number;
    current_water: number;
    water_usage: number; // Calculated

    prev_electric: number;
    current_electric: number;
    electric_usage: number; // Calculated

    recorder_id: string;
    image_proof?: string;

    // Status for UI
    is_saved?: boolean;
    error_message?: string;
}

export interface MeterReadingPayload {
    room_id: number;
    reading_date: string;
    water_meter: number;
    electricity_meter: number;
    image_proof?: string;
}
