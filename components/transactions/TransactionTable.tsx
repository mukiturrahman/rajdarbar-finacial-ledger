'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AddTransactionModal } from './AddTransactionModal'
import { Badge } from '@/components/ui/Badge'
import { formatTaka, formatDate } from '@/lib/utils/formatters'
import {
  bulkDeleteTransactionsAction,
  bulkUpdateTransactionStatusAction,
  deleteTransactionAction,
} from '@/app/actions/transactions'
import { useToast } from '@/components/ui/Toast'
import { useProfile } from '@/lib/context/ProfileContext'
import { Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { Transaction, MasterConfig, EventClient, Project } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

import { usePathname, useSearchParams } from 'next/navigation'

const PER_PAGE = 15
const TRANSACTION_STATUSES: Transaction['status'][] = ['Pending', 'Received', 'Paid', 'Rejected', 'On Hold']

interface Props {
  initialTxns: Transaction[]
  totalCount: number
  currentPage: number
  currentSearch: string
  currentType: string
  currentStatus: string
  currentMonth: string
  availableMonths: string[]
  config: MasterConfig
  events: EventClient[]
  projects: Project[]
}

export function TransactionTable({ initialTxns, totalCount, currentPage, currentSearch, currentType, currentStatus, currentMonth, availableMonths, config, events, projects }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const profile = useProfile()
  const canMutate = !!(profile && ['owner', 'editor', 'manager'].includes(profile.role))

  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [txns, setTxns] = useState(initialTxns)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [bulkStatus, setBulkStatus] = useState<Transaction['status'] | ''>('')
  const [bulkAction, setBulkAction] = useState<'status' | 'delete' | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const [search, setSearch] = useState(currentSearch)
  const [typeFilter, setTypeFilter] = useState(currentType)
  const [statusFilter, setStatusFilter] = useState(currentStatus)
  const [monthFilter, setMonthFilter] = useState(currentMonth)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTxn, setEditTxn] = useState<Transaction | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'All') params.set(key, value)
      else params.delete(key)
    })
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearchChange = (val: string) => {
    setSearch(val)
    updateUrlParams({ search: val, page: '1' })
  }

  const handleTypeChange = (val: string) => {
    setTypeFilter(val)
    updateUrlParams({ type: val, page: '1' })
  }

  const handleStatusChange = (val: string) => {
    setStatusFilter(val)
    updateUrlParams({ status: val, page: '1' })
  }

  const handleMonthChange = (val: string) => {
    setMonthFilter(val)
    updateUrlParams({ month: val, page: '1' })
  }

  const setPage = (p: number) => {
    updateUrlParams({ page: p.toString() })
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE))
  const paginated = txns
  const selectedVisibleCount = paginated.filter(t => selectedIds.has(t.id)).length
  const allVisibleSelected = paginated.length > 0 && selectedVisibleCount === paginated.length

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected
    }
  }, [allVisibleSelected, selectedVisibleCount])

  const toggleTransaction = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllVisible = () => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allVisibleSelected) paginated.forEach(t => next.delete(t.id))
      else paginated.forEach(t => next.add(t.id))
      return next
    })
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setBulkStatus('')
  }

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedIds.size === 0) return

    const ids = Array.from(selectedIds)
    setBulkAction('status')
    try {
      const res = await bulkUpdateTransactionStatusAction(ids, bulkStatus)
      if (!res.success) {
        toast(res.error || 'Failed to update transactions', 'error')
        return
      }

      setTxns(prev => prev.map(t => ids.includes(t.id) ? { ...t, status: bulkStatus } : t))
      toast(`${ids.length} transaction${ids.length === 1 ? '' : 's'} updated`)
      clearSelection()
      router.refresh()
    } catch {
      toast('Failed to update transactions', 'error')
    } finally {
      setBulkAction(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    const ids = Array.from(selectedIds)
    const selectedIdSet = new Set(ids)
    setBulkAction('delete')
    try {
      const res = await bulkDeleteTransactionsAction(ids)
      if (!res.success) {
        toast(res.error || 'Failed to delete transactions', 'error')
        return
      }

      setTxns(prev => prev.filter(t => !selectedIdSet.has(t.id)))
      toast(`${ids.length} transaction${ids.length === 1 ? '' : 's'} deleted`)
      clearSelection()
      router.refresh()
    } catch {
      toast('Failed to delete transactions', 'error')
    } finally {
      setBulkAction(null)
    }
  }

  const handleDelete = async (id: string) => {
    setTxns(txns.filter(t => t.id !== id))
    const res = await deleteTransactionAction(id)
    if (res.success) { toast('Transaction deleted') }
    else {
      toast(res.error || 'Failed to delete', 'error')
      setTxns(initialTxns)
      router.refresh()
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p className="text-[0.8125rem] text-text-muted mt-0.5">{totalCount} records</p>
        </div>
        {canMutate && (
          <button onClick={() => { setEditTxn(null); setModalOpen(true) }} className="btn-primary"><Plus size={16} />Add Transaction</button>
        )}
      </div>

      <div className="filter-bar">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search transactions..." value={search} onChange={e => handleSearchChange(e.target.value)} className="filter-search !pl-10" />
        </div>
        <select 
          className="filter-select min-w-[140px]" 
          value={monthFilter || 'all'} 
          onChange={(e) => handleMonthChange(e.target.value === 'all' ? '' : e.target.value)}
        >
          <option value="all">All Months</option>
          {availableMonths.map(m => {
            const date = new Date(`${m}-01T00:00:00`)
            const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            return <option key={m} value={m}>{label}</option>
          })}
        </select>
        <select value={typeFilter} onChange={e => handleTypeChange(e.target.value)} className="filter-select">
          <option value="All">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
        <select value={statusFilter} onChange={e => handleStatusChange(e.target.value)} className="filter-select">
          <option value="All">All Status</option>
          {['Pending', 'Received', 'Paid', 'Rejected', 'On Hold'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:py-6 md:px-0">
        {canMutate && selectedIds.size > 0 && (
          <div
            className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-brand-gold/20 bg-brand-gold/[0.05] p-3"
            aria-busy={bulkAction !== null}
          >
            <span className="mr-auto text-sm font-semibold text-text-primary" aria-live="polite">
              {selectedIds.size} transaction{selectedIds.size === 1 ? '' : 's'} selected
            </span>
            <select
              value={bulkStatus}
              onChange={e => setBulkStatus(e.target.value as Transaction['status'] | '')}
              className="filter-select min-w-[160px]"
              aria-label="New status for selected transactions"
              disabled={bulkAction !== null}
            >
              <option value="">Change status...</option>
              {TRANSACTION_STATUSES.map(status => <option key={status}>{status}</option>)}
            </select>
            <button
              onClick={handleBulkStatusUpdate}
              disabled={!bulkStatus || bulkAction !== null}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bulkAction === 'status' ? 'Updating...' : 'Update status'}
            </button>
            <button
              onClick={() => setBulkDeleteOpen(true)}
              disabled={bulkAction !== null}
              className="btn-ghost !text-semantic-red hover:!bg-semantic-red/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={16} />
              {bulkAction === 'delete' ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={clearSelection}
              disabled={bulkAction !== null}
              className="btn-ghost disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        )}

        <div className="table-wrap md:!mt-0">
          <table className="data-table">
            <thead><tr>
              {canMutate && (
                <th className="w-12 !px-2">
                  <label className="inline-flex h-11 w-11 cursor-pointer items-center justify-center">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      className="h-4 w-4 cursor-pointer accent-brand-gold"
                      aria-label="Select all transactions on this page"
                    />
                  </label>
                </th>
              )}
              <th>Date</th><th>Description</th><th>Event</th><th>Type</th><th>Amount</th><th>Method</th><th>Status</th>
              {canMutate && <th className="text-right">Actions</th>}
            </tr></thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={canMutate ? 9 : 7} className="text-center py-12 text-text-muted">No transactions found</td></tr>
              ) : paginated.map(t => {
                const eventName = events.find(e => e.id === t.event_id)?.name || '—'
                return (
                  <tr key={t.id} className={selectedIds.has(t.id) ? 'bg-brand-gold/[0.04]' : undefined}>
                    {canMutate && (
                      <td className="!px-2">
                        <label className="inline-flex h-11 w-11 cursor-pointer items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(t.id)}
                            onChange={() => toggleTransaction(t.id)}
                            className="h-4 w-4 cursor-pointer accent-brand-gold"
                            aria-label={`Select transaction ${t.description}`}
                          />
                        </label>
                      </td>
                    )}
                    <td className="text-text-muted whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="font-medium text-text-primary max-w-[200px] truncate">{t.description}</td>
                    <td className="text-text-secondary">{eventName}</td>
                    <td><span className={`text-xs font-bold uppercase ${t.type === 'Income' ? 'text-semantic-green' : 'text-semantic-red'}`}>{t.type}</span></td>
                    <td className={`font-mono font-bold ${t.type === 'Income' ? 'text-semantic-green' : 'text-semantic-red'}`}>{t.type === 'Income' ? '+' : '-'}{formatTaka(t.amount)}</td>
                    <td className="text-text-muted">{t.method}</td>
                    <td><Badge variant={t.status} /></td>
                    {canMutate && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditTxn(t); setModalOpen(true) }}
                            className="btn-ghost !p-1.5 !min-w-0 !min-h-0 text-text-muted hover:text-brand-gold"
                            aria-label={`Edit transaction ${t.description}`}
                            title="Edit transaction"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(t.id)}
                            className="btn-ghost !p-1.5 !min-w-0 !min-h-0 text-text-muted hover:text-semantic-red"
                            aria-label={`Delete transaction ${t.description}`}
                            title="Delete transaction"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 py-4 md:py-6">
            <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="btn-ghost !p-2 disabled:opacity-30"><ChevronLeft size={16} /></button>
            <span className="text-sm text-text-muted">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="btn-ghost !p-2 disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>

      <AddTransactionModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTxn(null) }} editTxn={editTxn} events={events} projects={projects} config={config} />
      
      <ConfirmModal
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => { if (deleteConfirmId) handleDelete(deleteConfirmId) }}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction?"
        destructive={true}
      />
      <ConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Transactions"
        description={`Are you sure you want to delete ${selectedIds.size} selected transaction${selectedIds.size === 1 ? '' : 's'}?`}
        confirmText="Delete selected"
        destructive={true}
      />
    </>
  )
}
