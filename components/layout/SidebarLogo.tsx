"use client";

import { useLanguage } from '@/components/LanguageProvider'

export function SidebarLogo() {
  const { t } = useLanguage()
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ background: 'linear-gradient(135deg, #0d5c3f, #c9a84c)' }}>R</div>
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">{t("rajdarbar")}</h2>
        <p className="text-[0.6875rem] text-text-muted tracking-wider uppercase">{t("conventionHall")}</p>
      </div>
    </div>
  )
}
