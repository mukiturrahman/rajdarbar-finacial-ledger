"use client";

import React from "react";
import { useLanguage } from "./LanguageProvider";
import { Button } from "./ui/button";

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex w-full justify-end px-4 md:px-8 py-3">
      <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-md glass-sm">
        <button
          onClick={() => setLanguage("en")}
          className={`px-3 py-1 text-sm font-medium rounded-sm transition-colors ${
            language === "en" ? "bg-white/20 text-white" : "text-text-muted hover:text-white"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage("bn")}
          className={`px-3 py-1 text-sm font-medium rounded-sm transition-colors ${
            language === "bn" ? "bg-white/20 text-white" : "text-text-muted hover:text-white"
          }`}
        >
          BN
        </button>
      </div>
    </div>
  );
}
