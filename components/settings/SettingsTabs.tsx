'use client'

import { useState } from 'react'
import {
  BadgeDollarSign,
  Building2,
  CalendarRange,
  Check,
  Loader2,
  Plus,
  Save,
  Trash2,
  Users,
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { removeTeamMemberAction } from '@/app/actions/team'
import type { Profile, Role } from '@/types'

interface Props {
  profile: Profile | null
  allProfiles: Profile[]
  companyName: string
  initialEventTypes: string[]
  initialWaitstaffChargeRate: number
  initialWaitstaffCostRate: number
}

type SettingsTab = 'general' | 'team'
type TeamAction = { userId: string; type: 'role' | 'approve' | 'reject' | 'remove' } | null

interface GeneralSnapshot {
  companyName: string
  eventTypes: string[]
  waitstaffChargeRate: number
  waitstaffCostRate: number
}

export function SettingsTabs({
  profile,
  allProfiles: initialProfiles,
  companyName: initialName,
  initialEventTypes,
  initialWaitstaffChargeRate,
  initialWaitstaffCostRate,
}: Props) {
  const { toast } = useToast()
  const [tab, setTab] = useState<SettingsTab>('general')
  const [companyName, setCompanyName] = useState(initialName)
  const [companyNameError, setCompanyNameError] = useState('')
  const [profiles, setProfiles] = useState(initialProfiles)
  const [saving, setSaving] = useState(false)
  const [eventTypes, setEventTypes] = useState(initialEventTypes)
  const [newEvent, setNewEvent] = useState('')
  const [newEventError, setNewEventError] = useState('')
  const [waitstaffChargeRate, setWaitstaffChargeRate] = useState(initialWaitstaffChargeRate)
  const [waitstaffCostRate, setWaitstaffCostRate] = useState(initialWaitstaffCostRate)
  const [teamAction, setTeamAction] = useState<TeamAction>(null)
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null)
  const [pendingRoles, setPendingRoles] = useState<Record<string, Role>>(() =>
    Object.fromEntries(initialProfiles.map(member => [member.id, member.role])) as Record<string, Role>
  )
  const [savedGeneral, setSavedGeneral] = useState<GeneralSnapshot>({
    companyName: initialName,
    eventTypes: initialEventTypes,
    waitstaffChargeRate: initialWaitstaffChargeRate,
    waitstaffCostRate: initialWaitstaffCostRate,
  })

  const isOwner = profile?.role === 'owner'
  const pendingCount = profiles.filter(member => member.status === 'pending').length
  const hasGeneralChanges =
    companyName !== savedGeneral.companyName ||
    JSON.stringify(eventTypes) !== JSON.stringify(savedGeneral.eventTypes) ||
    waitstaffChargeRate !== savedGeneral.waitstaffChargeRate ||
    waitstaffCostRate !== savedGeneral.waitstaffCostRate

  const saveGeneralSettings = async () => {
    const normalizedCompanyName = companyName.trim()
    if (!normalizedCompanyName) {
      setCompanyNameError('Enter a company name.')
      return
    }
    if (waitstaffChargeRate < 0 || waitstaffCostRate < 0) {
      toast('Waitstaff rates cannot be negative', 'error')
      return
    }

    setSaving(true)
    try {
      const supabase = getSupabaseClient()
      const results = await Promise.all([
        supabase.from('app_config').upsert({ key: 'company_name', value: normalizedCompanyName }),
        supabase.from('app_config').upsert({ key: 'event_types', value: JSON.stringify(eventTypes) }),
        supabase.from('app_config').upsert({ key: 'waitstaff_charge_rate', value: String(waitstaffChargeRate) }),
        supabase.from('app_config').upsert({ key: 'waitstaff_cost_rate', value: String(waitstaffCostRate) }),
      ])
      const failedResult = results.find(result => result.error)
      if (failedResult?.error) {
        toast(failedResult.error.message, 'error')
        return
      }

      setCompanyName(normalizedCompanyName)
      setSavedGeneral({
        companyName: normalizedCompanyName,
        eventTypes: [...eventTypes],
        waitstaffChargeRate,
        waitstaffCostRate,
      })
      toast('Settings updated')
    } catch {
      toast('Unable to update settings. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const addEventType = () => {
    const normalizedEvent = newEvent.trim()
    if (!normalizedEvent) {
      setNewEventError('Enter an event type.')
      return
    }
    if (eventTypes.some(type => type.toLowerCase() === normalizedEvent.toLowerCase())) {
      setNewEventError('This event type already exists.')
      return
    }

    setEventTypes(current => [...current, normalizedEvent])
    setNewEvent('')
    setNewEventError('')
  }

  const removeEventType = (type: string) => {
    setEventTypes(current => current.filter(eventType => eventType !== type))
  }

  const updateActiveRole = async (userId: string, role: Role) => {
    setTeamAction({ userId, type: 'role' })
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
      if (error) {
        toast(error.message, 'error')
        return
      }
      setProfiles(current => current.map(member => member.id === userId ? { ...member, role } : member))
      toast('Role updated')
    } catch {
      toast('Unable to update this role. Please try again.', 'error')
    } finally {
      setTeamAction(null)
    }
  }

  const approveUser = async (userId: string) => {
    const role = pendingRoles[userId] || 'viewer'
    setTeamAction({ userId, type: 'approve' })
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('profiles').update({ role, status: 'active' }).eq('id', userId)
      if (error) {
        toast(error.message, 'error')
        return
      }
      setProfiles(current =>
        current.map(member => member.id === userId ? { ...member, role, status: 'active' } : member)
      )
      toast('Team member approved')
    } catch {
      toast('Unable to approve this member. Please try again.', 'error')
    } finally {
      setTeamAction(null)
    }
  }

  const rejectUser = async (userId: string) => {
    setTeamAction({ userId, type: 'reject' })
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('profiles').update({ status: 'rejected' }).eq('id', userId)
      if (error) {
        toast(error.message, 'error')
        return
      }
      setProfiles(current =>
        current.map(member => member.id === userId ? { ...member, status: 'rejected' } : member)
      )
      toast('User rejected')
    } catch {
      toast('Unable to reject this member. Please try again.', 'error')
    } finally {
      setTeamAction(null)
    }
  }

  const removeUser = async (userId: string) => {
    if (userId === profile?.id) {
      toast('You cannot remove your current account', 'error')
      return
    }

    setTeamAction({ userId, type: 'remove' })
    try {
      const result = await removeTeamMemberAction(userId)
      if (!result.success) {
        toast(result.error || 'Unable to remove this member.', 'error')
        return
      }
      setProfiles(current => current.filter(member => member.id !== userId))
      setPendingRoles(current => {
        const nextRoles = { ...current }
        delete nextRoles[userId]
        return nextRoles
      })
      toast('Team member removed')
    } catch {
      toast('Unable to remove this member. Please try again.', 'error')
    } finally {
      setTeamAction(null)
    }
  }

  const tabs = [
    { id: 'general' as const, label: 'General', description: 'Venue details and pricing', icon: Building2 },
    ...(isOwner
      ? [{ id: 'team' as const, label: 'Team', description: 'Roles and access', icon: Users }]
      : []),
  ]

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
      <aside>
        <nav
          className={`grid gap-2 rounded-2xl border border-border bg-bg-card p-2 lg:sticky lg:top-28 lg:grid-cols-1 ${
            isOwner ? 'grid-cols-2' : 'grid-cols-1'
          }`}
          aria-label="Settings sections"
        >
          {tabs.map(({ id, label, description, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={tab === id}
              aria-controls={`${id}-settings-panel`}
              onClick={() => setTab(id)}
              className={`flex min-h-14 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 ${
                tab === id
                  ? 'bg-brand-orange/10 text-text-primary shadow-[inset_3px_0_0_var(--color-brand-orange)]'
                  : 'text-text-muted hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              <Icon size={18} className={tab === id ? 'text-brand-orange' : undefined} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="hidden truncate text-[0.6875rem] text-text-muted lg:block">{description}</span>
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        {tab === 'general' && (
          <div id="general-settings-panel" className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-border bg-bg-card">
              <header className="flex items-start gap-3 border-b border-border px-4 py-4 md:px-5">
                <Building2 size={19} className="mt-0.5 shrink-0 text-brand-orange" />
                <div>
                  <h2 className="text-base font-semibold text-text-primary">Venue details</h2>
                  <p className="mt-1 text-sm text-text-muted">The business name shown throughout the ledger.</p>
                </div>
              </header>
              <div className="p-4 md:p-5">
                <label htmlFor="company-name" className="block text-sm font-medium text-text-secondary">
                  Company name <span className="text-semantic-red">*</span>
                </label>
                <input
                  id="company-name"
                  name="company_name"
                  value={companyName}
                  onChange={event => {
                    setCompanyName(event.target.value)
                    if (companyNameError) setCompanyNameError('')
                  }}
                  onBlur={() => {
                    if (!companyName.trim()) setCompanyNameError('Enter a company name.')
                  }}
                  className="input-field mt-2 text-base md:text-sm"
                  autoComplete="organization"
                  required
                  aria-invalid={!!companyNameError}
                  aria-describedby={companyNameError ? 'company-name-error' : 'company-name-help'}
                />
                {companyNameError ? (
                  <p id="company-name-error" role="alert" className="mt-2 text-xs text-semantic-red">
                    {companyNameError}
                  </p>
                ) : (
                  <p id="company-name-help" className="mt-2 text-xs leading-5 text-text-muted">
                    Used in dashboard headings and business records.
                  </p>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-bg-card">
              <header className="flex items-start gap-3 border-b border-border px-4 py-4 md:px-5">
                <BadgeDollarSign size={19} className="mt-0.5 shrink-0 text-brand-gold" />
                <div>
                  <h2 className="text-base font-semibold text-text-primary">Waitstaff pricing</h2>
                  <p className="mt-1 text-sm text-text-muted">Set customer charges and internal staffing costs.</p>
                </div>
              </header>
              <div className="grid gap-4 p-4 md:grid-cols-2 md:p-5">
                <div>
                  <label htmlFor="waitstaff-charge-rate" className="block text-sm font-medium text-text-secondary">
                    Charge rate
                  </label>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted">৳</span>
                    <input
                      id="waitstaff-charge-rate"
                      name="waitstaff_charge_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={waitstaffChargeRate}
                      onChange={event => setWaitstaffChargeRate(Math.max(0, event.target.valueAsNumber || 0))}
                      className="input-field !pl-8 text-base md:text-sm"
                      aria-describedby="waitstaff-charge-help"
                    />
                  </div>
                  <p id="waitstaff-charge-help" className="mt-2 text-xs leading-5 text-text-muted">Customer price per person.</p>
                </div>
                <div>
                  <label htmlFor="waitstaff-cost-rate" className="block text-sm font-medium text-text-secondary">
                    Cost rate
                  </label>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted">৳</span>
                    <input
                      id="waitstaff-cost-rate"
                      name="waitstaff_cost_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={waitstaffCostRate}
                      onChange={event => setWaitstaffCostRate(Math.max(0, event.target.valueAsNumber || 0))}
                      className="input-field !pl-8 text-base md:text-sm"
                      aria-describedby="waitstaff-cost-help"
                    />
                  </div>
                  <p id="waitstaff-cost-help" className="mt-2 text-xs leading-5 text-text-muted">Internal expense per person.</p>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-bg-card">
              <header className="flex items-start gap-3 border-b border-border px-4 py-4 md:px-5">
                <CalendarRange size={19} className="mt-0.5 shrink-0 text-semantic-indigo" />
                <div>
                  <h2 className="text-base font-semibold text-text-primary">Event types</h2>
                  <p className="mt-1 text-sm text-text-muted">Manage the options available when creating an event.</p>
                </div>
              </header>
              <div className="p-4 md:p-5">
                {eventTypes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                    <p className="text-sm font-medium text-text-primary">No event types configured</p>
                    <p className="mt-1 text-xs text-text-muted">Add a type below to make it available in event forms.</p>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {eventTypes.map(type => (
                      <div
                        key={type}
                        className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-overlay pl-3"
                      >
                        <span className="truncate text-sm font-medium text-text-primary">{type}</span>
                        <button
                          type="button"
                          onClick={() => removeEventType(type)}
                          className="btn-ghost !h-11 !min-h-11 !w-11 !min-w-11 !p-0 text-text-muted hover:!bg-semantic-red/10 hover:!text-semantic-red"
                          aria-label={`Remove ${type} event type`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 border-t border-border-subtle pt-4">
                  <label htmlFor="new-event-type" className="block text-sm font-medium text-text-secondary">
                    Add event type
                  </label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      id="new-event-type"
                      value={newEvent}
                      onChange={event => {
                        setNewEvent(event.target.value)
                        if (newEventError) setNewEventError('')
                      }}
                      onKeyDown={event => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addEventType()
                        }
                      }}
                      placeholder="For example, Engagement"
                      className="input-field flex-1 text-base md:text-sm"
                      aria-invalid={!!newEventError}
                      aria-describedby={newEventError ? 'new-event-type-error' : 'new-event-type-help'}
                    />
                    <button type="button" onClick={addEventType} className="btn-secondary shrink-0 whitespace-nowrap sm:!px-4">
                      <Plus size={16} />
                      Add type
                    </button>
                  </div>
                  {newEventError ? (
                    <p id="new-event-type-error" role="alert" className="mt-2 text-xs text-semantic-red">{newEventError}</p>
                  ) : (
                    <p id="new-event-type-help" className="mt-2 text-xs leading-5 text-text-muted">
                      Event types must have unique names.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {profile && (
              <section className="overflow-hidden rounded-2xl border border-border bg-bg-card">
                <header className="border-b border-border px-4 py-4 md:px-5">
                  <h2 className="text-base font-semibold text-text-primary">Your account</h2>
                  <p className="mt-1 text-sm text-text-muted">Your current profile and access level.</p>
                </header>
                <dl className="grid gap-4 p-4 sm:grid-cols-2 md:p-5">
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Name</dt>
                    <dd className="mt-1 break-words text-sm font-medium text-text-primary">{profile.full_name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Email</dt>
                    <dd className="mt-1 break-all text-sm font-medium text-text-primary">{profile.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Role</dt>
                    <dd className="mt-2"><Badge variant={profile.role} /></dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Status</dt>
                    <dd className="mt-2"><Badge variant={profile.status} /></dd>
                  </div>
                </dl>
              </section>
            )}

            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-card p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
              <p className="text-sm text-text-muted" aria-live="polite">
                {hasGeneralChanges ? 'You have unsaved changes.' : 'All changes are saved.'}
              </p>
              <button
                type="button"
                onClick={saveGeneralSettings}
                disabled={saving || !hasGeneralChanges}
                className="btn-primary shrink-0 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        )}

        {tab === 'team' && isOwner && (
          <section
            id="team-settings-panel"
            className="overflow-hidden rounded-2xl border border-border bg-bg-card"
          >
            <header className="flex flex-col gap-2 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Team access</h2>
                <p className="mt-1 text-sm text-text-muted">Review members and assign their ledger permissions.</p>
              </div>
              <p className="text-xs text-text-muted">
                {profiles.length} member{profiles.length === 1 ? '' : 's'}
                {pendingCount > 0 ? `, ${pendingCount} pending` : ''}
              </p>
            </header>

            {profiles.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Users size={26} className="mx-auto mb-3 text-text-muted" />
                <p className="text-sm font-medium text-text-primary">No team members found</p>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {profiles.map(member => {
                  const isCurrentAccount = member.id === profile?.id
                  const isPending = member.status === 'pending'
                  const isRejected = member.status === 'rejected'
                  const memberBusy = teamAction?.userId === member.id

                  return (
                    <article key={member.id} className="p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-text-primary">{member.full_name}</h3>
                          <p className="mt-1 break-all text-xs text-text-muted">{member.email}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant={member.role} />
                            {isCurrentAccount && (
                              <span className="text-xs font-medium text-brand-orange">Current account</span>
                            )}
                          </div>
                        </div>
                        <Badge variant={member.status} />
                      </div>

                      {!isCurrentAccount && !isRejected && (
                        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-overlay p-3 sm:flex-row sm:items-end">
                          <div className="min-w-0 flex-1">
                            <label htmlFor={`member-role-${member.id}`} className="block text-xs font-medium text-text-muted">
                              Role
                            </label>
                            <select
                              id={`member-role-${member.id}`}
                              value={isPending ? pendingRoles[member.id] : member.role}
                              onChange={event => {
                                const role = event.target.value as Role
                                if (isPending) {
                                  setPendingRoles(current => ({ ...current, [member.id]: role }))
                                } else {
                                  updateActiveRole(member.id, role)
                                }
                              }}
                              className="filter-select mt-1.5 min-w-0 text-base md:text-sm"
                              disabled={memberBusy}
                            >
                              <option value="viewer">Viewer</option>
                              <option value="manager">Manager</option>
                              <option value="editor">Editor</option>
                              <option value="owner">Owner</option>
                            </select>
                          </div>

                          {isPending && (
                            <div className="grid grid-cols-2 gap-2 sm:flex">
                              <button
                                type="button"
                                onClick={() => approveUser(member.id)}
                                disabled={memberBusy}
                                className="btn-secondary whitespace-nowrap !text-semantic-green disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {memberBusy && teamAction?.type === 'approve'
                                  ? <Loader2 size={16} className="animate-spin" />
                                  : <Check size={16} />}
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => rejectUser(member.id)}
                                disabled={memberBusy}
                                className="btn-ghost min-h-11 whitespace-nowrap !text-semantic-red hover:!bg-semantic-red/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {memberBusy && teamAction?.type === 'reject'
                                  ? <Loader2 size={16} className="animate-spin" />
                                  : <Trash2 size={16} />}
                                Reject
                              </button>
                            </div>
                          )}

                          {!isPending && memberBusy && teamAction?.type === 'role' && (
                            <div className="flex min-h-11 items-center gap-2 px-2 text-xs text-text-muted">
                              <Loader2 size={15} className="animate-spin" />
                              Updating
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => setRemoveConfirmId(member.id)}
                            disabled={memberBusy}
                            className="btn-ghost min-h-11 whitespace-nowrap !text-semantic-red hover:!bg-semantic-red/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {memberBusy && teamAction?.type === 'remove'
                              ? <Loader2 size={16} className="animate-spin" />
                              : <Trash2 size={16} />}
                            Remove
                          </button>
                        </div>
                      )}

                      {!isCurrentAccount && isRejected && (
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setRemoveConfirmId(member.id)}
                            disabled={memberBusy}
                            className="btn-ghost min-h-11 whitespace-nowrap !text-semantic-red hover:!bg-semantic-red/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {memberBusy && teamAction?.type === 'remove'
                              ? <Loader2 size={16} className="animate-spin" />
                              : <Trash2 size={16} />}
                            Remove
                          </button>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </div>

      <ConfirmModal
        open={!!removeConfirmId}
        onClose={() => setRemoveConfirmId(null)}
        onConfirm={() => {
          if (removeConfirmId) void removeUser(removeConfirmId)
        }}
        title="Remove team member?"
        description="This will revoke their ledger access and remove them from the team. Historical records will remain unchanged."
        confirmText="Remove member"
        destructive
      />
    </div>
  )
}
