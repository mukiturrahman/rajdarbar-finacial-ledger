'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSupabaseServer } from '@/lib/supabase/server'

const UserIdSchema = z.string().uuid()

export async function removeTeamMemberAction(userId: unknown) {
  const parsedUserId = UserIdSchema.safeParse(userId)
  if (!parsedUserId.success) {
    return { success: false, error: 'Invalid team member' }
  }

  const supabase = await getSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Unauthorized: Not authenticated' }
  }

  if (user.id === parsedUserId.data) {
    return { success: false, error: 'You cannot remove your current account' }
  }

  const { data: currentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (profileError || currentProfile?.role !== 'owner' || currentProfile.status !== 'active') {
    return { success: false, error: 'Only an active owner can remove team members' }
  }

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', parsedUserId.data)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/settings')
  return { success: true }
}
