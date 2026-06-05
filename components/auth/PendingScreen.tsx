'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Clock, ArrowLeft } from 'lucide-react'
export function PendingScreen() {
  const router = useRouter()
  useEffect(() => {
    const interval = setInterval(async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('status').eq('id', user.id).single()
      if (data?.status === 'active') { router.push('/'); router.refresh() }
      if (data?.status === 'rejected') { router.push('/login?error=rejected') }
    }, 5000)
    return () => clearInterval(interval)
  }, [router])
  return (
    <div className="text-center py-8 px-4">
      <Clock size={40} className="mx-auto mb-4 opacity-60" style={{ color: '#c9a84c' }} />
      <h2 className="text-lg font-bold text-text-primary mb-2">Account Pending Approval</h2>
      <p className="text-[0.8125rem] text-text-muted leading-relaxed font-mono">The Owner will assign your role shortly.<br />This page refreshes automatically.</p>
      <div className="inline-flex items-center gap-2 mt-5 px-4 py-1.5 rounded-lg text-[0.6875rem] font-bold font-mono" style={{ background: 'rgba(201,168,76,0.10)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.18)' }}>Status: Pending Review</div>
      <div className="mt-6"><a href="/login" className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold transition-colors cursor-pointer text-text-muted hover:text-text-primary"><ArrowLeft size={14} />Return to Login</a></div>
    </div>
  )
}
