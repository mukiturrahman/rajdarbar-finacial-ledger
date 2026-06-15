'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ArrowLeftRight, Users, Receipt, TrendingUp, Settings } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

import { useProfile } from '@/lib/context/ProfileContext'

const items = [
  { labelKey: 'dashboard', href: '/', icon: LayoutDashboard },
  { labelKey: 'transactions', href: '/transactions', icon: ArrowLeftRight },
  { labelKey: 'events', href: '/events', icon: Users },
  { labelKey: 'receipts', href: '/receipts', icon: Receipt },
  { labelKey: 'monthlyPL', href: '/monthly-pl', icon: TrendingUp },
  { labelKey: 'settings', href: '/settings', icon: Settings },
]

export function MobileNav() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const profile = useProfile()
  
  const visibleItems = items.filter(item => {
    if (profile?.role === 'manager' && ['monthlyPL', 'settings'].includes(item.labelKey)) return false
    return true
  })

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 bg-bg-void border-t border-border">
      {visibleItems.map(({ labelKey, href, icon: Icon }) => { 
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href); 
        return (
          <Link key={href} href={href} className={`flex flex-col items-center gap-1 px-2 py-1.5 text-[0.5625rem] font-medium transition-colors min-w-[44px] ${isActive ? 'text-brand-primary' : 'text-text-muted hover:text-text-primary'}`}>
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />{t(labelKey as any)}
          </Link>
        ) 
      })}
    </nav>
  )
}
