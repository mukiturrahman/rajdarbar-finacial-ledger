"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import type { EventClient } from "@/types";
import { formatDate, formatTaka } from "@/lib/utils/formatters";

const DASHBOARD_EVENT_LIMIT = 5;

export function UpcomingEventsTracker({ events = [] }: { events?: EventClient[] }) {
  const { t } = useLanguage();
  const visibleEvents = events.slice(0, DASHBOARD_EVENT_LIMIT);

  return (
    <section className="glass overflow-hidden" aria-labelledby="upcoming-events-heading">
      <div className="flex min-h-[68px] items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="shrink-0 text-brand-emerald" />
            <h2 id="upcoming-events-heading" className="truncate text-base font-semibold text-text-primary md:text-lg">
              {t("upcomingEvents")}
            </h2>
          </div>
          <p className="mt-0.5 pl-6 text-xs text-text-muted">
            {events.length} {t("scheduled")}
          </p>
        </div>
        <Link href="/events" className="btn-ghost shrink-0 !min-h-11 !px-2 text-xs md:!px-3 md:text-sm">
          {t("viewAll")}
          <ArrowRight size={15} />
        </Link>
      </div>

      {visibleEvents.length === 0 ? (
        <div className="flex min-h-44 flex-col items-center justify-center px-5 py-10 text-center">
          <CalendarDays size={26} className="mb-3 text-text-muted" />
          <p className="text-sm font-medium text-text-primary">{t("noEvents")}</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border-subtle md:hidden">
            {visibleEvents.map(event => {
              const paid = event.revenue || event.advance_payment || 0;
              const total = event.total_amount || 0;

              return (
                <article key={event.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-text-primary">
                        {event.party_name || event.name}
                      </h3>
                      {event.party_name && (
                        <p className="mt-0.5 truncate text-xs text-text-muted">{event.name}</p>
                      )}
                    </div>
                    <time className="shrink-0 rounded-lg bg-semantic-indigo/10 px-2 py-1 text-xs font-semibold text-semantic-indigo">
                      {event.event_date ? formatDate(event.event_date) : "N/A"}
                    </time>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-bg-overlay p-3">
                    <div>
                      <p className="text-[0.6875rem] font-medium text-text-muted">{t("booking")}</p>
                      <p className="mt-1 text-xs font-medium text-text-secondary">
                        {event.booking_date ? formatDate(event.booking_date) : "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.6875rem] font-medium text-text-muted">{t("collected")}</p>
                      <p className="mt-1 font-mono text-xs font-semibold tabular-nums text-text-primary">{formatTaka(paid)}</p>
                      <p className="mt-0.5 font-mono text-[0.6875rem] tabular-nums text-text-muted">/ {formatTaka(total)}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("partyName")}</th>
                  <th>{t("eventDate")}</th>
                  <th>{t("bookingDate")}</th>
                  <th className="text-right">{t("totalPaid")}</th>
                </tr>
              </thead>
              <tbody>
                {visibleEvents.map(event => {
                  const paid = event.revenue || event.advance_payment || 0;

                  return (
                    <tr key={event.id}>
                      <td>
                        <p className="font-medium text-text-primary">{event.party_name || event.name}</p>
                        {event.party_name && <p className="mt-0.5 text-xs text-text-muted">{event.name}</p>}
                      </td>
                      <td>
                        <span className="inline-flex rounded-lg bg-semantic-indigo/10 px-2 py-1 text-xs font-medium text-semantic-indigo">
                          {event.event_date ? formatDate(event.event_date) : "N/A"}
                        </span>
                      </td>
                      <td className="text-text-muted">
                        {event.booking_date ? formatDate(event.booking_date) : "N/A"}
                      </td>
                      <td className="text-right">
                        <p className="font-mono font-semibold tabular-nums text-text-primary">{formatTaka(paid)}</p>
                        <p className="mt-0.5 text-xs text-text-muted">/ {formatTaka(event.total_amount || 0)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
