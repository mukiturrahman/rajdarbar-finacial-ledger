"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { dictionaries, Language, DictionaryKey } from "@/lib/i18n";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: DictionaryKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("en");

  // Load language from localStorage if available
  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "bn")) {
      setLanguageState(savedLang);
    }
  }, []);

  // Prevent scroll-to-change on number inputs globally by blurring the input on wheel event
  useEffect(() => {
    const handleWheel = () => {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === "INPUT" && (activeEl as HTMLInputElement).type === "number") {
        (activeEl as HTMLInputElement).blur();
      }
    };
    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: DictionaryKey) => {
    return dictionaries[language][key] || dictionaries["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
