'use server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireMutationAccess } from '@/lib/auth/guards'
import { InvoicePayloadSchema } from '@/lib/validations/schemas'

export async function saveInvoiceAction(payload: unknown, isEdit: boolean, id?: string) {
  try { await requireMutationAccess() } catch (err: any) { return { success: false, error: err.message } }
  const parsed = InvoicePayloadSchema.safeParse(payload)
  if (!parsed.success) return { success: false, error: `Validation: ${parsed.error.issues[0].message}` }
  const supabase = await getSupabaseServer()
  const data = { ...parsed.data, items: JSON.stringify(parsed.data.items) }
  let result
  if (isEdit && id) { result = await supabase.from('invoices').update(data).eq('id', id).select().single() }
  else { result = await supabase.from('invoices').insert(data).select().single() }
  if (result.error) return { success: false, error: result.error.message }
  revalidatePath('/invoices')
  return { success: true, data: result.data }
}

export async function updateInvoiceStatusAction(id: string, status: string) {
  try { await requireMutationAccess() } catch (err: any) { return { success: false, error: err.message } }
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('invoices').update({ status }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/invoices')
  return { success: true }
}

export async function deleteInvoiceAction(id: string) {
  try { await requireMutationAccess() } catch (err: any) { return { success: false, error: err.message } }
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/invoices')
  return { success: true }
}
