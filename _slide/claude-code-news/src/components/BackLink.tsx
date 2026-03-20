"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function BackLink() {
  const { locale } = useLocale();

  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1 mb-6 text-sm text-text-muted hover:text-text-secondary transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {t("digest.back", locale)}
    </Link>
  );
}
