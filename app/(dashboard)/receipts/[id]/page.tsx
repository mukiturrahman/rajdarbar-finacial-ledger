'use client'
import React, { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ReceiptTemplate } from '@/components/receipts/ReceiptTemplate'
import { updateReceiptStatusAction, deleteReceiptAction } from '@/app/actions/receipt-actions'
import { Printer, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Receipt, ReceiptItem } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export default function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    async function loadReceipt() {
      const supabase = getSupabaseClient()
      const { data } = await supabase.from('receipts').select('*').eq('id', id).single()
      if (data) {
        const inv = data as Record<string, unknown>
        setReceipt({ ...inv, items: typeof inv.items === 'string' ? JSON.parse(inv.items as string) : inv.items } as Receipt)
      }
      setLoading(false)
    }
    loadReceipt()
  }, [id])

  if (loading) return <div className="p-8 text-center text-text-muted">Loading receipt...</div>
  if (!receipt) return <div className="p-8 text-center text-semantic-red">Receipt not found.</div>

  return (
    <div className="flex flex-col h-full bg-bg-base">
      {error && <div className="m-4 p-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: '#f87171' }}>{error}</div>}
      <div className="flex flex-wrap items-center justify-between p-4 gap-4 border-b border-border print:hidden bg-bg-base">
        <div className="flex items-center gap-4">
          <Link href="/receipts" className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /><span>Back</span></Link>
          <select value={receipt.status} onChange={async (e) => {
            const res = await updateReceiptStatusAction(receipt.id, e.target.value)
            if (res.success) setReceipt({ ...receipt, status: e.target.value as Receipt['status'] })
            else setError(res.error || 'Failed to update')
          }} className="filter-select !min-w-[120px] !py-1.5 !text-sm">
            {['DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDeleteConfirmOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-semantic-red bg-semantic-red-dim border border-semantic-red/20 hover:bg-semantic-red/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
          <button onClick={() => window.print()} className="btn-primary"><Printer className="w-4 h-4" /><span>Download PDF</span></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start print:p-0">
        <div className="shadow-2xl ring-1 ring-white/10 print:shadow-none print:ring-0 transform scale-[0.6] sm:scale-[0.8] md:scale-100 origin-top">
          <ReceiptTemplate receipt={receipt} />
        </div>
      </div>
      
      <ConfirmModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={async () => { 
          const r = await deleteReceiptAction(receipt.id); 
          r.success ? router.push('/receipts') : setError(r.error || 'Failed') 
        }}
        title="Delete Receipt"
        description="Are you sure you want to delete this receipt? This action cannot be undone."
        destructive={true}
      />
    </div>
  )
}
