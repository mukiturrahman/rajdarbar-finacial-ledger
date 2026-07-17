'use server'

import { getSupabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireMutationAccess } from '@/lib/auth/guards'
import { TransactionPayloadSchema } from '@/lib/validations/schemas'
import { z } from 'zod'

const TransactionIdsSchema = z.array(z.string().uuid()).min(1).max(100)
const TransactionStatusSchema = z.enum(['Pending', 'Received', 'Paid', 'Rejected', 'On Hold'])

async function getMutationAccessError() {
  try {
    await requireMutationAccess()
    return null
  } catch (error: unknown) {
    return error instanceof Error && error.message ? error.message : 'Unauthorized'
  }
}

function revalidateAllFinancialPaths() {
  revalidatePath('/')
  revalidatePath('/transactions')
  revalidatePath('/monthly-pl')
  revalidatePath('/events')
  revalidatePath('/receipts')
}

export async function saveTransactionAction(payload: unknown, isEdit: boolean, id?: string) {
  const accessError = await getMutationAccessError()
  if (accessError) return { success: false, error: accessError }

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
  const accessError = await getMutationAccessError()
  if (accessError) return { success: false, error: accessError }

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

export async function bulkUpdateTransactionStatusAction(ids: unknown, status: unknown) {
  const accessError = await getMutationAccessError()
  if (accessError) return { success: false, error: accessError }

  const parsedIds = TransactionIdsSchema.safeParse(ids)
  const parsedStatus = TransactionStatusSchema.safeParse(status)
  if (!parsedIds.success || !parsedStatus.success) {
    return { success: false, error: 'Invalid bulk status update' }
  }

  const supabase = await getSupabaseServer()
  const { error } = await supabase
    .from('transactions')
    .update({ status: parsedStatus.data })
    .in('id', parsedIds.data)
    .is('deleted_at', null)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidateAllFinancialPaths()
  return { success: true }
}

export async function bulkDeleteTransactionsAction(ids: unknown) {
  const accessError = await getMutationAccessError()
  if (accessError) return { success: false, error: accessError }

  const parsedIds = TransactionIdsSchema.safeParse(ids)
  if (!parsedIds.success) {
    return { success: false, error: 'Invalid transaction selection' }
  }

  const supabase = await getSupabaseServer()
  const { error } = await supabase
    .from('transactions')
    .update({ deleted_at: new Date().toISOString() })
    .in('id', parsedIds.data)
    .is('deleted_at', null)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidateAllFinancialPaths()
  return { success: true }
}
