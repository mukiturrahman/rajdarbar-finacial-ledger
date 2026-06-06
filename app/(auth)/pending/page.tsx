import { PendingScreen } from '@/components/auth/PendingScreen'

export default function PendingPage() {
  return (
    <div className="w-full min-h-[100dvh] flex items-center justify-center p-6 bg-bg-base">
      <div className="w-full max-w-[420px] relative z-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center text-white bg-brand-primary rounded-xl font-bold text-lg shadow-glow-brand">R</div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary tracking-tight uppercase">Rajdarbar</h2>
              <p className="text-[0.625rem] text-text-muted tracking-widest uppercase">Convention Hall</p>
            </div>
          </div>
        </div>

        <div className="anim-fade-in overflow-hidden bg-bg-void border border-border">
          <div className="px-4 py-3 text-[0.6rem] font-medium uppercase tracking-widest font-mono border-b border-border text-text-secondary">
            Awaiting Approval
          </div>
          <PendingScreen />
        </div>
      </div>
    </div>
  )
}
