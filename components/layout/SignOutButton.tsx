'use client'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

export function SignOutButton() {
  const router = useRouter()
  const { t } = useLanguage()
  return (<button onClick={async () => { const supabase = getSupabaseClient(); await supabase.auth.signOut(); router.push('/login'); router.refresh() }} className="btn-ghost w-full justify-start text-text-muted hover:text-semantic-red"><LogOut size={16} />{t("signOut")}</button>)
}
