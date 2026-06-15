import { getSupabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Transaction } from '@/types'
import { ReceiptTable } from '@/components/receipts/ReceiptTable'

export default async function ReceiptsPage() {
  const supabase = await getSupabaseServer()
  const { data: txnsRaw } = await supabase
    .from('transactions')
    .select('*')
    .eq('type', 'Expense')
    .eq('source', 'Receipt Page')
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    
  const receipts = (txnsRaw ?? []) as Transaction[]

  return (
    <div className="flex flex-col h-full">
      <div className="page-header">
        <div><h1>Receipts</h1><p className="text-[0.8125rem] text-text-muted mt-0.5">{receipts.length} expenses logged</p></div>
        <Link href="/receipts/new" className="btn-primary"><Plus size={16} />Create Receipt</Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:py-6 md:px-0">
        <ReceiptTable initialReceipts={receipts} />
      </div>
    </div>
  )
}
