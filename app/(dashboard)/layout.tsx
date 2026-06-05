import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { ProfileProvider } from '@/lib/context/ProfileContext'
import { ToastProvider } from '@/components/ui/Toast'
import { Navbar } from '@/components/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <ToastProvider>
        <div className="flex flex-col md:flex-row w-full min-h-[100dvh] bg-mesh">
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-[72px] md:pb-0 w-full relative">
            <Navbar />
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          <MobileNav />
        </div>
      </ToastProvider>
    </ProfileProvider>
  )
}
