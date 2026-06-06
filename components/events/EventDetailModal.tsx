'use client'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { formatTaka, formatDate } from '@/lib/utils/formatters'
import type { EventClient, EventProfit, Transaction } from '@/types'
import { CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  event: EventClient | null
  profit: EventProfit | null
  transactions: Transaction[]
}

export function EventDetailModal({ open, onClose, event, profit, transactions }: Props) {
  if (!event || !profit) return null

  const remaining = event.remaining_amount ?? 0
  const isPaid = remaining <= 0

  // Sort transactions by date descending
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Modal open={open} onClose={onClose} title={event.name}>
      <div className="flex flex-col gap-5">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 border border-border bg-bg-void text-center">
            <p className="text-[0.5625rem] uppercase text-text-muted font-bold mb-1">Revenue</p>
            <p className="text-sm font-bold font-mono text-semantic-green">{formatTaka(profit.revenue)}</p>
          </div>
          <div className="p-3 border border-border bg-bg-void text-center">
            <p className="text-[0.5625rem] uppercase text-text-muted font-bold mb-1">Expenses</p>
            <p className="text-sm font-bold font-mono text-semantic-red">{formatTaka(profit.expenses)}</p>
          </div>
          <div className="p-3 border border-border bg-bg-void text-center">
            <p className="text-[0.5625rem] uppercase text-text-muted font-bold mb-1">Net P/L</p>
            <p className={`text-sm font-bold font-mono ${profit.net >= 0 ? 'text-semantic-green' : 'text-semantic-red'}`}>{formatTaka(profit.net)}</p>
          </div>
        </div>

        {/* Event meta */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[0.8125rem]">
          {event.event_type && (
            <div><span className="text-text-muted">Type:</span> <span className="text-text-primary font-medium">{event.event_type}</span></div>
          )}
          {event.party_name && (
            <div><span className="text-text-muted">Party:</span> <span className="text-text-primary font-medium">{event.party_name}</span></div>
          )}
          {event.event_date && (
            <div><span className="text-text-muted">Event Date:</span> <span className="text-text-primary font-medium">{formatDate(event.event_date)}</span></div>
          )}
          {event.total_amount != null && event.total_amount > 0 && (
            <div><span className="text-text-muted">Total:</span> <span className="text-text-primary font-medium font-mono">{formatTaka(event.total_amount)}</span></div>
          )}
          <div className="col-span-2 flex items-center gap-2 mt-1">
            <span className="text-text-muted">Payment:</span>
            {isPaid ? (
              <span className="inline-flex items-center gap-1 text-semantic-green font-bold text-xs"><CheckCircle size={12} /> Fully Paid</span>
            ) : (
              <span className="text-brand-gold font-bold font-mono text-xs">{formatTaka(remaining)} remaining</span>
            )}
          </div>
        </div>

        {/* Transaction ledger */}
        <div>
          <h3 className="text-[0.6875rem] font-bold text-text-muted uppercase tracking-[0.08em] mb-3">
            Transaction Ledger · {sorted.length} {sorted.length === 1 ? 'entry' : 'entries'}
          </h3>

          {sorted.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm">No transactions linked to this event</div>
          ) : (
            <div className="flex flex-col gap-0 border border-border overflow-hidden">
              {sorted.map((t, i) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i !== sorted.length - 1 ? 'border-b border-border' : ''} hover:bg-bg-hover transition-colors`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${t.type === 'Income' ? 'bg-semantic-green/10' : 'bg-semantic-red/10'}`}>
                    {t.type === 'Income'
                      ? <ArrowUpRight size={14} className="text-semantic-green" />
                      : <ArrowDownRight size={14} className="text-semantic-red" />
                    }
                  </div>

                  {/* Description + date */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.8125rem] font-medium text-text-primary truncate">{t.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[0.6875rem] text-text-muted">{formatDate(t.date)}</span>
                      <span className="text-[0.6875rem] text-text-muted">· {t.method}</span>
                    </div>
                  </div>

                  {/* Amount + status */}
                  <div className="flex-shrink-0 text-right flex flex-col items-end gap-1">
                    <span className={`text-sm font-bold font-mono ${t.type === 'Income' ? 'text-semantic-green' : 'text-semantic-red'}`}>
                      {t.type === 'Income' ? '+' : '-'}{formatTaka(t.amount)}
                    </span>
                    <Badge variant={t.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Modal>
  )
}
