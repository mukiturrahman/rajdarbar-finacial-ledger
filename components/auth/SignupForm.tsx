'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { UserPlus } from 'lucide-react'
export function SignupForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/pending')
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-2 uppercase tracking-[0.08em]">Full Name</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="input-field" placeholder="Your full name" /></div>
      <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-2 uppercase tracking-[0.08em]">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" placeholder="you@company.com" /></div>
      <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-2 uppercase tracking-[0.08em]">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="input-field" placeholder="Min 8 characters" /></div>
      {error && (<div className="text-sm text-semantic-red font-medium px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>{error}</div>)}
      <button type="submit" disabled={loading} className="btn-primary w-full mt-1 !min-h-[48px] !text-[0.9375rem] disabled:opacity-50 disabled:cursor-not-allowed"><UserPlus size={18} />{loading ? 'Creating account…' : 'Create Account'}</button>
      <p className="text-center text-sm text-text-muted">Already have an account? <a href="/login" className="font-semibold transition-colors cursor-pointer text-gradient hover:opacity-80">Sign in</a></p>
    </form>
  )
}
