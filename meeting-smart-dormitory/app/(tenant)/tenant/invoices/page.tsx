
import { getTenantInvoices } from "@/actions/tenant-actions"
import { getSettings } from "@/actions/setting-actions"
import { InvoiceList } from "@/components/tenant/invoice-list"

export const dynamic = 'force-dynamic'

export default async function TenantInvoicesPage() {
    const [invoices, settings] = await Promise.all([
        getTenantInvoices(),
        getSettings()
    ])

    return (
        <InvoiceList invoices={invoices} settings={settings || {}} />
    )
}
