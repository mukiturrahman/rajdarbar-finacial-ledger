'use client'
interface KpiCardProps { label: string; value: string; accent?: 'emerald' | 'gold' | 'red' | 'cyan' | 'default'; sub?: string }
const accentColors: Record<string, { bg: string; border: string; text: string }> = {
  emerald: { bg: 'rgba(16,185,129,0.05)', border: 'rgba(16,185,129,0.2)', text: '#10b981' },
  gold: { bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.2)', text: '#f59e0b' },
  red: { bg: 'rgba(244,63,94,0.05)', border: 'rgba(244,63,94,0.2)', text: '#f43f5e' },
  cyan: { bg: 'rgba(14,165,233,0.05)', border: 'rgba(14,165,233,0.2)', text: '#0ea5e9' },
  default: { bg: 'var(--theme-bg-elevated)', border: 'var(--theme-border)', text: 'var(--theme-text-primary)' },
}
export function KpiCard({ label, value, accent = 'default', sub }: KpiCardProps) {
  const colors = accentColors[accent] || accentColors.default
  return (
    <div className="p-5 flex flex-col gap-1.5 transition-all duration-300 hover:-translate-y-1 cursor-default rounded-2xl backdrop-blur-md" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
      <p className="text-[0.6875rem] font-semibold text-text-muted uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-semibold font-mono tabular-nums tracking-tight" style={{ color: colors.text }}>{value}</p>
      {sub && <p className="text-[0.75rem] text-text-muted mt-1">{sub}</p>}
    </div>
  )
}
