"use client";

import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { SourceBadge } from "./SourceBadge";
import type { NewsItem } from "@/lib/types";

interface NewsletterContentProps {
  date: string;
  items: NewsItem[];
  sources: string[];
  itemCount: number;
}

function pickHighlights(items: NewsItem[]): NewsItem[] {
  const scored = items.map((item) => {
    let score = 0;
    if (item.summary && item.summary.length > 80) score += 2;
    if (item.source === "GitHub claude-code Releases") score += 3;
    if (item.source === "Hacker News") score += 1;
    if (item.title.length > 30) score += 1;
    return { item, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map((s) => s.item);
}

function HighlightCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-5 rounded-xl border border-border-light bg-bg-card hover:bg-bg-card-hover transition-all duration-200 group"
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-accent font-bold text-sm">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-text-primary leading-snug mb-2 group-hover:text-link transition-colors">
            {item.title}
          </h3>
          {item.summary && (
            <p className="text-sm text-text-secondary leading-relaxed mb-3 line-clamp-3">
              {item.summary}
            </p>
          )}
          <div className="flex items-center gap-2">
            <SourceBadge source={item.source} active />
            <span className="text-xs text-text-muted font-mono">{item.date}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

function LinkRow({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 py-2 px-1 rounded hover:bg-bg-card transition-colors group"
    >
      <SourceBadge source={item.source} active />
      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors truncate flex-1">
        {item.title}
      </span>
      <svg className="w-3.5 h-3.5 text-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

export function NewsletterContent({ date, items, sources, itemCount }: NewsletterContentProps) {
  const { locale } = useLocale();

  const highlights = pickHighlights(items);
  const releases = items.filter((i) => i.source === "GitHub claude-code Releases");
  const community = items.filter((i) => i.source !== "GitHub claude-code Releases");

  return (
    <article className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10 pb-8 border-b border-border">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          {t("nl.title", locale)}
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-2 font-mono">{date}</h1>
        <p className="text-text-muted text-sm">{t("nl.subtitle", locale)}</p>
        <div className="flex justify-center items-center gap-3 mt-4 text-xs text-text-muted">
          <span>{itemCount} {t("home.items", locale)}</span>
          <span className="w-1 h-1 rounded-full bg-border-light" />
          {sources.map((s) => (
            <SourceBadge key={s} source={s} active />
          ))}
        </div>
      </div>

      {/* Highlights */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-accent">*</span>
          {t("nl.highlights", locale)}
        </h2>
        <div className="space-y-3">
          {highlights.map((item, i) => (
            <HighlightCard key={i} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* Releases */}
      {releases.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="text-source-github">*</span>
            {t("nl.releases", locale)}
          </h2>
          <div className="space-y-3">
            {releases.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover transition-all group"
              >
                <h3 className="text-sm font-semibold text-text-primary mb-2 group-hover:text-source-github transition-colors">
                  {item.title}
                </h3>
                {item.summary && (
                  <p className="text-xs text-text-muted leading-relaxed font-mono whitespace-pre-wrap line-clamp-4">
                    {item.summary}
                  </p>
                )}
                <div className="mt-2 text-xs text-text-muted font-mono">{item.date}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Community */}
      {community.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="text-source-devto">*</span>
            {t("nl.community", locale)}
          </h2>
          <div className="space-y-3">
            {community.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover transition-all group"
              >
                <h3 className="text-sm font-semibold text-text-primary mb-1 group-hover:text-link transition-colors">
                  {item.title}
                </h3>
                {item.summary && (
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2 mb-2">
                    {item.summary}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <SourceBadge source={item.source} active />
                  <span className="text-[11px] text-text-muted font-mono">{item.date}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* All Links */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-text-primary mb-4">
          {t("nl.allLinks", locale)}
        </h2>
        <div className="border border-border rounded-xl p-4 divide-y divide-border">
          {items.map((item, i) => (
            <LinkRow key={i} item={item} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-border text-xs text-text-muted">
        <p>Claude Code News - {t("nl.subtitle", locale)}</p>
        <p className="mt-1">Auto-generated on {date}</p>
      </footer>
    </article>
  );
}
