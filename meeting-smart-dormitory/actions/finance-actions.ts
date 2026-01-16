'use server'

import { revalidatePath } from "next/cache"
import { Contract, Invoice, Payment, PaymentStatus } from "@/types/finance"
import { getSession } from "./auth-actions"

const API_URL = 'http://127.0.0.1:8000/api'

async function getAuthHeaders() {
    const session = await getSession();
    return {
        'Content-Type': 'application/json',
        'Authorization': session ? `Bearer ${session.token}` : ''
    };
}

// --- Mapping Functions ---
function mapContract(apiContract: any): Contract {
    return {
        id: apiContract.id,
        tenant_id: apiContract.tenant_id.toString(),
        room_id: apiContract.room_id,
        room_number: apiContract.room ? apiContract.room.room_number : '',
        rent_price: Number(apiContract.rent_price),
        deposit_amount: Number(apiContract.deposit),
        advance_payment: 0, // Not in DB
        start_date: apiContract.start_date,
        end_date: apiContract.end_date || '',
        billing_day: 5, // Default
        late_fee_type: 'Fixed',
        late_fee_amount: 100,
        isActive: Boolean(apiContract.is_active)
    };
}

function mapInvoice(apiInvoice: any): Invoice {
    return {
        id: apiInvoice.id,
        contract_id: apiInvoice.contract_id,
        tenant_name: apiInvoice.contract && apiInvoice.contract.tenant ? apiInvoice.contract.tenant.name : 'Unknown', // Nested relation needed
        room_number: apiInvoice.contract && apiInvoice.contract.room ? apiInvoice.contract.room.room_number : '',
        month: apiInvoice.period_month,
        year: apiInvoice.period_year,

        water_prev: Number(apiInvoice.water_prev),
        water_curr: Number(apiInvoice.water_curr),
        water_unit_price: Number(apiInvoice.water_unit_price),

        electric_prev: Number(apiInvoice.electric_prev),
        electric_curr: Number(apiInvoice.electric_curr),
        electric_unit_price: Number(apiInvoice.electric_unit_price),

        water_total: Number(apiInvoice.water_total),
        electric_total: Number(apiInvoice.electric_total),
        rent_total: Number(apiInvoice.rent_total),

        common_fee: Number(apiInvoice.common_fee),
        parking_fee: Number(apiInvoice.parking_fee),
        internet_fee: Number(apiInvoice.internet_fee),
        cleaning_fee: Number(apiInvoice.cleaning_fee),
        other_fees: Number(apiInvoice.other_fees),

        total_amount: Number(apiInvoice.total_amount),
        due_date: new Date(apiInvoice.created_at).toISOString(), // Use created date or calc
        status: apiInvoice.status as PaymentStatus
    };
}

function mapPayment(apiPayment: any): Payment {
    return {
        id: apiPayment.id,
        invoice_id: apiPayment.invoice_id,
        tenant_name: apiPayment.invoice && apiPayment.invoice.contract && apiPayment.invoice.contract.tenant ? apiPayment.invoice.contract.tenant.name : 'Unknown',
        amount_paid: Number(apiPayment.amount),
        slip_image: apiPayment.slip_image,
        paid_at: apiPayment.payment_date,
        payment_method: 'Bank Transfer', // Default
        status: apiPayment.status as PaymentStatus,
        approved_by: apiPayment.approved_by ? String(apiPayment.approved_by) : undefined
    };
}

// --- Contracts ---
export async function getContracts(): Promise<Contract[]> {
    const headers = await getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/contracts`, { headers, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data.map(mapContract);
    } catch {
        return [];
    }
}

export async function createContract(data: Omit<Contract, 'id' | 'isActive'>) {
    const headers = await getAuthHeaders();

    // Reverse map? Or just send what API expects
    // API expects: tenant_id, room_id, start_date, rent_price, deposit
    const payload = {
        tenant_id: data.tenant_id,
        room_id: data.room_id,
        start_date: data.start_date,
        rent_price: data.rent_price,
        deposit: data.deposit_amount
    };

    const res = await fetch(`${API_URL}/contracts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        revalidatePath('/', 'layout');
        return mapContract(await res.json());
    }
    return null;
}

// --- Invoices ---
export async function getInvoices(): Promise<Invoice[]> {
    const headers = await getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/invoices`, { headers, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data.map(mapInvoice);
    } catch {
        return [];
    }
}

export async function createInvoice(data: Omit<Invoice, 'id' | 'total_amount' | 'status'>) {
    const headers = await getAuthHeaders();
    // Map to API fields
    const payload = {
        contract_id: data.contract_id,
        period_month: data.month,
        period_year: data.year,
        water_prev: data.water_prev,
        water_curr: data.water_curr,
        water_unit_price: data.water_unit_price,
        electric_prev: data.electric_prev,
        electric_curr: data.electric_curr,
        electric_unit_price: data.electric_unit_price,
        common_fee: data.common_fee,
        parking_fee: data.parking_fee,
        internet_fee: data.internet_fee,
        cleaning_fee: data.cleaning_fee,
        other_fees: data.other_fees
    };

    const res = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        revalidatePath('/', 'layout');
        return mapInvoice(await res.json());
    }
    return null;
}

export async function updateInvoiceStatus(id: string, status: PaymentStatus) {
    // No op or implement if needed
}

// --- Payments ---
export async function getPayments(): Promise<Payment[]> {
    const headers = await getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/payments`, { headers, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data.map(mapPayment);
    } catch {
        return [];
    }
}

export async function createPayment(data: Omit<Payment, 'id' | 'status'>) {
    const headers = await getAuthHeaders();

    const payload = {
        invoice_id: data.invoice_id,
        amount: data.amount_paid,
        payment_date: data.paid_at,
        slip_image: data.slip_image
    };

    const res = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        revalidatePath('/', 'layout');
        return mapPayment(await res.json());
    }
    return null;
}

export async function verifyPayment(id: string, status: PaymentStatus, approvedBy: string) {
    const headers = await getAuthHeaders();
    await fetch(`${API_URL}/payments/${id}/verify`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
    });

    revalidatePath('/', 'layout');
}

export async function getRevenueStats() {
    const headers = await getAuthHeaders();

    // We need contracts and invoices to calculate stats
    // Ideally the API would provide an endpoint for this aggregation
    // But since we are mocking/building, we might need to fetch all and aggregate here 
    // OR create a new API endpoint. For best practice, let's assume we fetch lists and aggregate here for now
    // to avoid touching the Laravel API too much unless necessary. 
    // Actually, fetching ALL invoices might be heavy. 
    // Let's check if we can filter by date range or just fetch last X items.
    // For now, let's fetch all (assuming volume is low) and aggregate.

    const [invoices, contracts] = await Promise.all([
        getInvoices(),
        getContracts()
    ]);

    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const today = new Date();
    const result = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthIndex = d.getMonth(); // 0-11
        const year = d.getFullYear(); // 2024

        const monthName = months[monthIndex];

        // Filter invoices for this month/year
        const monthlyRevenue = invoices
            .filter(inv => inv.month === monthIndex + 1 && inv.year === year)
            .reduce((sum, inv) => sum + inv.total_amount, 0);

        // Filter active contracts for this month
        // A contract is active in this month if:
        // start_date <= end of this month AND (end_date >= start of this month OR end_date is null/empty)
        const startOfMonth = new Date(year, monthIndex, 1);
        const endOfMonth = new Date(year, monthIndex + 1, 0);

        const monthlyOccupants = contracts.filter(c => {
            const start = new Date(c.start_date);
            const end = c.end_date ? new Date(c.end_date) : null;

            return start <= endOfMonth && (!end || end >= startOfMonth);
        }).length;

        result.push({
            name: monthName,
            total: monthlyRevenue,
            occupants: monthlyOccupants
        });
    }

    return result;
}
