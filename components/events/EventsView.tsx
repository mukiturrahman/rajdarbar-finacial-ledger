'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EventCard } from './EventCard'
import { EditEventModal } from './EditEventModal'
import { EventDetailModal } from './EventDetailModal'
import { useToast } from '@/components/ui/Toast'
import { useProfile } from '@/lib/context/ProfileContext'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Plus } from 'lucide-react'
import { computeEventProfit } from '@/lib/utils/calculations'
import type { EventClient, Transaction } from '@/types'

interface Props { events: EventClient[]; transactions: Transaction[] }

export function EventsView({ events: initialEvents, transactions }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const profile = useProfile()
  const canMutate = !!(profile && ['owner', 'editor'].includes(profile.role))
  const [events, setEvents] = useState(initialEvents)
  const [editingEvent, setEditingEvent] = useState<EventClient | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventClient | null>(null)

  const deleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return
    const supabase = getSupabaseClient()
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) { toast(error.message, 'error'); return }
    setEvents(events.filter(e => e.id !== id))
    toast('Event deleted')
  }

  const paidInFull = async (id: string) => {
    const ev = events.find(e => e.id === id)
    if (!ev) return
    const remaining = ev.remaining_amount ?? 0
    if (remaining <= 0) { toast('This event is already fully paid', 'error'); return }

    if (!window.confirm(`Mark as Paid in Full? This will log ৳${remaining.toLocaleString()} as received income.`)) return

    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast('Not authenticated', 'error'); return }

    const today = new Date().toISOString().split('T')[0]
    const { error: txnError } = await supabase.from('transactions').insert({
      date: today,
      description: `Final Payment: ${ev.name}`,
      event_id: ev.id,
      type: 'Income',
      amount: remaining,
      method: 'Cash',
      status: 'Received',
      created_by: user.id,
    })

    if (txnError) { toast(txnError.message, 'error'); return }

    const totalAmount = ev.total_amount ?? 0
    const { data: updatedEvent, error: evError } = await supabase
      .from('events')
      .update({
        advance_payment: totalAmount,
        remaining_amount: 0,
      })
      .eq('id', ev.id)
      .select()
      .single()

    if (evError) { toast(evError.message, 'error'); return }

    if (updatedEvent) {
      setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e))
    }
    toast('Event marked as Paid in Full')
    router.refresh()
  }

  // Get transactions & profit for the selected event
  const selectedEventTxns = selectedEvent
    ? transactions.filter(t => t.event_id === selectedEvent.id)
    : []
  const selectedEventProfit = selectedEvent
    ? computeEventProfit(selectedEvent, transactions)
    : null

  return (
    <>
      <div className="page-header">
        <div><h1>Events</h1><p className="text-[0.8125rem] text-text-muted mt-0.5">{events.length} events registered</p></div>
        {canMutate && (
          <div className="flex gap-2">
            <Link href="/events/new" className="btn-primary"><Plus size={16} />Add Event</Link>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:py-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.length === 0 ? (<div className="col-span-full text-center py-12 text-text-muted">No events yet</div>) :
            events.map(ev => {
              const profit = computeEventProfit(ev, transactions)
              return (
                <EventCard
                  key={ev.id}
                  event={ev}
                  profit={profit}
                  onDelete={deleteEvent}
                  onEdit={(id) => setEditingEvent(events.find(e => e.id === id) || null)}
                  onPaidInFull={paidInFull}
                  onClick={(id) => setSelectedEvent(events.find(e => e.id === id) || null)}
                  canMutate={canMutate}
                />
              )
            })}
        </div>
      </div>

      <EditEventModal open={!!editingEvent} onClose={() => setEditingEvent(null)} event={editingEvent} onUpdate={(updated) => setEvents(events.map(e => e.id === updated.id ? updated : e))} />

      <EventDetailModal
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        profit={selectedEventProfit}
        transactions={selectedEventTxns}
      />
    </>
  )
}
