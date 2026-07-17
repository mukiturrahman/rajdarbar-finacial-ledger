"use client";

import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";

export function DashboardHeader() {
  const { t } = useLanguage();

  return (
    <header className="page-header !block">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate">{t("dashboard")}</h1>
          <p className="mt-0.5 truncate text-[0.8125rem] text-text-muted">{t("financialOverview")}</p>
        </div>
        <Link href="/events/new" className="btn-primary shrink-0 whitespace-nowrap !px-3 md:!px-5">
          <CalendarPlus size={17} />
          <span>{t("newEvent")}</span>
        </Link>
      </div>
    </header>
  );
}
