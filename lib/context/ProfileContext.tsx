'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const ProfileContext = createContext<Profile | null>(null)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (!user) return
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }: { data: unknown }) => { if (data) setProfile(data as Profile) })
    })
  }, [])

  return (
    <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
