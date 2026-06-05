import { getSupabaseServer } from '@/lib/supabase/server'
import { SettingsTabs } from '@/components/settings/SettingsTabs'
import type { Profile } from '@/types'

export default async function SettingsPage() {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  let currentProfile: Profile | null = null
  let allProfiles: Profile[] = []
  let companyName = 'Rajdarbar Convention Hall'
  let eventTypes: string[] = ['Wedding', 'Birthday', 'Corporate', 'Meeting', 'Other']

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    currentProfile = profile as Profile | null

    if (currentProfile?.role === 'owner') {
      const { data: all } = await supabase.from('profiles').select('*').order('created_at')
      allProfiles = (all ?? []) as Profile[]
    }

    const { data: configs } = await supabase.from('app_config').select('*').in('key', ['company_name', 'event_types'])
    if (configs) {
      const nameConfig = configs.find(c => c.key === 'company_name')
      if (nameConfig?.value) companyName = nameConfig.value
      
      const typeConfig = configs.find(c => c.key === 'event_types')
      if (typeConfig?.value) {
        try {
          eventTypes = JSON.parse(typeConfig.value)
        } catch (e) {
          console.error("Failed to parse event_types")
        }
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="page-header"><div><h1>Settings</h1><p className="text-[0.8125rem] text-text-muted mt-0.5">Manage your account and team</p></div></div>
      <div className="flex-1 overflow-y-auto p-4 md:py-6 md:px-8">
        <SettingsTabs profile={currentProfile} allProfiles={allProfiles} companyName={companyName} initialEventTypes={eventTypes} />
      </div>
    </div>
  )
}
