'use client'
import { formatTaka } from '@/lib/utils/formatters'
import type { MonthlyPL } from '@/types'
import { Download } from 'lucide-react'
import { exportToCSV } from '@/lib/utils/export'
import { useLanguage } from '@/components/LanguageProvider'

export default function MonthlyTable({ data }: { data: MonthlyPL[] }) {
  const { t } = useLanguage()
  const reversed = [...data].reverse()

  const handleExport = () => {
    const csvData = reversed.map(m => ({
      Month: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      'Events Completed': m.eventsCompleted,
      Revenue: m.revenue,
      Expenses: m.expenses,
      'Net P&L': m.net,
      Margin: `${m.margin}%`
    }))
    exportToCSV(csvData, 'monthly_pl.csv')
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <button onClick={handleExport} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-2">
          <Download size={14} /> Export CSV
        </button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
        <thead><tr><th>Month</th><th className="text-right">{t("eventsCompleted")}</th><th className="text-right">Revenue</th><th className="text-right">Expenses</th><th className="text-right">Net P&amp;L</th><th className="text-right">Margin</th></tr></thead>
        <tbody>
          {reversed.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-12 text-text-muted">No data yet</td></tr>
          ) : reversed.map(m => {
            const monthLabel = new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            return (
              <tr key={m.month}>
                <td className="font-medium text-text-primary">{monthLabel}</td>
                <td className="text-right font-mono text-text-secondary">{m.eventsCompleted}</td>
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
    </div>
  )
}
