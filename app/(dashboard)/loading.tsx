import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="flex-1 h-full w-full flex flex-col items-center justify-center min-h-[60vh]">
      <div className="glass p-6 flex flex-col items-center gap-4 anim-fade-in">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: 'var(--color-brand-gold)' }}
        />
        <div className="text-sm font-medium text-text-secondary animate-pulse tracking-wide">
          Loading ledger data...
        </div>
      </div>
    </div>
  )
}
