export type Role = 'owner' | 'editor' | 'viewer' | 'manager' | 'pending'
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
  party_name?: string
  event_date?: string
  booking_date?: string
  advance_payment?: number
  total_amount?: number
  event_type?: string
  guests_count?: number
  revenue?: number
  remaining_amount?: number
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
  receipt_url?: string
  deleted_at: string | null
  created_at: string
}

export interface MasterConfig {
  categories?: string[]
  methods: string[]
  statuses: string[]
  events: string[]
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

export type ReceiptStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'VOID'

export interface ReceiptItem {
  description: string
  quantity: number
  price: number
}

export interface Receipt {
  id: string
  event_id: string | null
  project_id: string | null
  receipt_number: string
  amount: number
  issue_date: string
  due_date: string | null
  status: ReceiptStatus
  items: ReceiptItem[]
  source?: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
