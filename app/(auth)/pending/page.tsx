import { PendingScreen } from '@/components/auth/PendingScreen'

export default function PendingPage() {
  return (
    <div className="w-full min-h-[100dvh] flex items-center justify-center p-6 relative overflow-hidden" style={{ background: '#060f0b' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #c9a84c, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg" style={{ background: 'linear-gradient(135deg, #0d5c3f, #c9a84c)' }}>R</div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Rajdarbar</h2>
              <p className="text-[0.625rem] text-text-muted tracking-wider uppercase">Convention Hall</p>
            </div>
          </div>
        </div>

        <div className="anim-fade-in overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
          <div className="px-4 py-2 text-[0.6rem] font-bold uppercase tracking-[0.1em] font-mono" style={{ background: 'rgba(201,168,76,0.08)', borderBottom: '1px solid rgba(201,168,76,0.12)', color: '#c9a84c' }}>
            Awaiting Approval
          </div>
          <PendingScreen />
        </div>
      </div>
    </div>
  )
}
