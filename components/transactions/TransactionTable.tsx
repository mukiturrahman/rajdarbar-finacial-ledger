'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AddTransactionModal } from './AddTransactionModal'
import { Badge } from '@/components/ui/Badge'
import { formatTaka, formatDate } from '@/lib/utils/formatters'
import { deleteTransactionAction } from '@/app/actions/transactions'
import { useToast } from '@/components/ui/Toast'
import { useProfile } from '@/lib/context/ProfileContext'
import { Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { Transaction, MasterConfig, EventClient, Project } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

import { usePathname, useSearchParams } from 'next/navigation'

const PER_PAGE = 15

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
  
  // Sync state when props change (from URL navigation)
  useEffect(() => {
    setTxns(initialTxns)
  }, [initialTxns])

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
        <div className="table-wrap md:!mt-0">
          <table className="data-table">
            <thead><tr>
              <th>Date</th><th>Description</th><th>Event</th><th>Type</th><th>Amount</th><th>Method</th><th>Status</th>
              {canMutate && <th className="text-right">Actions</th>}
            </tr></thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={canMutate ? 8 : 7} className="text-center py-12 text-text-muted">No transactions found</td></tr>
              ) : paginated.map(t => {
                const eventName = events.find(e => e.id === t.event_id)?.name || '—'
                return (
                  <tr key={t.id}>
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
                          <button onClick={() => { setEditTxn(t); setModalOpen(true) }} className="btn-ghost !p-1.5 !min-w-0 !min-h-0 text-text-muted hover:text-brand-gold"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteConfirmId(t.id)} className="btn-ghost !p-1.5 !min-w-0 !min-h-0 text-text-muted hover:text-semantic-red"><Trash2 size={14} /></button>
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
    </>
  )
}
