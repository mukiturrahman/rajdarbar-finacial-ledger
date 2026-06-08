import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { ProfileProvider } from '@/lib/context/ProfileContext'
import { ToastProvider } from '@/components/ui/Toast'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <ToastProvider>
        <div className="flex flex-col md:flex-row w-full min-h-[100dvh] bg-mesh">
          <Sidebar />
          <main className="flex-1 min-w-0 flex flex-col overflow-y-auto overflow-x-hidden pb-[72px] md:pb-0 w-full relative md:ml-[260px]">
            <div className="flex-1 w-full flex flex-col">
              {children}
            </div>
          </main>
          <MobileNav />
        </div>
      </ToastProvider>
    </ProfileProvider>
  )
}
