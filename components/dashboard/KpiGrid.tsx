"use client";

import { KpiCard } from '@/components/ui/KpiCard'
import { formatTaka, formatPct } from '@/lib/utils/formatters'
import type { KpiData } from '@/types'
import { useLanguage } from '@/components/LanguageProvider'

export function KpiGrid({ kpis }: { kpis: KpiData }) {
  const { t } = useLanguage()

  return (
    <section aria-labelledby="financial-snapshot-heading">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 id="financial-snapshot-heading" className="text-base font-semibold text-text-primary md:text-lg">
          {t("financialSnapshot")}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <KpiCard
          label={t("companyFund")}
          value={formatTaka(kpis.fund)}
          accent="emerald"
          featured
          className="md:col-span-3"
        />
        <KpiCard
          label={t("netProfit")}
          value={formatTaka(kpis.net)}
          accent={kpis.net >= 0 ? 'emerald' : 'red'}
          featured
          className="md:col-span-3"
        />
        <KpiCard label={t("revenue")} value={formatTaka(kpis.revenue)} accent="gold" className="md:col-span-2" />
        <KpiCard label={t("expenses")} value={formatTaka(kpis.expenses)} accent="red" className="md:col-span-2" />
        <KpiCard
          label={t("estRevenue")}
          value={formatTaka(kpis.estimatedRevenue)}
          accent="cyan"
          className="col-span-2 md:col-span-2"
        />
        <KpiCard label={t("margin")} value={formatPct(kpis.margin)} accent="default" className="md:col-span-3" />
        <KpiCard label={t("totalEvents")} value={kpis.totalEvents.toString()} accent="default" className="md:col-span-3" />
      </div>
    </section>
  )
}
