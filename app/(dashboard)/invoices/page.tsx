import { getSupabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { formatTaka, formatDate } from '@/lib/utils/formatters'
import { Plus, Receipt, FileImage } from 'lucide-react'
import type { Transaction } from '@/types'

export default async function ReceiptsPage() {
  const supabase = await getSupabaseServer()
  const { data: txnsRaw } = await supabase
    .from('transactions')
    .select('*')
    .eq('type', 'Expense')
    .eq('source', 'Receipt Page')
    .is('deleted_at', null)
    .order('date', { ascending: false })
    
  const receipts = (txnsRaw ?? []) as Transaction[]

  return (
    <div className="flex flex-col h-full">
      <div className="page-header">
        <div><h1>Receipts</h1><p className="text-[0.8125rem] text-text-muted mt-0.5">{receipts.length} expenses logged</p></div>
        <Link href="/invoices/new" className="btn-primary"><Plus size={16} />Log Expense</Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-0">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead>
            <tbody>
              {receipts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-text-muted">No receipts yet</td></tr>
              ) : receipts.map(txn => (
                  <tr key={txn.id}>
                    <td className="text-text-muted">{formatDate(txn.date)}</td>
                    <td className="font-medium text-text-secondary">{txn.category || 'Uncategorized'}</td>
                    <td className="text-text-primary max-w-xs truncate">{txn.description}</td>
                    <td className="font-mono font-bold text-semantic-red">-{formatTaka(txn.amount)}</td>
                    <td><Badge variant={txn.status} /></td>
                    <td>
                      {txn.receipt_url ? (
                        <a href={txn.receipt_url} target="_blank" rel="noreferrer" className="btn-ghost !p-1.5 !min-w-0 !min-h-0 text-brand-gold hover:text-brand-gold-bright"><FileImage size={16} /></a>
                      ) : (
                        <span className="text-text-muted text-xs">—</span>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
