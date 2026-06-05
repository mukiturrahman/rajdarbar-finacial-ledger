import 'server-only'
import { getSupabaseServer } from '@/lib/supabase/server'

export async function requireMutationAccess() {
  const supabase = await getSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized: Not authenticated')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, status')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Unauthorized: Profile not found')
  }

  if (profile.status !== 'active') {
    throw new Error('Unauthorized: Account is not active')
  }

  if (!['owner', 'editor'].includes(profile.role)) {
    throw new Error('Forbidden: Insufficient permissions. Only owners and editors can perform mutations.')
  }

  return { userId: user.id, role: profile.role as 'owner' | 'editor' }
}
