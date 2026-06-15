'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { formatTaka, formatDate } from '@/lib/utils/formatters'
import { deleteTransactionAction } from '@/app/actions/transactions'
import { useToast } from '@/components/ui/Toast'
import { useProfile } from '@/lib/context/ProfileContext'
import { Trash2, FileImage, Search } from 'lucide-react'
import type { Transaction } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface Props {
  initialReceipts: Transaction[]
}

export function ReceiptTable({ initialReceipts }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const profile = useProfile()
  const canMutate = !!(profile && ['owner', 'editor', 'manager'].includes(profile.role))

  const [receipts, setReceipts] = useState<Transaction[]>(initialReceipts)
  const [search, setSearch] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    // Optimistic UI update
    const previousReceipts = receipts
    setReceipts(receipts.filter(r => r.id !== id))
    
    const res = await deleteTransactionAction(id)
    if (res.success) {
      toast('Receipt deleted successfully')
      router.refresh()
    } else {
      toast(res.error || 'Failed to delete receipt', 'error')
      setReceipts(previousReceipts)
    }
    setDeleteConfirmId(null)
  }

  const filteredReceipts = receipts.filter(r => {
    const term = search.toLowerCase()
    return (
      (r.description?.toLowerCase() || '').includes(term) ||
      (r.category?.toLowerCase() || '').includes(term) ||
      String(r.amount).includes(term)
    )
  })

  return (
    <>
      <div className="filter-bar mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search receipts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="filter-search !pl-10 w-full"
          />
        </div>
      </div>

      <div className="table-wrap md:!mt-0">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Receipt</th>
              {canMutate && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.length === 0 ? (
              <tr>
                <td colSpan={canMutate ? 7 : 6} className="text-center py-12 text-text-muted">
                  No receipts found
                </td>
              </tr>
            ) : (
              filteredReceipts.map(txn => (
                <tr key={txn.id}>
                  <td className="text-text-muted">{formatDate(txn.date)}</td>
                  <td className="font-medium text-text-secondary">{txn.category || 'Uncategorized'}</td>
                  <td className="text-text-primary max-w-xs truncate">{txn.description}</td>
                  <td className="font-mono font-bold text-semantic-red">-{formatTaka(txn.amount)}</td>
                  <td><Badge variant={txn.status} /></td>
                  <td>
                    {txn.receipt_url ? (
                      <a
                        href={txn.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost !p-1.5 !min-w-0 !min-h-0 text-brand-gold hover:text-brand-gold-bright"
                      >
                        <FileImage size={16} />
                      </a>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    )}
                  </td>
                  {canMutate && (
                    <td className="text-right">
                      <button
                        onClick={() => setDeleteConfirmId(txn.id)}
                        className="btn-ghost !p-1.5 !min-w-0 !min-h-0 text-text-muted hover:text-semantic-red"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) handleDelete(deleteConfirmId)
        }}
        title="Delete Receipt"
        description="Are you sure you want to delete this receipt? This will also remove the associated transaction."
        destructive={true}
      />
    </>
  )
}
