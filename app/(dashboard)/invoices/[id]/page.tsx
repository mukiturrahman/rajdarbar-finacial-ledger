'use client'
import React, { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { InvoiceTemplate } from '@/components/invoices/InvoiceTemplate'
import { updateInvoiceStatusAction, deleteInvoiceAction } from '@/app/actions/invoices'
import { Printer, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Invoice, InvoiceItem } from '@/types'

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetch() {
      const supabase = getSupabaseClient()
      const { data } = await supabase.from('invoices').select('*').eq('id', id).single()
      if (data) {
        const inv = data as Record<string, unknown>
        setInvoice({ ...inv, items: typeof inv.items === 'string' ? JSON.parse(inv.items as string) : inv.items } as Invoice)
      }
      setLoading(false)
    }
    fetch()
  }, [id])

  if (loading) return <div className="p-8 text-center text-text-muted">Loading invoice...</div>
  if (!invoice) return <div className="p-8 text-center text-semantic-red">Invoice not found.</div>

  return (
    <div className="flex flex-col h-full bg-bg-base">
      {error && <div className="m-4 p-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: '#f87171' }}>{error}</div>}
      <div className="flex flex-wrap items-center justify-between p-4 gap-4 border-b border-border print:hidden bg-bg-base">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /><span>Back</span></Link>
          <select value={invoice.status} onChange={async (e) => {
            const res = await updateInvoiceStatusAction(invoice.id, e.target.value)
            if (res.success) setInvoice({ ...invoice, status: e.target.value as Invoice['status'] })
            else setError(res.error || 'Failed to update')
          }} className="filter-select !min-w-[120px] !py-1.5 !text-sm">
            {['DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={async () => { if (confirm('Delete?')) { const r = await deleteInvoiceAction(invoice.id); r.success ? router.push('/invoices') : setError(r.error || 'Failed') } }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-semantic-red bg-semantic-red-dim border border-semantic-red/20 hover:bg-semantic-red/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
          <button onClick={() => window.print()} className="btn-primary"><Printer className="w-4 h-4" /><span>Download PDF</span></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start print:p-0">
        <div className="shadow-2xl ring-1 ring-white/10 print:shadow-none print:ring-0 transform scale-[0.6] sm:scale-[0.8] md:scale-100 origin-top">
          <InvoiceTemplate invoice={invoice} />
        </div>
      </div>
    </div>
  )
}
