'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ArrowLeftRight, Users, FileText, TrendingUp, Settings } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

const items = [
  { labelKey: 'dashboard', href: '/', icon: LayoutDashboard },
  { labelKey: 'transactions', href: '/transactions', icon: ArrowLeftRight },
  { labelKey: 'events', href: '/events', icon: Users },
  { labelKey: 'invoices', href: '/invoices', icon: FileText },
  { labelKey: 'monthlyPL', href: '/monthly-pl', icon: TrendingUp },
  { labelKey: 'settings', href: '/settings', icon: Settings },
]

export function MobileNav() {
  const { t } = useLanguage()
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2" style={{ background: 'rgba(10,26,18,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {items.map(({ labelKey, href, icon: Icon }) => { 
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href); 
        return (
          <Link key={href} href={href} className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg text-[0.5625rem] font-medium transition-colors min-w-[44px] ${isActive ? 'text-brand-gold' : 'text-text-muted'}`}>
            <Icon size={20} />{t(labelKey as any)}
          </Link>
        ) 
      })}
    </nav>
  )
}
