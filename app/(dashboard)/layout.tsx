import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { LanguageToggle } from '@/components/layout/LanguageToggle'
import { ProfileProvider } from '@/lib/context/ProfileContext'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <ToastProvider>
        <div className="flex flex-col md:flex-row w-full min-h-[100dvh] bg-mesh">
          <Sidebar />
          <main className="flex-1 min-w-0 flex flex-col overflow-y-auto overflow-x-hidden pb-[72px] md:pb-0 w-full relative md:ml-[260px]">
            {/* Mobile Top Header */}
            <div className="md:hidden flex items-center justify-between px-5 py-3 bg-bg-void/50 backdrop-blur-md border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">Rajdarbar Ledger</span>
              <div className="w-24">
                <LanguageToggle />
              </div>
            </div>

            <div className="flex-1 w-full flex flex-col">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
          <MobileNav />
        </div>
      </ToastProvider>
    </ProfileProvider>
  )
}
