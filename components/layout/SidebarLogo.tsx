"use client";

import { useLanguage } from '@/components/LanguageProvider'

export function SidebarLogo() {
  const { t } = useLanguage()
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 flex items-center justify-center text-white bg-brand-primary rounded-lg font-bold text-sm shadow-glow-brand">R</div>
      <div>
        <h2 className="text-sm font-semibold text-text-primary tracking-tight uppercase">{t("rajdarbar")}</h2>
        <p className="text-[0.5625rem] text-text-muted tracking-widest uppercase">{t("conventionHall")}</p>
      </div>
    </div>
  )
}
