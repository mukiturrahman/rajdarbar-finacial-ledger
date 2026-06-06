"use client";

import { formatTaka } from '@/lib/utils/formatters'
import type { EventProfit } from '@/types'
import { useLanguage } from '@/components/LanguageProvider'

export function ActiveEventsPanel({ events }: { events: EventProfit[] }) {
  const { t } = useLanguage()
  const sorted = [...events].sort((a, b) => b.net - a.net)

  return (
    <div className="glass p-5">
      <h3 className="text-base font-bold text-text-primary mb-4 pb-3 border-b border-border">{t("eventProfitability")}</h3>
      <div className="flex flex-col gap-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-text-muted">{t("noEventsYet")}</p>
        ) : (
          sorted.slice(0, 5).map((e) => (
            <div key={e.name} className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-text-primary">{e.name}</p>
                <p className="text-sm text-text-muted">{e.txnCount} {t("transactions").toLowerCase()}</p>
              </div>
              <div className="text-right">
                <p className={`text-base font-bold ${e.net >= 0 ? 'text-semantic-green' : 'text-semantic-red'}`}>
                  {formatTaka(e.net)}
                </p>
                <p className="text-sm text-text-muted">net</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
