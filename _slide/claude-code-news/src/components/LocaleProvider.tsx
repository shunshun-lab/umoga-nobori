"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

const LocaleContext = createContext<{
  locale: Locale;
  toggle: () => void;
}>({ locale: "en", toggle: () => {} });

export function useLocale() {
  return useContext(LocaleContext);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved === "en" || saved === "ja") {
      setLocale(saved);
    }
  }, []);

  const toggle = () => {
    const next = locale === "en" ? "ja" : "en";
    setLocale(next);
    localStorage.setItem("locale", next);
  };

  return (
    <LocaleContext.Provider value={{ locale, toggle }}>
      {children}
    </LocaleContext.Provider>
  );
}
