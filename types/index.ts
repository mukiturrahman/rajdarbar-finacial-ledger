export type Role = 'owner' | 'editor' | 'viewer' | 'pending'
export type ProfileStatus = 'pending' | 'active' | 'rejected'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: Role
  status: ProfileStatus
  created_at: string
}

export interface EventClient {
  id: string
  name: string
  created_at: string
}

export interface Project {
  id: string
  name: string
  event_id: string
  created_at: string
}

export type TxnType = 'Income' | 'Expense'
export type TxnStatus = 'Pending' | 'Received' | 'Paid' | 'Rejected' | 'On Hold'

export interface Transaction {
  id: string
  date: string
  description: string
  event_id: string | null
  project_id: string | null
  category?: string
  type: TxnType
  amount: number
  method: string
  source?: string | null
  status: TxnStatus
  created_by: string
  deleted_at: string | null
  created_at: string
}

export interface MasterConfig {
  categories?: string[]
  methods: string[]
  statuses: string[]
  events: string[]
  years: number[]
}

export interface AppConfig {
  company_name: string
}

export interface KpiData {
  fund: number
  revenue: number
  expenses: number
  net: number
  margin: number
  activeProjects: number
  estimatedRevenue: number
}

export interface EventProfit {
  name: string
  revenue: number
  expenses: number
  net: number
  txnCount: number
}

export interface MonthlyPL {
  month: string
  revenue: number
  expenses: number
  net: number
  margin: number
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'VOID'

export interface InvoiceItem {
  description: string
  quantity: number
  price: number
}

export interface Invoice {
  id: string
  event_id: string | null
  project_id: string | null
  invoice_number: string
  amount: number
  issue_date: string
  due_date: string | null
  status: InvoiceStatus
  items: InvoiceItem[]
  source?: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
