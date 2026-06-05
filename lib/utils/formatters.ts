export function formatTaka(amount: number): string {
  return `৳${new Intl.NumberFormat('en-US').format(Math.round(amount))}`
}

export function formatTakaCompact(amount: number): string {
  if (Math.abs(amount) >= 100000) {
    const isNeg = amount < 0
    return `${isNeg ? '-' : ''}৳${(Math.abs(amount) / 1000).toFixed(0)}K`
  }
  return formatTaka(amount)
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function formatCurrency(amount: number): string {
  return formatTaka(amount)
}
