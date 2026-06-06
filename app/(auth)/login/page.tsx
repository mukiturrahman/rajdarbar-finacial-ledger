import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
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

        <div className="anim-fade-in p-7 md:p-8 bg-bg-void border border-border">
          <h1 className="mb-2 text-2xl font-medium tracking-tight text-text-primary">Welcome back</h1>
          <p className="text-sm text-text-muted mb-6">Sign in to your financial dashboard</p>
          <LoginForm />
        </div>

        <p className="text-center text-[0.6875rem] text-text-muted mt-6">© {new Date().getFullYear()} Rajdarbar Convention Hall · Financial Ledger</p>
      </div>
    </div>
  )
}
