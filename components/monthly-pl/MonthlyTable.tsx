'use client'
import { formatTaka } from '@/lib/utils/formatters'
import type { MonthlyPL } from '@/types'

export default function MonthlyTable({ data }: { data: MonthlyPL[] }) {
  const reversed = [...data].reverse()
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead><tr><th>Month</th><th className="text-right">Revenue</th><th className="text-right">Expenses</th><th className="text-right">Net P&amp;L</th><th className="text-right">Margin</th></tr></thead>
        <tbody>
          {reversed.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-12 text-text-muted">No data yet</td></tr>
          ) : reversed.map(m => {
            const monthLabel = new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            return (
              <tr key={m.month}>
                <td className="font-medium text-text-primary">{monthLabel}</td>
                <td className="text-right font-mono text-semantic-green">{formatTaka(m.revenue)}</td>
                <td className="text-right font-mono text-semantic-red">{formatTaka(m.expenses)}</td>
                <td className={`text-right font-mono font-bold ${m.net >= 0 ? 'text-semantic-green' : 'text-semantic-red'}`}>{formatTaka(m.net)}</td>
                <td className="text-right font-mono text-text-secondary">{m.margin}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
