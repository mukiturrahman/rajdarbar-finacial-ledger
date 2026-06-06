const variants: Record<string, { bg: string; color: string; border: string }> = {
  received: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'rgba(16,185,129,0.2)' }, 
  pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' }, 
  paid: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'rgba(16,185,129,0.2)' }, 
  rejected: { bg: 'rgba(244,63,94,0.15)', color: '#f43f5e', border: 'rgba(244,63,94,0.2)' }, 
  'on hold': { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)' }, 
  active: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'rgba(16,185,129,0.2)' }, 
  paused: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)' }, 
  owner: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: 'rgba(59,130,246,0.2)' }, 
  editor: { bg: 'rgba(148,163,184,0.15)', color: '#cbd5e1', border: 'rgba(148,163,184,0.2)' }, 
  viewer: { bg: 'rgba(71,85,105,0.15)', color: '#94a3b8', border: 'rgba(71,85,105,0.2)' },
}
export function Badge({ variant }: { variant: string }) {
  const key = variant.toLowerCase()
  const style = variants[key] || variants.pending
  return (
    <span 
      className="inline-flex px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider rounded-md" 
      style={{ backgroundColor: style.bg, border: `1px solid ${style.border}`, color: style.color }}
    >
      {variant}
    </span>
  )
}
