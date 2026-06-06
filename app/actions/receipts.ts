'use server'

import { getSupabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function logReceiptExpense(formData: FormData) {
  const supabase = await getSupabaseServer()
  
  const date = formData.get('date') as string
  const category = formData.get('category') as string
  const amount = parseFloat(formData.get('amount') as string)
  const description = formData.get('description') as string
  const file = formData.get('receiptImage') as File | null

  let receipt_url = null

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Error uploading receipt image:', uploadError)
      return { success: false, error: 'Failed to upload image. Does the "receipts" storage bucket exist?' }
    }

    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName)
      
    receipt_url = publicUrlData.publicUrl
  }

  const { error } = await supabase.from('transactions').insert({
    date,
    category,
    amount,
    description,
    type: 'Expense',
    status: 'Paid',
    method: 'Cash', // Default to Cash, can be expanded later
    receipt_url,
    source: 'Receipt Page'
  })

  if (error) {
    console.error('Error logging receipt:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/invoices')
  revalidatePath('/transactions')
  
  return { success: true }
}
