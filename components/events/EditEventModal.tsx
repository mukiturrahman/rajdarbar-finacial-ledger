'use client'
import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { Loader2, Save } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import { formatTaka } from '@/lib/utils/formatters'
import type { EventClient } from '@/types'
import { getSupabaseClient } from '@/lib/supabase/client'

interface Props {
  open: boolean
  onClose: () => void
  event: EventClient | null
  onUpdate?: (updatedEvent: EventClient) => void
}

function getInitialForm(event: EventClient | null) {
  if (!event) return {
    name: '', party_name: '', event_type: '', booking_date: '',
    event_date: '', guests_count: '' as number | string,
    total_amount: '' as number | string, advance_payment: '' as number | string,
  }
  return {
    name: event.name || '',
    party_name: event.party_name || '',
    event_type: event.event_type || '',
    booking_date: event.booking_date || '',
    event_date: event.event_date || '',
    guests_count: event.guests_count ?? '' as number | string,
    total_amount: event.total_amount ?? '' as number | string,
    advance_payment: event.advance_payment ?? '' as number | string,
  }
}

export function EditEventModal({ open, onClose, event, onUpdate }: Props) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(getInitialForm(event))

  // Re-initialize form when the modal opens for a different event
  const eventId = event?.id
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { setForm(getInitialForm(event)) }, [eventId, open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Compute remaining as derived state — no effect needed
  const remainingAmount = useMemo(() => {
    const total = Number(form.total_amount) || 0
    const advance = Number(form.advance_payment) || 0
    return total - advance
  }, [form.total_amount, form.advance_payment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return
    setSaving(true)

    const payload = {
      name: form.name,
      party_name: form.party_name,
      event_type: form.event_type,
      booking_date: form.booking_date,
      event_date: form.event_date,
      guests_count: Number(form.guests_count) || 0,
      total_amount: Number(form.total_amount) || 0,
      advance_payment: Number(form.advance_payment) || 0,
      remaining_amount: remainingAmount,
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', event.id)
      .select()
      .single()

    setSaving(false)

    if (error) {
      toast(error.message, 'error')
    } else {
      toast('Event updated successfully')
      if (onUpdate && data) {
        onUpdate(data)
      }
      onClose()
      router.refresh()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Event Details" footer={
      <>
        <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
        <button type="submit" form="edit-event-form" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Update
        </button>
      </>
    }>
      <form id="edit-event-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("eventName")}</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="input-field" />
          </div>
          <div>
            <label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("partyName")}</label>
            <input type="text" value={form.party_name} onChange={e => setForm({...form, party_name: e.target.value})} className="input-field" />
          </div>
          <div>
            <label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("eventType")}</label>
            <input type="text" value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})} className="input-field" />
          </div>
          <div>
            <label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("guestsCount")}</label>
            <input type="number" value={form.guests_count} onChange={e => setForm({...form, guests_count: e.target.value === "" ? "" : Number(e.target.value)})} className="input-field" />
          </div>
          <div>
            <label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("bookingDate")}</label>
            <input type="date" value={form.booking_date} onChange={e => setForm({...form, booking_date: e.target.value})} className="input-field" />
          </div>
          <div>
            <label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("eventDate")}</label>
            <input type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} className="input-field" />
          </div>
          <div className="md:col-span-2 grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("totalAmount")} (৳)</label>
              <input type="number" value={form.total_amount} onChange={e => setForm({...form, total_amount: e.target.value === "" ? "" : Number(e.target.value)})} className="input-field" />
            </div>
            <div>
              <label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("advancePayment")} (৳)</label>
              <input type="number" value={form.advance_payment} onChange={e => setForm({...form, advance_payment: e.target.value === "" ? "" : Number(e.target.value)})} className="input-field" />
            </div>
            <div>
              <label className="block text-[0.6875rem] font-bold text-brand-gold mb-1.5 uppercase tracking-[0.08em]">{t("remainingBalance")} (৳)</label>
              <p className="text-lg font-bold font-mono text-brand-gold">{formatTaka(remainingAmount)}</p>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}
