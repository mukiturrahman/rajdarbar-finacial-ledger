'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { saveTransactionAction } from '@/app/actions/transactions'
import { useLanguage } from '@/components/LanguageProvider'
import { Loader2, Save } from 'lucide-react'
import type { Transaction, MasterConfig, EventClient, Project } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  editTxn: Transaction | null
  events: EventClient[]
  projects: Project[]
  config: MasterConfig
}

export function AddTransactionModal({ open, onClose, editTxn, events, projects, config }: Props) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    date: today, description: '', category: 'Uncategorized', type: 'Expense' as 'Income' | 'Expense',
    amount: '', method: config.methods?.[0] || 'Cash', source: '',
    status: 'Pending' as string, event_id: '', project_id: '',
  })

  useEffect(() => {
    if (editTxn) {
      setForm({
        date: editTxn.date, description: editTxn.description, category: editTxn.category || 'Uncategorized',
        type: editTxn.type, amount: String(editTxn.amount), method: editTxn.method,
        source: editTxn.source || '', status: editTxn.status,
        event_id: editTxn.event_id || '', project_id: editTxn.project_id || '',
      })
    } else {
      setForm({ date: today, description: '', category: 'Uncategorized', type: 'Expense', amount: '', method: config.methods?.[0] || 'Cash', source: '', status: 'Pending', event_id: '', project_id: '' })
    }
  }, [editTxn, open, today, config.methods])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, amount: parseFloat(form.amount) || 0, source: form.source || null, event_id: form.event_id || null, project_id: form.project_id || null }
    const res = await saveTransactionAction(payload, !!editTxn, editTxn?.id)
    setSaving(false)
    if (res.success) { toast(editTxn ? 'Transaction updated' : 'Transaction added'); onClose(); router.refresh() }
    else toast(res.error || 'Failed to save', 'error')
  }

  const filteredProjects = form.event_id ? projects.filter(p => p.event_id === form.event_id) : projects

  return (
    <Modal open={open} onClose={onClose} title={editTxn ? 'Edit Transaction' : 'Add Transaction'} footer={
      <><button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
      <button type="submit" form="txn-form" disabled={saving} className="btn-primary disabled:opacity-50">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}{editTxn ? 'Update' : 'Save'}
      </button></>
    }>
      <form id="txn-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("date")}</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="input-field" /></div>
          <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("transactionType")}</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value as 'Income'|'Expense'})} className="input-field"><option>{t("income")}</option><option>{t("expense")}</option></select>
          </div>
        </div>
        <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("description")}</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required className="input-field" placeholder={t("description")} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("amount")} (৳)</label>
            <input 
              type="text" 
              inputMode="decimal" 
              value={form.amount} 
              onChange={e => {
                let val = e.target.value.replace(/[^0-9.]/g, "");
                const parts = val.split(".");
                if (parts.length > 2) {
                  val = parts[0] + "." + parts.slice(1).join("");
                }
                setForm({...form, amount: val});
              }} 
              required 
              className="input-field" 
              placeholder="0.00" 
            />
          </div>
          <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("method")}</label>
            <select value={form.method} onChange={e => setForm({...form, method: e.target.value})} className="input-field">
              {(config.methods || ['Cash', 'Bank Transfer', 'bKash', 'Nagad', 'Check']).map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("event")}</label>
          <select value={form.event_id} onChange={e => setForm({...form, event_id: e.target.value, project_id: ''})} className="input-field w-full">
            <option value="">{t("none")}</option>{events.map(c => (
              <option key={c.id} value={c.id}>
                {c.party_name || c.name}{c.mobile_number ? ` - ${c.mobile_number}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("status")}</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
              {['Pending', 'Received', 'Paid', 'Rejected', 'On Hold'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">{t("source")}</label>
            <input type="text" value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="input-field" placeholder={t("optional")} />
          </div>
        </div>
      </form>
    </Modal>
  )
}
