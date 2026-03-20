"use client";

import { useState } from "react";
import type { NewsItem } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";
import { NewsCard } from "./NewsItem";
import { SourceBadge } from "./SourceBadge";

interface DigestContentProps {
  items: NewsItem[];
  sources: string[];
  itemCount: number;
}

export function DigestContent({ items, sources, itemCount }: DigestContentProps) {
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const { locale } = useLocale();

  const filtered = activeSource
    ? items.filter((i) => i.source === activeSource)
    : items;

  const bySource = new Map<string, NewsItem[]>();
  for (const item of filtered) {
    const list = bySource.get(item.source) ?? [];
    list.push(item);
    bySource.set(item.source, list);
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-text-secondary">
            {activeSource ? `${filtered.length} / ${itemCount}` : `${itemCount}`} {t("digest.itemsFrom", locale)}
          </span>
          {sources.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSource(activeSource === s ? null : s)}
              className="cursor-pointer"
            >
              <SourceBadge
                source={s}
                active={activeSource === null || activeSource === s}
              />
            </button>
          ))}
          {activeSource && (
            <button
              onClick={() => setActiveSource(null)}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors ml-1 cursor-pointer"
            >
              {t("digest.clear", locale)}
            </button>
          )}
        </div>
      </div>

      {[...bySource.entries()].map(([source, sourceItems]) => (
        <section key={source} className="mb-8">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
            <SourceBadge source={source} active />
            <span className="text-xs text-text-muted">{sourceItems.length} {t("digest.items", locale)}</span>
          </div>
          <div className="space-y-2">
            {sourceItems.map((item, i) => (
              <NewsCard key={i} item={item} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
