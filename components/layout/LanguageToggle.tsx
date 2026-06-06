"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageProvider";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-bg-void border border-border p-1 rounded-md w-full">
      <button
        onClick={() => setLanguage("en")}
        className={`flex-1 px-3 py-1.5 text-[0.6875rem] font-bold rounded-sm transition-colors uppercase tracking-wider ${
          language === "en" ? "bg-brand-primary text-white" : "text-text-muted hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("bn")}
        className={`flex-1 px-3 py-1.5 text-[0.6875rem] font-bold rounded-sm transition-colors uppercase tracking-wider ${
          language === "bn" ? "bg-brand-primary text-white" : "text-text-muted hover:text-white"
        }`}
      >
        BN
      </button>
    </div>
  );
}
