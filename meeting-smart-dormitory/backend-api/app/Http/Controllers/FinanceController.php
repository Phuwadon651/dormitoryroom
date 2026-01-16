<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Activity;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    // --- Contracts ---
    public function getContracts()
    {
        return Contract::with(['tenant', 'room'])->get();
    }

    public function createContract(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'room_id' => 'required|exists:rooms,id',
            'start_date' => 'required|date',
            'rent_price' => 'required|numeric',
            'deposit' => 'required|numeric',
        ]);

        $contract = Contract::create($validated);
        
        Activity::create([
            'title' => 'สร้างสัญญาเช่าใหม่',
            'description' => "สัญญาเช่า Room ID {$contract->room_id}",
            'type' => 'info'
        ]);

        return response()->json($contract, 201);
    }

    // --- Invoices ---
    public function getInvoices()
    {
        return Invoice::with('contract.room')->get(); // Include room via contract
    }

    public function createInvoice(Request $request)
    {
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'period_month' => 'required|integer',
            'period_year' => 'required|integer',
            'water_prev' => 'required|numeric',
            'water_curr' => 'required|numeric',
            'water_unit_price' => 'required|numeric',
            'electric_prev' => 'required|numeric',
            'electric_curr' => 'required|numeric',
            'electric_unit_price' => 'required|numeric',
            'common_fee' => 'numeric',
            'parking_fee' => 'numeric',
            'internet_fee' => 'numeric',
            'cleaning_fee' => 'numeric',
            'other_fees' => 'numeric',
        ]);

        // Logic
        $water_total = ($validated['water_curr'] - $validated['water_prev']) * $validated['water_unit_price'];
        $electric_total = ($validated['electric_curr'] - $validated['electric_prev']) * $validated['electric_unit_price'];
        
        $contract = Contract::find($validated['contract_id']);
        $rent_total = $contract->rent_price;

        $total_amount = $rent_total + $water_total + $electric_total + 
            ($validated['common_fee'] ?? 0) + 
            ($validated['parking_fee'] ?? 0) + 
            ($validated['internet_fee'] ?? 0) + 
            ($validated['cleaning_fee'] ?? 0) + 
            ($validated['other_fees'] ?? 0);

        $invoice = Invoice::create(array_merge($validated, [
            'water_total' => $water_total,
            'electric_total' => $electric_total,
            'rent_total' => $rent_total,
            'total_amount' => $total_amount,
            'status' => 'Pending',
        ]));

        Activity::create([
            'title' => 'ออกใบแจ้งหนี้',
            'description' => "รอบ {$validated['period_month']}/{$validated['period_year']}",
            'type' => 'info'
        ]);

        return response()->json($invoice, 201);
    }

    // --- Payments ---
    public function getPayments()
    {
        return Payment::with('invoice')->get();
    }

    public function createPayment(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric',
            'payment_date' => 'required|date',
            'slip_image' => 'nullable|string', 
        ]);

        $payment = Payment::create(array_merge($validated, ['status' => 'Pending']));

        Activity::create([
            'title' => 'ชำระเงินใหม่',
            'description' => "จำนวน {$validated['amount']} บาท",
            'type' => 'info'
        ]);

        return response()->json($payment, 201);
    }

    public function verifyPayment(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        $status = $request->input('status'); // Paid, Rejected
        
        $payment->update([
            'status' => $status,
            'approved_by' => $request->user()->id,
        ]);

        if ($status === 'Paid') {
            $payment->invoice->update(['status' => 'Paid']);
        }

        Activity::create([
            'title' => 'ตรวจสอบการชำระเงิน',
            'description' => "ID {$id} สถานะ {$status}",
            'type' => $status === 'Paid' ? 'success' : 'warning'
        ]);

        return response()->json($payment);
    }

    // --- Activities ---
    public function getActivities() {
        return Activity::latest()->take(20)->get();
    }
}
