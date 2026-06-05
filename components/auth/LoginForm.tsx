'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { LogIn } from 'lucide-react'
export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    const supabase = getSupabaseClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('status').eq('id', user.id).single()
      if (profile?.status === 'pending') { await supabase.auth.signOut(); setError('Your account is not approved yet.'); setLoading(false); return }
      if (profile?.status === 'rejected') { await supabase.auth.signOut(); setError('Your account has been rejected.'); setLoading(false); return }
    }
    router.push('/'); router.refresh()
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-2 uppercase tracking-[0.08em]">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" placeholder="you@company.com" /></div>
      <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-2 uppercase tracking-[0.08em]">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-field" placeholder="••••••••" /></div>
      {error && (<div className="text-sm text-semantic-red font-medium px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>{error}</div>)}
      <button type="submit" disabled={loading} className="btn-primary w-full mt-1 !min-h-[48px] !text-[0.9375rem] disabled:opacity-50 disabled:cursor-not-allowed"><LogIn size={18} />{loading ? 'Signing in…' : 'Sign In'}</button>
      <p className="text-center text-sm text-text-muted">No account? <a href="/signup" className="font-semibold transition-colors cursor-pointer text-gradient hover:opacity-80">Create one</a></p>
    </form>
  )
}
