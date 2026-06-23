"use client";

import { KpiCard } from '@/components/ui/KpiCard'
import { formatTaka, formatPct } from '@/lib/utils/formatters'
import type { KpiData } from '@/types'
import { useLanguage } from '@/components/LanguageProvider'

export function KpiGrid({ kpis }: { kpis: KpiData }) {
  const { t } = useLanguage()

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
      <KpiCard label={t("companyFund")} value={formatTaka(kpis.fund)} accent="emerald" />
      <KpiCard label={t("revenue")} value={formatTaka(kpis.revenue)} accent="gold" />
      <KpiCard label={t("estRevenue")} value={formatTaka(kpis.estimatedRevenue)} accent="cyan" />
      <KpiCard label={t("expenses")} value={formatTaka(kpis.expenses)} accent="red" />
      <KpiCard label={t("netProfit")} value={formatTaka(kpis.net)} accent={kpis.net >= 0 ? 'emerald' : 'red'} />
      <KpiCard label={t("margin")} value={formatPct(kpis.margin)} accent="default" />
      <KpiCard label={t("totalEvents")} value={kpis.totalEvents.toString()} accent="default" />
    </div>
  )
}
