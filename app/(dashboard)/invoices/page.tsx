import { getSupabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { formatTaka, formatDate } from '@/lib/utils/formatters'
import { Plus, FileText } from 'lucide-react'
import type { Invoice, EventClient } from '@/types'

export default async function InvoicesPage() {
  const supabase = await getSupabaseServer()
  const [{ data: invoicesRaw }, { data: eventsRaw }] = await Promise.all([
    supabase.from('invoices').select('*').order('created_at', { ascending: false }),
    supabase.from('events').select('id, name'),
  ])
  const invoices = (invoicesRaw ?? []) as Invoice[]
  const events = (eventsRaw ?? []) as EventClient[]

  return (
    <div className="flex flex-col h-full">
      <div className="page-header">
        <div><h1>Invoices</h1><p className="text-[0.8125rem] text-text-muted mt-0.5">{invoices.length} invoices</p></div>
        <Link href="/invoices/new" className="btn-primary"><Plus size={16} />New Invoice</Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-0">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Invoice #</th><th>Event</th><th>Amount</th><th>Issue Date</th><th>Due Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-text-muted">No invoices yet</td></tr>
              ) : invoices.map(inv => {
                const eventName = events.find(e => e.id === inv.event_id)?.name || '—'
                return (
                  <tr key={inv.id}>
                    <td className="font-mono font-bold text-brand-gold">{inv.invoice_number}</td>
                    <td className="text-text-secondary">{eventName}</td>
                    <td className="font-mono font-bold text-text-primary">{formatTaka(inv.amount)}</td>
                    <td className="text-text-muted">{formatDate(inv.issue_date)}</td>
                    <td className="text-text-muted">{inv.due_date ? formatDate(inv.due_date) : '—'}</td>
                    <td><Badge variant={inv.status} /></td>
                    <td><Link href={`/invoices/${inv.id}`} className="btn-ghost !p-1.5 !min-w-0 !min-h-0 text-text-muted hover:text-brand-gold"><FileText size={14} /></Link></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
