import { getSupabaseServer } from '@/lib/supabase/server'
import { TransactionTable } from '@/components/transactions/TransactionTable'
import type { Transaction, MasterConfig, EventClient, Project } from '@/types'

export default async function TransactionsPage() {
  const supabase = await getSupabaseServer()
  const [{ data: txnsRaw }, { data: configRows }, { data: eventsRaw }, { data: projectsRaw }] = await Promise.all([
    supabase.from('transactions').select('*').is('deleted_at', null).order('date', { ascending: false }),
    supabase.from('master_config').select('*').limit(1).single(),
    supabase.from('events').select('*').order('name'),
    supabase.from('projects').select('*').order('name')
  ])
  const txns = (txnsRaw ?? []) as Transaction[]
  const config = configRows ?? { categories: [], methods: [], statuses: [], events: [] }
  const events = (eventsRaw ?? []) as EventClient[]
  const projects = (projectsRaw ?? []) as Project[]

  return (
    <div className="flex flex-col h-full">
      <TransactionTable initialTxns={txns} config={config as MasterConfig} events={events} projects={projects} />
    </div>
  )
}
