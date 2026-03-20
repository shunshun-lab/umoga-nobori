"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function NewsletterLink({ date }: { date: string }) {
  const { locale } = useLocale();

  return (
    <Link
      href={`/${date}/newsletter`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent/30 bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
      </svg>
      {t("nl.viewNewsletter", locale)}
    </Link>
  );
}
