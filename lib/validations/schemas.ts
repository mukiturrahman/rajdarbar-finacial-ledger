import { z } from 'zod'

export const TransactionPayloadSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  description: z.string().min(1, 'Description is required').max(500),
  category: z.string().optional().default('Uncategorized'),
  type: z.enum(['Income', 'Expense']),
  amount: z.number().nonnegative('Amount must be non-negative'),
  method: z.string().min(1, 'Payment method is required').max(100),
  source: z.string().nullable().optional(),
  status: z.enum(['Pending', 'Received', 'Paid', 'Rejected', 'On Hold']),
  project_id: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.string().uuid().nullable()
  ),
  event_id: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.string().uuid().nullable()
  ),
})

export type TransactionPayload = z.infer<typeof TransactionPayloadSchema>

export const InvoiceItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
})

export const InvoicePayloadSchema = z.object({
  event_id: z.string().uuid().nullable(),
  project_id: z.string().uuid().nullable(),
  invoice_number: z.string().min(1, 'Invoice number is required').max(50),
  amount: z.number().nonnegative(),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  status: z.enum(['DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID']),
  items: z.array(InvoiceItemSchema).min(1, 'At least one line item is required'),
  source: z.string().nullable().optional(),
  notes: z.string().nullable(),
})

export type InvoicePayload = z.infer<typeof InvoicePayloadSchema>
