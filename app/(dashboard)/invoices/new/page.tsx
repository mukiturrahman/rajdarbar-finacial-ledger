import { getSupabaseServer } from '@/lib/supabase/server'
import { InvoiceForm } from '@/components/invoices/InvoiceForm'
import type { EventClient, Project, Invoice } from '@/types'

export default async function NewInvoicePage() {
  const supabase = await getSupabaseServer()
  const [{ data: eventsRaw }, { data: projectsRaw }, { data: lastInv }] = await Promise.all([
    supabase.from('events').select('*').order('name'),
    supabase.from('projects').select('*').order('name'),
    supabase.from('invoices').select('invoice_number').order('created_at', { ascending: false }).limit(1),
  ])
  const events = (eventsRaw ?? []) as EventClient[]
  const projects = (projectsRaw ?? []) as Project[]
  const lastNum = (lastInv as Invoice[] | null)?.[0]?.invoice_number
  let nextNum = 'RDC-INV-00001'
  if (lastNum) {
    const num = parseInt(lastNum.split('-').pop() || '0', 10)
    nextNum = `RDC-INV-${String(num + 1).padStart(5, '0')}`
  }
  return (
    <div className="flex flex-col h-full">
      <InvoiceForm events={events} projects={projects} nextInvoiceNumber={nextNum} />
    </div>
  )
}
