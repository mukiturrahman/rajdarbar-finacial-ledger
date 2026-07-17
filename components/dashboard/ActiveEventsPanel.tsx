"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { formatTaka } from "@/lib/utils/formatters";
import type { EventProfit } from "@/types";
import { useLanguage } from "@/components/LanguageProvider";

export function ActiveEventsPanel({ events }: { events: EventProfit[] }) {
  const { t } = useLanguage();
  const sorted = [...events].sort((a, b) => b.net - a.net).slice(0, 5);

  return (
    <section className="glass overflow-hidden" aria-labelledby="event-profitability-heading">
      <div className="flex min-h-[68px] items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <TrendingUp size={18} className="shrink-0 text-brand-gold" />
          <h2 id="event-profitability-heading" className="truncate text-base font-semibold text-text-primary">
            {t("eventProfitability")}
          </h2>
        </div>
        <Link href="/monthly-pl" className="btn-ghost shrink-0 !min-h-11 !px-2 text-xs">
          {t("viewAll")}
          <ArrowRight size={15} />
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center px-5 py-10 text-center">
          <p className="text-sm text-text-muted">{t("noEventsYet")}</p>
        </div>
      ) : (
        <div className="divide-y divide-border-subtle">
          {sorted.map(event => (
            <article key={event.name} className="flex min-h-[72px] items-center justify-between gap-4 px-4 py-3 md:px-5">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-text-primary">{event.name}</h3>
                <p className="mt-1 text-xs text-text-muted">
                  {event.txnCount} {t("transactions").toLowerCase()}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`font-mono text-sm font-bold tabular-nums ${
                  event.net >= 0 ? "text-semantic-green" : "text-semantic-red"
                }`}>
                  {formatTaka(event.net)}
                </p>
                <p className="mt-1 text-[0.6875rem] text-text-muted">{t("netProfit")}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
