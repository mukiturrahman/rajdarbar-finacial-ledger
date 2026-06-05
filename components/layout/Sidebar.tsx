import { getSupabaseServer } from '@/lib/supabase/server'
import { SidebarLogo } from './SidebarLogo'
import { NavItem } from './NavItem'
import { SignOutButton } from './SignOutButton'
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
    <aside className="hidden md:flex flex-col w-[260px] min-h-[100dvh] border-r border-border" style={{ background: 'rgba(10,26,18,0.6)', backdropFilter: 'blur(20px)' }}>
      <div className="p-5 border-b border-border"><SidebarLogo /></div>
      {profile && (
        <div className="px-5 py-3 border-b border-border-subtle">
          <p className="text-sm font-semibold text-text-primary truncate">{profile.full_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[0.6875rem] text-text-muted truncate">{profile.email}</p>
            <Badge variant={profile.role} />
          </div>
        </div>
      )}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto hide-scrollbar">
        <p className="px-3 mb-2 text-[0.5625rem] font-bold text-text-muted uppercase tracking-[0.12em]">Finance</p>
        {navItems.map(item => (<NavItem key={item.href} {...item} />))}
      </nav>
      <div className="p-3 border-t border-border-subtle"><SignOutButton /></div>
    </aside>
  )
}
