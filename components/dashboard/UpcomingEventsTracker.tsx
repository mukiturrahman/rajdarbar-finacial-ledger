"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Calendar, Trash2, Edit } from "lucide-react";

type EventType = {
  id: string;
  name: string;
  event_type?: string;
  party_name?: string;
  booking_date?: string;
  event_date?: string;
  advance_payment?: number;
  total_amount?: number;
};

import Link from 'next/link';

export function UpcomingEventsTracker({ events = [] }: { events?: EventType[] }) {
  const { t } = useLanguage();

  const handleDelete = (id: string) => {
    if (confirm(t("confirmDelete"))) {
      // API call to delete
      console.log("Delete", id);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="glass w-full">
      <div className="flex flex-row items-center justify-between p-5 border-b border-white/5">
        <h3 className="text-[1.0625rem] font-semibold text-text-primary flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-emerald" />
          {t("upcomingEvents")}
        </h3>
        <Link href="/events/new" className="btn-primary px-4 py-1.5 min-h-0 text-xs">
          {t("newEvent")}
        </Link>
      </div>
      <div className="p-0">
        <div className="table-wrap m-0 border-0 rounded-none bg-transparent shadow-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("partyName")}</th>
                <th>{t("eventDate")}</th>
                <th>{t("bookingDate")}</th>
                <th>{t("advancePayment")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted text-sm">
                    {t("noEvents")}
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  return (
                    <tr key={event.id}>
                      <td className="font-medium text-text-primary">
                        {event.name}
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-semantic-indigo/10 text-semantic-indigo text-xs font-medium">
                          {formatDate(event.event_date)}
                        </span>
                      </td>
                      <td className="text-text-muted">{formatDate(event.booking_date)}</td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-semibold text-text-primary">৳{(event.advance_payment || 0).toLocaleString()}</span>
                          <span className="text-[10px] text-text-muted">/ ৳{(event.total_amount || 0).toLocaleString()}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button className="btn-ghost px-2 py-1 min-w-0 min-h-0 text-text-muted hover:text-brand-emerald">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(event.id)}
                            className="btn-ghost px-2 py-1 min-w-0 min-h-0 text-text-muted hover:text-semantic-red"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
