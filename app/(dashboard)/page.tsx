import { getSupabaseServer } from '@/lib/supabase/server'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { ActiveEventsPanel } from '@/components/dashboard/ActiveEventsPanel'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { UpcomingEventsTracker } from '@/components/dashboard/UpcomingEventsTracker'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { computeKPIs, computeEventProfit } from '@/lib/utils/calculations'
import type { Transaction, EventClient } from '@/types'

export default async function DashboardPage() {
  const supabase = await getSupabaseServer()
  const [
    { data: txnsRaw },
    { data: eventsRaw },
    { count: projectsCount },
  ] = await Promise.all([
    supabase.from('transactions').select('*').is('deleted_at', null).order('date', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('events').select('id, name, event_type, party_name, booking_date, event_date, advance_payment, total_amount, created_at').order('event_date', { ascending: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
  ])
  const txns = (txnsRaw ?? []) as Transaction[]
  const allEvents = (eventsRaw ?? []) as EventClient[]

  // Filter upcoming events for UI panel/tracker
  const todayStr = new Date().toISOString().split('T')[0]
  const upcomingEvents = allEvents.filter(e => e.event_date && e.event_date >= todayStr)

  // Ensure we pass the required fields to events
  const events = upcomingEvents.map(e => ({
    ...e,
    revenue: computeEventProfit(e, txns).revenue
  }))
  const activeProjectsCount = projectsCount ?? 0

  const kpis = computeKPIs(txns, activeProjectsCount, allEvents)
  const eventProfits = events.map(e => computeEventProfit(e, txns))
  const recent = txns.slice(0, 6)

  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }
  const isManager = profile?.role === 'manager'

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader />
      <div className="flex-1 overflow-y-auto p-4 md:py-6 md:px-8 space-y-6">
        <UpcomingEventsTracker events={events} />
        
        {!isManager && (
          <>
            <KpiGrid kpis={kpis} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <ActiveEventsPanel events={eventProfits} />
              <RecentTransactions transactions={recent} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
