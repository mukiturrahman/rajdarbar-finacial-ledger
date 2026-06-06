import { formatTaka } from '@/lib/utils/formatters'
import type { EventClient, EventProfit } from '@/types'
import { Trash2, CheckCircle } from 'lucide-react'

interface Props {
  event: EventClient
  profit: EventProfit
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
  onPaidInFull?: (id: string) => void
  onClick?: (id: string) => void
  canMutate?: boolean
}

export function EventCard({ event, profit, onDelete, onEdit, onPaidInFull, onClick, canMutate }: Props) {
  const remaining = event.remaining_amount ?? 0
  const isPaid = remaining <= 0

  return (
    <div
      className="bg-bg-void border border-border p-5 flex flex-col gap-3 hover:border-border-hover transition-colors relative group cursor-pointer"
      onClick={() => onClick?.(event.id)}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-base font-bold text-text-primary pr-6">{event.name}</h3>
        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
          <span className={`text-sm font-bold font-mono ${profit.net >= 0 ? 'text-semantic-green' : 'text-semantic-red'}`}>{formatTaka(profit.net)}</span>
          {canMutate && onEdit && (
            <button onClick={() => onEdit(event.id)} className="text-text-muted hover:text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </button>
          )}
          {canMutate && onDelete && (
            <button onClick={() => onDelete(event.id)} className="text-text-muted hover:text-semantic-red opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-4 text-[0.6875rem] text-text-muted">
        <span>{profit.txnCount} transactions</span>
      </div>
      <div className="flex gap-4">
        <div><p className="text-[0.5625rem] uppercase text-text-muted font-bold">Revenue</p><p className="text-sm font-bold font-mono text-semantic-green">{formatTaka(profit.revenue)}</p></div>
        <div><p className="text-[0.5625rem] uppercase text-text-muted font-bold">Expenses</p><p className="text-sm font-bold font-mono text-semantic-red">{formatTaka(profit.expenses)}</p></div>
      </div>

      {/* Remaining balance / Paid status */}
      <div className="border-t border-border pt-3 mt-1 flex items-center justify-between" onClick={e => e.stopPropagation()}>
        {isPaid ? (
          <div className="flex items-center gap-1.5 text-semantic-green">
            <CheckCircle size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Paid</span>
          </div>
        ) : (
          <>
            <div>
              <p className="text-[0.5625rem] uppercase text-text-muted font-bold">Remaining</p>
              <p className="text-sm font-bold font-mono text-brand-gold">{formatTaka(remaining)}</p>
            </div>
            {canMutate && onPaidInFull && (
              <button
                onClick={() => onPaidInFull(event.id)}
                className="text-[0.6875rem] font-bold px-3 py-1.5 border border-border text-semantic-green hover:bg-bg-hover transition-colors"
              >
                Paid in Full
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
