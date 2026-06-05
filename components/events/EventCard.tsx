import { formatTaka } from '@/lib/utils/formatters'
import type { EventClient, Project, EventProfit } from '@/types'
import { Trash2 } from 'lucide-react'

interface Props { event: EventClient; projects: Project[]; profit: EventProfit; onDelete?: (id: string) => void; canMutate?: boolean }

export function EventCard({ event, projects, profit, onDelete, canMutate }: Props) {
  return (
    <div className="glass p-5 flex flex-col gap-3 hover:border-brand-gold/20 transition-colors relative group">
      <div className="flex items-start justify-between">
        <h3 className="text-base font-bold text-text-primary pr-6">{event.name}</h3>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold font-mono ${profit.net >= 0 ? 'text-semantic-green' : 'text-semantic-red'}`}>{formatTaka(profit.net)}</span>
          {canMutate && onDelete && (
            <button onClick={() => onDelete(event.id)} className="text-text-muted hover:text-semantic-red opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-4 text-[0.6875rem] text-text-muted">
        <span>{profit.txnCount} transactions</span>
        <span>{projects.length} projects</span>
      </div>
      <div className="flex gap-4">
        <div><p className="text-[0.5625rem] uppercase text-text-muted font-bold">Revenue</p><p className="text-sm font-bold text-semantic-green">{formatTaka(profit.revenue)}</p></div>
        <div><p className="text-[0.5625rem] uppercase text-text-muted font-bold">Expenses</p><p className="text-sm font-bold text-semantic-red">{formatTaka(profit.expenses)}</p></div>
      </div>
      {projects.length > 0 && (
        <div className="border-t border-border-subtle pt-3 mt-1">
          <p className="text-[0.5625rem] font-bold text-text-muted uppercase mb-2">Projects</p>
          <div className="flex flex-wrap gap-1.5">
            {projects.map(p => (<span key={p.id} className="px-2 py-0.5 rounded-md text-[0.625rem] font-medium" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#cbd5e1' }}>{p.name}</span>))}
          </div>
        </div>
      )}
    </div>
  )
}
