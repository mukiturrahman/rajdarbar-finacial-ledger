import type { Transaction, KpiData, EventProfit, MonthlyPL } from '@/types'

const sum = (txns: Transaction[]) =>
  txns.reduce((acc, t) => acc + (t.amount || 0), 0)

export function computeKPIs(
  txns: Transaction[],
  activeProjectCount: number,
): KpiData {
  const active = txns.filter((t) => t.deleted_at === null)

  const isSettled = (status: string) => !['Pending', 'Rejected', 'On Hold'].includes(status)

  const settledIncomes = active.filter((t) => t.type === 'Income' && isSettled(t.status))
  const settledExpenses = active.filter((t) => t.type === 'Expense' && isSettled(t.status))
  const allIncomes = active.filter((t) => t.type === 'Income')

  const fund = sum(settledIncomes) - sum(settledExpenses)
  const estimatedRevenue = sum(allIncomes)
  const revenue = sum(settledIncomes)
  const expenses = sum(settledExpenses)
  const net = revenue - expenses
  const margin = revenue > 0 ? parseFloat(((net / revenue) * 100).toFixed(1)) : 0

  return { fund, revenue, expenses, net, margin, activeProjects: activeProjectCount, estimatedRevenue }
}

export function computeEventProfit(
  event: { id: string; name: string },
  txns: Transaction[],
): EventProfit {
  const eventTxns = txns.filter((t) => t.event_id === event.id && t.deleted_at === null)
  const isSettled = (status: string) => !['Pending', 'Rejected', 'On Hold'].includes(status)

  const revenue = sum(eventTxns.filter((t) => t.type === 'Income' && isSettled(t.status)))
  const expenses = sum(eventTxns.filter((t) => t.type === 'Expense' && isSettled(t.status)))

  return { name: event.name, revenue, expenses, net: revenue - expenses, txnCount: eventTxns.length }
}

export function computeMonthlyPL(txns: Transaction[]): MonthlyPL[] {
  const active = txns.filter((t) => t.deleted_at === null)
  const isSettled = (status: string) => !['Pending', 'Rejected', 'On Hold'].includes(status)

  const byMonth: Record<string, Transaction[]> = {}
  active.forEach((t) => {
    const key = t.date.slice(0, 7)
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(t)
  })

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, monthTxns]) => {
      const settledIncomes = monthTxns.filter((t) => t.type === 'Income' && isSettled(t.status))
      const settledExpenses = monthTxns.filter((t) => t.type === 'Expense' && isSettled(t.status))

      const revenue = sum(settledIncomes)
      const totalExpenses = sum(settledExpenses)
      const net = revenue - totalExpenses
      const margin = revenue > 0 ? parseFloat(((net / revenue) * 100).toFixed(1)) : 0

      return { month, revenue, expenses: totalExpenses, net, margin }
    })
}
