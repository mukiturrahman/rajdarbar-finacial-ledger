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
import {
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
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
  const selectAllDesktopRef = useRef<HTMLInputElement>(null)
  const selectAllMobileRef = useRef<HTMLInputElement>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [search, setSearch] = useState(currentSearch)
  const [typeFilter, setTypeFilter] = useState(currentType)
  const [statusFilter, setStatusFilter] = useState(currentStatus)
  const [monthFilter, setMonthFilter] = useState(currentMonth)
  const [filtersOpen, setFiltersOpen] = useState(false)
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
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      updateUrlParams({ search: val, page: '1' })
    }, 300)
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

  const clearFilters = () => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    setSearch('')
    setTypeFilter('All')
    setStatusFilter('All')
    setMonthFilter('')
    updateUrlParams({ search: '', type: 'All', status: 'All', month: '', page: '1' })
  }

  const setPage = (p: number) => {
    updateUrlParams({ page: p.toString() })
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE))
  const paginated = txns
  const selectedVisibleCount = paginated.filter(t => selectedIds.has(t.id)).length
  const allVisibleSelected = paginated.length > 0 && selectedVisibleCount === paginated.length
  const activeFilterCount = Number(!!monthFilter) + Number(typeFilter !== 'All') + Number(statusFilter !== 'All')
  const hasActiveFilters = search.trim().length > 0 || activeFilterCount > 0

  useEffect(() => {
    const isIndeterminate = selectedVisibleCount > 0 && !allVisibleSelected
    if (selectAllDesktopRef.current) selectAllDesktopRef.current.indeterminate = isIndeterminate
    if (selectAllMobileRef.current) selectAllMobileRef.current.indeterminate = isIndeterminate
  }, [allVisibleSelected, selectedVisibleCount])

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [])

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
      <div className="page-header !block">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3">
          <div>
            <h1>Transactions</h1>
            <p className="mt-0.5 text-[0.8125rem] text-text-muted">
              {totalCount} transaction{totalCount === 1 ? '' : 's'}
            </p>
          </div>
          {canMutate && (
            <button
              onClick={() => { setEditTxn(null); setModalOpen(true) }}
              className="btn-primary !px-3 md:!px-5"
            >
              <Plus size={17} />
              <span className="md:hidden">Add</span>
              <span className="hidden md:inline">Add Transaction</span>
            </button>
          )}
        </div>
      </div>

      <div className="filter-bar !block">
        <div className="mx-auto w-full max-w-[1440px] md:flex md:items-center md:gap-3">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                placeholder="Search transactions..."
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                className="filter-search !pl-10 text-base md:text-sm"
                aria-label="Search transactions"
              />
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(open => !open)}
              className="btn-secondary relative !px-3 md:hidden"
              aria-expanded={filtersOpen}
              aria-controls="mobile-transaction-filters"
            >
              <SlidersHorizontal size={17} />
              <span className="sr-only">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1 text-[0.625rem] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="mt-3 hidden gap-3 md:mt-0 md:flex">
            <select
              className="filter-select min-w-[160px]"
              value={monthFilter || 'all'}
              onChange={(e) => handleMonthChange(e.target.value === 'all' ? '' : e.target.value)}
              aria-label="Filter by month"
            >
              <option value="all">All Months</option>
              {availableMonths.map(m => {
                const date = new Date(`${m}-01T00:00:00`)
                const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                return <option key={m} value={m}>{label}</option>
              })}
            </select>
            <select
              value={typeFilter}
              onChange={e => handleTypeChange(e.target.value)}
              className="filter-select"
              aria-label="Filter by transaction type"
            >
              <option value="All">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
            <select
              value={statusFilter}
              onChange={e => handleStatusChange(e.target.value)}
              className="filter-select"
              aria-label="Filter by transaction status"
            >
              <option value="All">All Status</option>
              {TRANSACTION_STATUSES.map(status => <option key={status}>{status}</option>)}
            </select>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="btn-ghost whitespace-nowrap">
                Clear filters
              </button>
            )}
          </div>

          <div
            id="mobile-transaction-filters"
            className={`${filtersOpen ? 'grid' : 'hidden'} mt-4 grid-cols-2 gap-3 border-t border-border-subtle pt-4 md:hidden`}
          >
            <label className="col-span-2 text-xs font-semibold text-text-secondary">
              Month
              <select
                className="filter-select mt-1.5 text-base md:text-sm"
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
            </label>
            <label className="text-xs font-semibold text-text-secondary">
              Type
              <select value={typeFilter} onChange={e => handleTypeChange(e.target.value)} className="filter-select mt-1.5 text-base md:text-sm">
                <option value="All">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-text-secondary">
              Status
              <select value={statusFilter} onChange={e => handleStatusChange(e.target.value)} className="filter-select mt-1.5 text-base md:text-sm">
                <option value="All">All Status</option>
                {TRANSACTION_STATUSES.map(status => <option key={status}>{status}</option>)}
              </select>
            </label>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="btn-ghost col-span-2 justify-self-end !px-2">
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        className={`flex-1 px-5 pt-4 md:px-8 md:py-6 ${
          canMutate && selectedIds.size > 0 ? 'pb-44 md:pb-6' : 'pb-4 md:pb-6'
        }`}
      >
        <div className="mx-auto w-full max-w-[1440px]">
          {canMutate && selectedIds.size > 0 && (
            <div
              className="mb-3 hidden flex-wrap items-center gap-3 rounded-2xl border border-brand-gold/20 bg-brand-gold/[0.05] p-3 md:flex"
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

          <div className="mb-3 flex items-center justify-between md:hidden">
            {canMutate ? (
              <label className="-ml-2 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-2 text-sm font-medium text-text-secondary">
                <input
                  ref={selectAllMobileRef}
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  className="h-4 w-4 cursor-pointer accent-brand-gold"
                />
                Select this page
              </label>
            ) : <span />}
            <span className="text-xs text-text-muted">{paginated.length} shown</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-bg-card shadow-glass-sm md:hidden">
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-12 text-center">
                <Search size={24} className="mb-3 text-text-muted" />
                <p className="font-semibold text-text-primary">No transactions found</p>
                <p className="mt-1 text-sm text-text-muted">Try changing your search or filters.</p>
                {hasActiveFilters && (
                  <button type="button" onClick={clearFilters} className="btn-secondary mt-4">
                    Clear filters
                  </button>
                )}
              </div>
            ) : paginated.map(t => {
              const eventName = events.find(e => e.id === t.event_id)?.name
              const isSelected = selectedIds.has(t.id)
              return (
                <article
                  key={t.id}
                  className={`border-b border-border-subtle p-4 last:border-b-0 ${
                    isSelected ? 'bg-brand-gold/[0.05] shadow-[inset_3px_0_0_var(--color-brand-gold)]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {canMutate && (
                      <label className="-ml-2 -mt-2 inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTransaction(t.id)}
                          className="h-4 w-4 cursor-pointer accent-brand-gold"
                          aria-label={`Select transaction ${t.description}`}
                        />
                      </label>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="line-clamp-2 text-sm font-semibold leading-5 text-text-primary">
                          {t.description}
                        </h2>
                        <span className={`shrink-0 font-mono text-sm font-bold ${
                          t.type === 'Income' ? 'text-semantic-green' : 'text-semantic-red'
                        }`}>
                          {t.type === 'Income' ? '+' : '-'}{formatTaka(t.amount)}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-2 text-xs text-text-muted">
                        <span>{formatDate(t.date)}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-bold uppercase ${
                          t.type === 'Income' ? 'text-semantic-green' : 'text-semantic-red'
                        }`}>
                          {t.type}
                        </span>
                      </div>

                      {eventName && (
                        <p className="mt-2 truncate text-xs text-text-secondary">{eventName}</p>
                      )}

                      <div className="mt-3 flex min-h-11 items-center justify-between gap-2 border-t border-border-subtle pt-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <Badge variant={t.status} />
                          <span className="truncate text-xs text-text-muted">{t.method}</span>
                        </div>
                        {canMutate && (
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              onClick={() => { setEditTxn(t); setModalOpen(true) }}
                              className="btn-ghost !h-11 !min-h-11 !w-11 !min-w-11 !p-0 text-text-muted hover:text-brand-gold"
                              aria-label={`Edit transaction ${t.description}`}
                            >
                              <Edit2 size={17} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(t.id)}
                              className="btn-ghost !h-11 !min-h-11 !w-11 !min-w-11 !p-0 text-text-muted hover:text-semantic-red"
                              aria-label={`Delete transaction ${t.description}`}
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="table-wrap !m-0 hidden md:block">
            <table className="data-table">
              <thead><tr>
                {canMutate && (
                  <th className="w-12 !px-2">
                    <label className="inline-flex h-11 w-11 cursor-pointer items-center justify-center">
                      <input
                        ref={selectAllDesktopRef}
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
                  const eventName = events.find(e => e.id === t.event_id)?.name || '-'
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
            <nav className="flex items-center justify-between gap-3 py-4 md:justify-center md:py-6" aria-label="Transaction pages">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-ghost !min-h-11 !px-2 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
                <span className="md:hidden">Previous</span>
              </button>
              <span className="text-xs text-text-muted md:text-sm">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-ghost !min-h-11 !px-2 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next page"
              >
                <span className="md:hidden">Next</span>
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </div>
      </div>

      {canMutate && selectedIds.size > 0 && (
        <div
          className="fixed inset-x-0 bottom-[72px] z-40 border-t border-brand-gold/20 bg-bg-base/95 px-4 py-3 shadow-glass backdrop-blur-xl md:hidden"
          aria-busy={bulkAction !== null}
        >
          <div className="mx-auto max-w-lg">
            <div className="mb-2 flex min-h-11 items-center gap-2">
              <span className="mr-auto text-sm font-semibold text-text-primary" aria-live="polite">
                {selectedIds.size} selected
              </span>
              <button
                onClick={() => setBulkDeleteOpen(true)}
                disabled={bulkAction !== null}
                className="btn-ghost !min-h-11 !px-3 !text-semantic-red hover:!bg-semantic-red/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
              <button
                onClick={clearSelection}
                disabled={bulkAction !== null}
                className="btn-ghost !min-h-11 !px-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear
              </button>
            </div>
            <div className="flex gap-2">
              <select
                value={bulkStatus}
                onChange={e => setBulkStatus(e.target.value as Transaction['status'] | '')}
                className="filter-select min-w-0 flex-1 text-base md:text-sm"
                aria-label="New status for selected transactions"
                disabled={bulkAction !== null}
              >
                <option value="">Change status...</option>
                {TRANSACTION_STATUSES.map(status => <option key={status}>{status}</option>)}
              </select>
              <button
                onClick={handleBulkStatusUpdate}
                disabled={!bulkStatus || bulkAction !== null}
                className="btn-primary shrink-0 !px-4 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkAction === 'status' ? 'Updating...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

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
