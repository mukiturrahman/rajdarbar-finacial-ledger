'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'
import { LayoutDashboard, ArrowLeftRight, Users, Receipt, TrendingUp, Settings } from 'lucide-react'
const iconMap: Record<string, React.ElementType> = { home: LayoutDashboard, transactions: ArrowLeftRight, clients: Users, invoices: Receipt, pl: TrendingUp, settings: Settings }
interface NavItemProps { labelKey: string; href: string; icon: string }
export function NavItem({ labelKey, href, icon }: NavItemProps) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
  const Icon = iconMap[icon] || LayoutDashboard
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg ${isActive ? 'bg-brand-primary/15 text-brand-primary' : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'}`}
    >
      <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />{t(labelKey as any)}
    </Link>
  )
}
