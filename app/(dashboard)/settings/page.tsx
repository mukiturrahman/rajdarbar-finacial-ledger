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
  let waitstaffChargeRate = 500
  let waitstaffCostRate = 450

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    currentProfile = profile as Profile | null

    if (currentProfile?.role === 'owner') {
      const { data: all } = await supabase.from('profiles').select('*').order('created_at')
      allProfiles = (all ?? []) as Profile[]
    }

    const { data: configs } = await supabase.from('app_config').select('*').in('key', ['company_name', 'event_types', 'waitstaff_charge_rate', 'waitstaff_cost_rate'])
    if (configs) {
      const nameConfig = configs.find(c => c.key === 'company_name')
      if (nameConfig?.value) companyName = nameConfig.value
      
      const typeConfig = configs.find(c => c.key === 'event_types')
      if (typeConfig?.value) {
        try {
          eventTypes = JSON.parse(typeConfig.value)
        } catch {
          // ignore
        }
      }

      const chargeConfig = configs.find(c => c.key === 'waitstaff_charge_rate')
      if (chargeConfig?.value) waitstaffChargeRate = Number(chargeConfig.value)

      const costConfig = configs.find(c => c.key === 'waitstaff_cost_rate')
      if (costConfig?.value) waitstaffCostRate = Number(costConfig.value)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="page-header !block">
        <div className="mx-auto w-full max-w-[1440px]">
          <h1>Settings</h1>
          <p className="mt-0.5 text-[0.8125rem] text-text-muted">Manage venue operations, pricing, and team access</p>
        </div>
      </header>
      <div className="flex-1 px-5 py-5 md:px-8 md:py-6">
        <div className="mx-auto w-full max-w-[1440px]">
          <SettingsTabs
            profile={currentProfile}
            allProfiles={allProfiles}
            companyName={companyName}
            initialEventTypes={eventTypes}
            initialWaitstaffChargeRate={waitstaffChargeRate}
            initialWaitstaffCostRate={waitstaffCostRate}
          />
        </div>
      </div>
    </div>
  )
}
