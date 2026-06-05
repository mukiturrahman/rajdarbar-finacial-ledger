'use client'
import { useState } from 'react'
import { AddTransactionModal } from './AddTransactionModal'
import { Badge } from '@/components/ui/Badge'
import { formatTaka, formatDate } from '@/lib/utils/formatters'
import { deleteTransactionAction } from '@/app/actions/transactions'
import { useToast } from '@/components/ui/Toast'
import { useProfile } from '@/lib/context/ProfileContext'
import { Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { Transaction, MasterConfig, EventClient, Project } from '@/types'

const PER_PAGE = 15

interface Props {
  initialTxns: Transaction[]
  config: MasterConfig
  events: EventClient[]
  projects: Project[]
}

export function TransactionTable({ initialTxns, config, events, projects }: Props) {
  const { toast } = useToast()
  const profile = useProfile()
  const canMutate = profile && ['owner', 'editor'].includes(profile.role)

  const [txns] = useState(initialTxns)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTxn, setEditTxn] = useState<Transaction | null>(null)

  const filtered = txns.filter(t => {
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'All' && t.type !== typeFilter) return false
    if (statusFilter !== 'All' && t.status !== statusFilter) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return
    const res = await deleteTransactionAction(id)
    if (res.success) { toast('Transaction deleted'); window.location.reload() }
    else toast(res.error || 'Failed to delete', 'error')
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p className="text-[0.8125rem] text-text-muted mt-0.5">{filtered.length} records</p>
        </div>
        {canMutate && (
          <button onClick={() => { setEditTxn(null); setModalOpen(true) }} className="btn-primary"><Plus size={16} />Add Transaction</button>
        )}
      </div>

      <div className="filter-bar">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search transactions..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="filter-search !pl-10" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="filter-select">
          <option value="All">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="filter-select">
          <option value="All">All Status</option>
          {['Pending', 'Received', 'Paid', 'Rejected', 'On Hold'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-0">
        <div className="table-wrap">
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
                          <button onClick={() => handleDelete(t.id)} className="btn-ghost !p-1.5 !min-w-0 !min-h-0 text-text-muted hover:text-semantic-red"><Trash2 size={14} /></button>
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
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost !p-2 disabled:opacity-30"><ChevronLeft size={16} /></button>
            <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost !p-2 disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>

      <AddTransactionModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTxn(null) }} editTxn={editTxn} events={events} projects={projects} config={config} />
    </>
  )
}
