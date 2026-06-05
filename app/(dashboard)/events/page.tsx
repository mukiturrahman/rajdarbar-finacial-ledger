import { getSupabaseServer } from '@/lib/supabase/server'
import { EventsView } from '@/components/events/EventsView'
import type { EventClient, Project, Transaction } from '@/types'

export default async function EventsPage() {
  const supabase = await getSupabaseServer()
  const [{ data: eventsRaw }, { data: projectsRaw }, { data: txnsRaw }] = await Promise.all([
    supabase.from('events').select('*').order('name'),
    supabase.from('projects').select('*').order('name'),
    supabase.from('transactions').select('*').is('deleted_at', null),
  ])
  return (
    <div className="flex flex-col h-full">
      <EventsView events={(eventsRaw ?? []) as EventClient[]} projects={(projectsRaw ?? []) as Project[]} transactions={(txnsRaw ?? []) as Transaction[]} />
    </div>
  )
}
