'use client'
import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Save, Loader2, UserCheck, UserX } from 'lucide-react'
import type { Profile, Role } from '@/types'

interface Props { 
  profile: Profile | null; 
  allProfiles: Profile[]; 
  companyName: string; 
  initialEventTypes: string[];
  initialWaitstaffChargeRate: number;
  initialWaitstaffCostRate: number;
}

export function SettingsTabs({ 
  profile, 
  allProfiles: initialProfiles, 
  companyName: initialName, 
  initialEventTypes,
  initialWaitstaffChargeRate,
  initialWaitstaffCostRate
}: Props) {
  const { toast } = useToast()
  const [tab, setTab] = useState<'general' | 'team'>('general')
  const [companyName, setCompanyName] = useState(initialName)
  const [profiles, setProfiles] = useState(initialProfiles)
  const [saving, setSaving] = useState(false)
  const [eventTypes, setEventTypes] = useState(initialEventTypes)
  const [newEvent, setNewEvent] = useState('')
  const [waitstaffChargeRate, setWaitstaffChargeRate] = useState(initialWaitstaffChargeRate)
  const [waitstaffCostRate, setWaitstaffCostRate] = useState(initialWaitstaffCostRate)
  const isOwner = profile?.role === 'owner'

  const saveGeneralSettings = async () => {
    setSaving(true)
    const supabase = getSupabaseClient()
    await supabase.from('app_config').upsert({ key: 'company_name', value: companyName })
    await supabase.from('app_config').upsert({ key: 'event_types', value: JSON.stringify(eventTypes) })
    await supabase.from('app_config').upsert({ key: 'waitstaff_charge_rate', value: String(waitstaffChargeRate) })
    await supabase.from('app_config').upsert({ key: 'waitstaff_cost_rate', value: String(waitstaffCostRate) })
    setSaving(false); toast('Settings updated')
  }

  const addEventType = () => {
    if (newEvent.trim() && !eventTypes.includes(newEvent.trim())) {
      setEventTypes([...eventTypes, newEvent.trim()])
      setNewEvent('')
    }
  }

  const removeEventType = (type: string) => {
    setEventTypes(eventTypes.filter(t => t !== type))
  }

  const updateRole = async (userId: string, role: Role) => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from('profiles').update({ role, status: 'active' }).eq('id', userId)
    if (error) { toast(error.message, 'error'); return }
    setProfiles(profiles.map(p => p.id === userId ? { ...p, role, status: 'active' } : p))
    toast('Role updated')
  }

  const rejectUser = async (userId: string) => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from('profiles').update({ status: 'rejected' }).eq('id', userId)
    if (error) { toast(error.message, 'error'); return }
    setProfiles(profiles.map(p => p.id === userId ? { ...p, status: 'rejected' } : p))
    toast('User rejected')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex gap-1 mb-6 p-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {(['general', ...(isOwner ? ['team'] : [])] as const).map(t => (
          <button key={t} onClick={() => setTab(t as 'general' | 'team')} className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-all capitalize ${tab === t ? 'text-white' : 'text-text-muted hover:text-text-primary'}`}
            style={tab === t ? { background: 'linear-gradient(135deg, rgba(13,92,63,0.15), rgba(201,168,76,0.10))', border: '1px solid rgba(201,168,76,0.12)' } : undefined}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="glass p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold text-text-primary mb-4">General Settings</h3>
            <div>
              <label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">Company Name</label>
              <div className="flex gap-3">
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-field flex-1" />
              </div>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-4">
            <h3 className="text-sm font-bold text-text-primary mb-4">Waitstaff Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">Waitstaff Charge Rate (৳ per person)</label>
                <input 
                  type="text" 
                  inputMode="decimal" 
                  value={waitstaffChargeRate} 
                  onChange={e => {
                    let val = e.target.value.replace(/[^0-9.]/g, "");
                    const parts = val.split(".");
                    if (parts.length > 2) {
                      val = parts[0] + "." + parts.slice(1).join("");
                    }
                    setWaitstaffChargeRate(val === "" ? 0 : Number(val));
                  }} 
                  className="input-field w-full" 
                />
              </div>
              <div>
                <label className="block text-[0.6875rem] font-bold text-text-muted mb-1.5 uppercase tracking-[0.08em]">Waitstaff Cost Rate (৳ per person)</label>
                <input 
                  type="text" 
                  inputMode="decimal" 
                  value={waitstaffCostRate} 
                  onChange={e => {
                    let val = e.target.value.replace(/[^0-9.]/g, "");
                    const parts = val.split(".");
                    if (parts.length > 2) {
                      val = parts[0] + "." + parts.slice(1).join("");
                    }
                    setWaitstaffCostRate(val === "" ? 0 : Number(val));
                  }} 
                  className="input-field w-full" 
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-4">
            <h3 className="text-sm font-bold text-text-primary mb-4">Event Types</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {eventTypes.map(type => (
                <span key={type} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 text-sm text-text-primary">
                  {type}
                  <button onClick={() => removeEventType(type)} className="text-text-muted hover:text-semantic-red ml-1"><UserX size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-3 max-w-sm">
              <input value={newEvent} onChange={e => setNewEvent(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEventType()} placeholder="Add new type..." className="input-field flex-1" />
              <button onClick={addEventType} className="btn-secondary !px-4 text-sm">Add</button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border-subtle">
            <button onClick={saveGeneralSettings} disabled={saving} className="btn-primary !px-6 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} className="mr-2" /> Save Settings</>}
            </button>
          </div>

          {profile && (
            <div className="border-t border-border-subtle pt-4 mt-2">
              <h4 className="text-sm font-bold text-text-primary mb-3">Your Profile</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-text-muted">Name:</span> <span className="text-text-primary font-medium">{profile.full_name}</span></div>
                <div><span className="text-text-muted">Email:</span> <span className="text-text-primary font-medium">{profile.email}</span></div>
                <div><span className="text-text-muted">Role:</span> <Badge variant={profile.role} /></div>
                <div><span className="text-text-muted">Status:</span> <Badge variant={profile.status} /></div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'team' && isOwner && (
        <div className="glass p-6">
          <h3 className="text-sm font-bold text-text-primary mb-4">Team Members</h3>
          <div className="flex flex-col gap-3">
            {profiles.map(p => (
              <div key={p.id} className="flex items-center justify-between py-3 px-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{p.full_name}</p>
                  <p className="text-[0.6875rem] text-text-muted">{p.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.status} />
                  {p.id !== profile?.id && p.status !== 'rejected' && (
                    <>
                      <select value={p.role} onChange={e => updateRole(p.id, e.target.value as Role)} className="filter-select !min-w-[100px] !py-1 !text-[0.6875rem]">
                        <option value="viewer">Viewer</option><option value="manager">Manager</option><option value="editor">Editor</option><option value="owner">Owner</option>
                      </select>
                      {p.status === 'pending' && (
                        <>
                          <button onClick={() => updateRole(p.id, p.role)} className="btn-ghost !p-1.5 !min-w-0 text-semantic-green"><UserCheck size={14} /></button>
                          <button onClick={() => rejectUser(p.id)} className="btn-ghost !p-1.5 !min-w-0 text-semantic-red"><UserX size={14} /></button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
