export type PaymentStatus = 'Pending' | 'Paid' | 'Overdue' | 'Reject';
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'PromptPay';

export interface Contract {
    id: string;
    tenant_id: string;
    room_id: number;
    room_number: string;
    rent_price: number;
    deposit_amount: number;
    advance_payment: number; // e.g. 1 month
    start_date: string; // ISO Date
    end_date: string; // ISO Date
    billing_day: number; // e.g. 1 or 5
    late_fee_type: 'Fixed' | 'Percentage';
    late_fee_amount: number;
    isActive: boolean;
}

export interface Invoice {
    id: string;
    contract_id: string;
    tenant_name: string;
    room_number: string;
    month: number; // 1-12
    year: number;

    // Meter Readings
    water_prev: number;
    water_curr: number;
    water_unit_price: number;

    electric_prev: number;
    electric_curr: number;
    electric_unit_price: number;

    // Calculated Costs
    water_total: number;
    electric_total: number;
    rent_total: number;

    // Additional Fees
    common_fee: number;
    parking_fee: number;
    internet_fee: number;
    cleaning_fee: number;
    other_fees: number;

    total_amount: number;
    due_date: string;
    status: PaymentStatus;
}

export interface Payment {
    id: string;
    invoice_id: string;
    tenant_name: string;
    amount_paid: number;
    slip_image?: string; // URL or base64 placeholder
    paid_at: string; // ISO Date
    payment_method: PaymentMethod;
    status: PaymentStatus;
    approved_by?: string; // Admin Name
}
