'use client'
import { formatTaka } from '@/lib/utils/formatters'
import type { MonthlyPL } from '@/types'

export default function HealthBanner({ data }: { data: MonthlyPL[] }) {
  const totalRev = data.reduce((s, m) => s + m.revenue, 0)
  const totalExp = data.reduce((s, m) => s + m.expenses, 0)
  const totalNet = totalRev - totalExp
  const ytdMargin = totalRev > 0 ? ((totalNet / totalRev) * 100) : 0

  let health: 'HEALTHY' | 'WATCH' | 'CRITICAL' = 'HEALTHY'
  let healthColor = '#34d399'
  let healthBg = 'rgba(52,211,153,0.08)'
  let healthBorder = 'rgba(52,211,153,0.15)'
  if (ytdMargin < 10) { health = 'WATCH'; healthColor = '#fbbf24'; healthBg = 'rgba(251,191,36,0.08)'; healthBorder = 'rgba(251,191,36,0.15)' }
  if (ytdMargin < 0) { health = 'CRITICAL'; healthColor = '#f87171'; healthBg = 'rgba(248,113,113,0.08)'; healthBorder = 'rgba(248,113,113,0.15)' }

  return (
    <div className="glass p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
      <div className="flex items-center gap-3">
        <span className="inline-flex px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-wider" style={{ background: healthBg, color: healthColor, border: `1px solid ${healthBorder}` }}>{health}</span>
        <span className="text-sm text-text-muted">YTD Financial Health</span>
      </div>
      <div className="flex flex-wrap gap-6">
        <div><p className="text-[0.625rem] font-bold text-text-muted uppercase tracking-wider">Revenue</p><p className="text-base font-bold text-semantic-green">{formatTaka(totalRev)}</p></div>
        <div><p className="text-[0.625rem] font-bold text-text-muted uppercase tracking-wider">Expenses</p><p className="text-base font-bold text-semantic-red">{formatTaka(totalExp)}</p></div>
        <div><p className="text-[0.625rem] font-bold text-text-muted uppercase tracking-wider">Net</p><p className={`text-base font-bold ${totalNet >= 0 ? 'text-semantic-green' : 'text-semantic-red'}`}>{formatTaka(totalNet)}</p></div>
        <div><p className="text-[0.625rem] font-bold text-text-muted uppercase tracking-wider">Margin</p><p className="text-base font-bold" style={{ color: healthColor }}>{ytdMargin.toFixed(1)}%</p></div>
      </div>
    </div>
  )
}
