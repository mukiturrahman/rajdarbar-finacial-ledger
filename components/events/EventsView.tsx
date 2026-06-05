'use client'
import { useState } from 'react'
import { EventCard } from './EventCard'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useProfile } from '@/lib/context/ProfileContext'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Plus, Save, Loader2 } from 'lucide-react'
import { computeEventProfit } from '@/lib/utils/calculations'
import type { EventClient, Project, Transaction } from '@/types'

interface Props { events: EventClient[]; projects: Project[]; transactions: Transaction[] }

export function EventsView({ events: initialEvents, projects: initialProjects, transactions }: Props) {
  const { toast } = useToast()
  const profile = useProfile()
  const canMutate = profile && ['owner', 'editor'].includes(profile.role)
  const [events, setEvents] = useState(initialEvents)
  const [projects, setProjects] = useState(initialProjects)
  const [modalOpen, setModalOpen] = useState(false)
  const [projModalOpen, setProjModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newProjName, setNewProjName] = useState('')
  const [selectedEventId, setSelectedEventId] = useState('')
  const [saving, setSaving] = useState(false)

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newName.trim()) return; setSaving(true)
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('events').insert({ name: newName.trim() }).select().single()
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    setEvents([...events, data as EventClient]); setNewName(''); setModalOpen(false); toast('Event created')
  }

  const deleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This will also delete all related projects.')) return
    const supabase = getSupabaseClient()
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) { toast(error.message, 'error'); return }
    setEvents(events.filter(e => e.id !== id))
    toast('Event deleted')
  }

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newProjName.trim() || !selectedEventId) return; setSaving(true)
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('projects').insert({ name: newProjName.trim(), event_id: selectedEventId }).select().single()
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    setProjects([...projects, data as Project]); setNewProjName(''); setProjModalOpen(false); toast('Project created')
  }

  return (
    <>
      <div className="page-header">
        <div><h1>Events</h1><p className="text-[0.8125rem] text-text-muted mt-0.5">{events.length} events registered</p></div>
        {canMutate && (
          <div className="flex gap-2">
            <button onClick={() => setProjModalOpen(true)} className="btn-ghost border border-border">Add Project</button>
            <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={16} />Add Event</button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:py-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.length === 0 ? (<div className="col-span-full text-center py-12 text-text-muted">No events yet</div>) :
            events.map(ev => {
              const evProjects = projects.filter(p => p.event_id === ev.id)
              const profit = computeEventProfit(ev, transactions)
              return <EventCard key={ev.id} event={ev} projects={evProjects} profit={profit} onDelete={deleteEvent} canMutate={canMutate} />
            })}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Event" footer={
        <><button onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
        <button form="ev-form" type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}Save</button></>
      }>
        <form id="ev-form" onSubmit={addEvent}>
          <label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">Event Name</label>
          <input value={newName} onChange={e => setNewName(e.target.value)} required className="input-field" placeholder="e.g. Wedding Reception" />
        </form>
      </Modal>

      <Modal open={projModalOpen} onClose={() => setProjModalOpen(false)} title="Add Project" footer={
        <><button onClick={() => setProjModalOpen(false)} className="btn-ghost">Cancel</button>
        <button form="pj-form" type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}Save</button></>
      }>
        <form id="pj-form" onSubmit={addProject} className="flex flex-col gap-4">
          <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">Event</label>
            <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} required className="input-field">
              <option value="">Select event</option>{events.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">Project Name</label>
            <input value={newProjName} onChange={e => setNewProjName(e.target.value)} required className="input-field" placeholder="Project name" />
          </div>
        </form>
      </Modal>
    </>
  )
}
