"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function DashboardHeader() {
  const { t } = useLanguage();

  return (
    <div className="page-header">
      <div>
        <h1>{t("dashboard")}</h1>
        <p className="text-[0.8125rem] text-text-muted mt-0.5">Rajdarbar Convention Hall · Financial Overview</p>
      </div>
    </div>
  );
}
