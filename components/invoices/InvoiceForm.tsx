'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveInvoiceAction } from '@/app/actions/invoices'
import { useToast } from '@/components/ui/Toast'
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { EventClient, Project, InvoiceItem } from '@/types'

interface Props { events: EventClient[]; projects: Project[]; nextInvoiceNumber: string }

export function InvoiceForm({ events, projects, nextInvoiceNumber }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({ event_id: '', project_id: '', invoice_number: nextInvoiceNumber, issue_date: today, due_date: '', status: 'DRAFT' as string, notes: '' })
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, price: 0 }])

  const total = items.reduce((s, i) => s + i.quantity * i.price, 0)
  const filteredProjects = form.event_id ? projects.filter(p => p.event_id === form.event_id) : projects

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const payload = { ...form, event_id: form.event_id || null, project_id: form.project_id || null, due_date: form.due_date || null, notes: form.notes || null, amount: total, items }
    const res = await saveInvoiceAction(payload, false); setSaving(false)
    if (res.success) { toast('Invoice created'); router.push('/invoices') }
    else toast(res.error || 'Failed', 'error')
  }

  return (
    <>
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="btn-ghost !p-2"><ArrowLeft size={18} /></Link>
          <div><h1>New Invoice</h1><p className="text-[0.8125rem] text-text-muted mt-0.5">{form.invoice_number}</p></div>
        </div>
        <button onClick={(e: React.MouseEvent) => { (e.target as HTMLElement).closest('form')?.requestSubmit() || document.getElementById('inv-form')?.dispatchEvent(new Event('submit', { bubbles: true })) }} disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}Save Invoice
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:py-6 md:px-8">
        <form id="inv-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-6">
          <div className="glass p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-text-primary mb-2">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">Invoice #</label><input value={form.invoice_number} onChange={e => setForm({...form, invoice_number: e.target.value})} required className="input-field" /></div>
              <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">{['DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID'].map(s => <option key={s}>{s}</option>)}</select>
              </div>
              <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">Issue Date</label><input type="date" value={form.issue_date} onChange={e => setForm({...form, issue_date: e.target.value})} required className="input-field" /></div>
              <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">Due Date</label><input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className="input-field" /></div>
              <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">Event</label>
                <select value={form.event_id} onChange={e => setForm({...form, event_id: e.target.value, project_id: ''})} className="input-field"><option value="">None</option>{events.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              </div>
              <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">Project</label>
                <select value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} className="input-field"><option value="">None</option>{filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
              </div>
            </div>
            <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field min-h-[80px]" rows={3} placeholder="Optional notes" /></div>
          </div>

          <div className="glass p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-text-primary">Line Items</h3>
              <button type="button" onClick={() => setItems([...items, { description: '', quantity: 1, price: 0 }])} className="btn-ghost text-brand-gold"><Plus size={14} />Add Item</button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-6"><input value={item.description} onChange={e => { const n = [...items]; n[i].description = e.target.value; setItems(n) }} required className="input-field" placeholder="Description" /></div>
                <div className="col-span-2"><input type="number" min="1" value={item.quantity} onChange={e => { const n = [...items]; n[i].quantity = parseInt(e.target.value) || 1; setItems(n) }} className="input-field" /></div>
                <div className="col-span-3"><input type="number" min="0" step="0.01" value={item.price} onChange={e => { const n = [...items]; n[i].price = parseFloat(e.target.value) || 0; setItems(n) }} className="input-field" placeholder="0.00" /></div>
                <div className="col-span-1"><button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="btn-ghost !p-2 !min-w-0 text-text-muted hover:text-semantic-red"><Trash2 size={14} /></button></div>
              </div>
            ))}
            <div className="text-right text-lg font-bold text-brand-gold mt-2">৳{total.toLocaleString()}</div>
          </div>
        </form>
      </div>
    </>
  )
}
