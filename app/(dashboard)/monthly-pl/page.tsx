import { getSupabaseServer } from '@/lib/supabase/server'
import { computeMonthlyPL } from '@/lib/utils/calculations'
import HealthBanner from '@/components/monthly-pl/HealthBanner'
import MonthlyTable from '@/components/monthly-pl/MonthlyTable'
import type { Transaction, EventClient } from '@/types'

export default async function MonthlyPLPage() {
  const supabase = await getSupabaseServer()
  const [
    { data: txnsRaw },
    { data: eventsRaw }
  ] = await Promise.all([
    supabase.from('transactions').select('*').is('deleted_at', null).order('date', { ascending: false }),
    supabase.from('events').select('*')
  ])
  const txns = (txnsRaw ?? []) as Transaction[]
  const events = (eventsRaw ?? []) as EventClient[]
  const monthlyData = computeMonthlyPL(txns, events)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <div>
          <h1>Monthly P&amp;L</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>Revenue, expenses and profit by month</p>
        </div>
      </div>
      <div className="p-4 md:py-6 md:px-8 flex-1 overflow-y-auto flex flex-col gap-4">
        <HealthBanner data={monthlyData} />
        <MonthlyTable data={monthlyData} />
      </div>
    </div>
  )
}
