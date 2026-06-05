'use client'
interface KpiCardProps { label: string; value: string; accent?: 'emerald' | 'gold' | 'red' | 'cyan' | 'default'; sub?: string }
const accentColors: Record<string, { border: string; glow: string; text: string }> = {
  emerald: { border: 'rgba(13,92,63,0.3)', glow: '0 0 30px rgba(13,92,63,0.08)', text: '#34d399' },
  gold: { border: 'rgba(201,168,76,0.3)', glow: '0 0 30px rgba(201,168,76,0.08)', text: '#c9a84c' },
  red: { border: 'rgba(248,113,113,0.3)', glow: '0 0 30px rgba(248,113,113,0.08)', text: '#f87171' },
  cyan: { border: 'rgba(34,211,238,0.3)', glow: '0 0 30px rgba(34,211,238,0.08)', text: '#22d3ee' },
  default: { border: 'rgba(255,255,255,0.08)', glow: 'none', text: '#cbd5e1' },
}
export function KpiCard({ label, value, accent = 'default', sub }: KpiCardProps) {
  const colors = accentColors[accent]
  return (<div className="glass-sm p-4 flex flex-col gap-1 transition-all duration-300 hover:scale-[1.02] cursor-default" style={{ borderColor: colors.border, boxShadow: colors.glow }}><p className="text-[0.625rem] font-bold text-text-muted uppercase tracking-[0.08em]">{label}</p><p className="text-xl font-bold tracking-tight" style={{ color: colors.text }}>{value}</p>{sub && <p className="text-[0.6875rem] text-text-muted">{sub}</p>}</div>)
}
