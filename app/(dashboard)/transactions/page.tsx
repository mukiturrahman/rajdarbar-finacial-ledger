import { getSupabaseServer } from '@/lib/supabase/server'
import { TransactionTable } from '@/components/transactions/TransactionTable'
import type { Transaction, MasterConfig, EventClient, Project } from '@/types'

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const search = params.search || ''
  const typeFilter = params.type || 'All'
  const statusFilter = params.status || 'All'
  const monthFilter = params.month || ''
  const PER_PAGE = 15

  const supabase = await getSupabaseServer()
  let query = supabase.from('transactions').select('*', { count: 'exact' }).is('deleted_at', null)
  
  if (search) query = query.ilike('description', `%${search}%`)
  if (typeFilter !== 'All') query = query.eq('type', typeFilter)
  if (statusFilter !== 'All') query = query.eq('status', statusFilter)
  
  if (monthFilter) {
    const startDate = `${monthFilter}-01`
    const nextMonthDate = new Date(startDate)
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1)
    const endDate = nextMonthDate.toISOString().split('T')[0]
    query = query.gte('date', startDate).lt('date', endDate)
  }
  
  const [
    { data: txnsRaw, count },
    { data: configRows },
    { data: eventsRaw },
    { data: projectsRaw },
    { data: dateRows }
  ] = await Promise.all([
    query.order('date', { ascending: false }).order('created_at', { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1),
    supabase.from('master_config').select('*').limit(1).single(),
    supabase.from('events').select('*').order('name'),
    supabase.from('projects').select('*').order('name'),
    supabase.from('transactions').select('date').is('deleted_at', null)
  ])

  const txns = (txnsRaw ?? []) as Transaction[]
  const totalCount = count ?? 0
  const config = configRows ?? { categories: [], methods: [], statuses: [], events: [] }
  const events = (eventsRaw ?? []) as EventClient[]
  const projects = (projectsRaw ?? []) as Project[]
  
  const availableMonths = Array.from(new Set(dateRows?.map(r => r.date?.substring(0, 7)).filter(Boolean) as string[])).sort().reverse()

  return (
    <div className="flex flex-col h-full">
      <TransactionTable 
        initialTxns={txns} 
        totalCount={totalCount} 
        currentPage={page}
        currentSearch={search}
        currentType={typeFilter}
        currentStatus={statusFilter}
        currentMonth={monthFilter}
        availableMonths={availableMonths}
        config={config as MasterConfig} 
        events={events} 
        projects={projects} 
      />
    </div>
  )
}
