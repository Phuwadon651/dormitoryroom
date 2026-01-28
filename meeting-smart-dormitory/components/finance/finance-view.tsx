"use client"

import { useSearchParams } from "next/navigation"
import { ContractList } from "@/components/finance/contract-list"
import { InvoiceList } from "@/components/finance/invoice-list"
import { PaymentList } from "@/components/finance/payment-list"

interface FinanceViewProps {
    contracts: any[]
    invoices: any[]
    payments: any[]
    currentUser?: any
}

export function FinanceView({ contracts, invoices, payments, currentUser }: FinanceViewProps) {
    const searchParams = useSearchParams()
    const currentView = searchParams.get('view') || 'invoices'

    return (
        <div className="space-y-6">
            {/* Content Area */}
            <div className="min-h-[500px]">
                {currentView === "contracts" && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                        <ContractList initialContracts={contracts} />
                    </div>
                )}

                {currentView === "invoices" && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                        <InvoiceList initialInvoices={invoices} contracts={contracts} currentUser={currentUser} />
                    </div>
                )}

                {currentView === "payments" && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                        <PaymentList initialPayments={payments} />
                    </div>
                )}
            </div>
        </div>
    )
}
