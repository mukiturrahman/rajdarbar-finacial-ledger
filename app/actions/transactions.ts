'use server'

import { getSupabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireMutationAccess } from '@/lib/auth/guards'
import { TransactionPayloadSchema } from '@/lib/validations/schemas'

function revalidateAllFinancialPaths() {
  revalidatePath('/')
  revalidatePath('/transactions')
  revalidatePath('/monthly-pl')
  revalidatePath('/events')
  revalidatePath('/invoices')
}

export async function saveTransactionAction(payload: unknown, isEdit: boolean, id?: string) {
  try {
    await requireMutationAccess()
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' }
  }

  const parsed = TransactionPayloadSchema.safeParse(payload)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { success: false, error: `Validation failed: ${firstError.path.join('.')} — ${firstError.message}` }
  }

  const supabase = await getSupabaseServer()
  const validData = parsed.data

  let result
  if (isEdit && id) {
    result = await supabase.from('transactions').update(validData).eq('id', id).select().single()
  } else {
    result = await supabase.from('transactions').insert(validData).select().single()
  }

  if (result.error) {
    return { success: false, error: result.error.message }
  }

  revalidateAllFinancialPaths()
  return { success: true, data: result.data }
}

export async function deleteTransactionAction(id: string) {
  try {
    await requireMutationAccess()
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' }
  }

  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Invalid transaction ID' }
  }

  const supabase = await getSupabaseServer()

  const { error } = await supabase
    .from('transactions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidateAllFinancialPaths()
  return { success: true }
}
