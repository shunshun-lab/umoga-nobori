"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function Header() {
  const { locale, toggle } = useLocale();

  return (
    <header className="border-b border-border bg-bg-secondary/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-source-anthropic to-accent flex items-center justify-center">
            <span className="text-white font-bold text-xs">CC</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-text-primary">
            Claude Code News
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-source-github animate-pulse" />
            {t("header.subtitle", locale)}
          </div>
          <button
            onClick={toggle}
            className="px-2 py-0.5 rounded border border-border-light text-[11px] font-medium text-text-muted hover:text-text-secondary hover:border-text-muted transition-colors cursor-pointer"
          >
            {locale === "en" ? "JP" : "EN"}
          </button>
        </div>
      </div>
    </header>
  );
}
