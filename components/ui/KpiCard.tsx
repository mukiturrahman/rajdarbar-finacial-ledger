'use client'
interface KpiCardProps {
  label: string
  value: string
  accent?: 'emerald' | 'gold' | 'red' | 'cyan' | 'default'
  sub?: string
  featured?: boolean
  className?: string
}

const accentColors: Record<string, { bg: string; border: string; text: string }> = {
  emerald: { bg: 'rgba(16,185,129,0.05)', border: 'rgba(16,185,129,0.2)', text: '#10b981' },
  gold: { bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.2)', text: '#f59e0b' },
  red: { bg: 'rgba(244,63,94,0.05)', border: 'rgba(244,63,94,0.2)', text: '#f43f5e' },
  cyan: { bg: 'rgba(14,165,233,0.05)', border: 'rgba(14,165,233,0.2)', text: '#0ea5e9' },
  default: { bg: 'var(--color-bg-elevated)', border: 'var(--color-border)', text: 'var(--color-text-primary)' },
}

export function KpiCard({ label, value, accent = 'default', sub, featured = false, className = '' }: KpiCardProps) {
  const colors = accentColors[accent] || accentColors.default

  return (
    <article
      className={`flex min-w-0 flex-col justify-between gap-2 rounded-2xl p-4 backdrop-blur-md transition-colors duration-200 md:p-5 ${className}`}
      style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
      aria-label={`${label}: ${value}`}
    >
      <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">{label}</p>
      <p
        className={`overflow-hidden text-ellipsis whitespace-nowrap font-mono font-semibold tabular-nums tracking-tight ${
          featured ? 'text-lg sm:text-xl md:text-3xl' : 'text-base sm:text-lg md:text-2xl'
        }`}
        style={{ color: colors.text }}
        title={value}
      >
        {value}
      </p>
      {sub && <p className="text-[0.75rem] text-text-muted mt-1">{sub}</p>}
    </article>
  )
}
