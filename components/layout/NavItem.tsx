'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'
import { LayoutDashboard, ArrowLeftRight, Users, FileText, TrendingUp, Settings } from 'lucide-react'
const iconMap: Record<string, React.ElementType> = { home: LayoutDashboard, transactions: ArrowLeftRight, clients: Users, invoices: FileText, pl: TrendingUp, settings: Settings }
interface NavItemProps { labelKey: string; href: string; icon: string }
export function NavItem({ labelKey, href, icon }: NavItemProps) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
  const Icon = iconMap[icon] || LayoutDashboard
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-all duration-200 ${isActive ? 'text-white' : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'}`} style={isActive ? { background: 'linear-gradient(135deg, rgba(13,92,63,0.15), rgba(201,168,76,0.10))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.12)' } : undefined}>
      <Icon size={18} style={isActive ? { color: '#c9a84c' } : undefined} />{t(labelKey as any)}
    </Link>
  )
}
