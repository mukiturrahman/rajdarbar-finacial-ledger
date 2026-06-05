const variants: Record<string, { bg: string; color: string }> = {
  received: { bg: 'rgba(52,211,153,0.10)', color: '#34d399' }, pending: { bg: 'rgba(251,191,36,0.10)', color: '#fbbf24' }, paid: { bg: 'rgba(52,211,153,0.10)', color: '#34d399' }, rejected: { bg: 'rgba(248,113,113,0.10)', color: '#f87171' }, 'on hold': { bg: 'rgba(148,163,184,0.10)', color: '#94a3b8' }, active: { bg: 'rgba(52,211,153,0.10)', color: '#34d399' }, paused: { bg: 'rgba(148,163,184,0.10)', color: '#94a3b8' }, owner: { bg: 'rgba(201,168,76,0.12)', color: '#c9a84c' }, editor: { bg: 'rgba(165,180,252,0.10)', color: '#a5b4fc' }, viewer: { bg: 'rgba(148,163,184,0.10)', color: '#94a3b8' },
}
export function Badge({ variant }: { variant: string }) {
  const key = variant.toLowerCase()
  const style = variants[key] || variants.pending
  return (<span className="inline-flex px-2 py-0.5 rounded-md text-[0.5625rem] font-bold uppercase tracking-[0.06em]" style={{ backgroundColor: style.bg, color: style.color }}>{variant}</span>)
}
