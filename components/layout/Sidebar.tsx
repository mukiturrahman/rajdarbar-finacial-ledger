import { getSupabaseServer } from '@/lib/supabase/server'
import { SidebarLogo } from './SidebarLogo'
import { NavItem } from './NavItem'
import { SignOutButton } from './SignOutButton'
import { LanguageToggle } from './LanguageToggle'
import { Badge } from '@/components/ui/Badge'
import type { Profile } from '@/types'

const navItems = [
  { labelKey: 'dashboard', href: '/', icon: 'home' },
  { labelKey: 'transactions', href: '/transactions', icon: 'transactions' },
  { labelKey: 'events', href: '/events', icon: 'clients' },
  { labelKey: 'invoices', href: '/invoices', icon: 'invoices' },
  { labelKey: 'monthlyPL', href: '/monthly-pl', icon: 'pl' },
  { labelKey: 'settings', href: '/settings', icon: 'settings' },
]

export async function Sidebar() {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data as Profile | null
  }
  return (
    <aside className="hidden md:flex flex-col w-[260px] min-h-[100dvh] border-r border-border bg-bg-void fixed inset-y-0 left-0 z-50">
      <div className="p-5 border-b border-border"><SidebarLogo /></div>
      {profile && (
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-medium text-text-primary truncate">{profile.full_name}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[0.6875rem] text-text-muted truncate mr-2">{profile.email}</p>
            <Badge variant={profile.role} />
          </div>
        </div>
      )}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto hide-scrollbar">
        <p className="px-3 mb-3 text-[0.5625rem] font-bold text-text-muted uppercase tracking-widest">Finance</p>
        {navItems.filter(item => {
          if (profile?.role === 'manager' && (item.labelKey === 'monthlyPL' || item.labelKey === 'settings')) return false;
          return true;
        }).map(item => (<NavItem key={item.href} {...item} />))}
      </nav>
      <div className="p-4 border-t border-border flex flex-col gap-4">
        <LanguageToggle />
        <SignOutButton />
      </div>
    </aside>
  )
}
