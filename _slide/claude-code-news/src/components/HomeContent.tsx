"use client";

import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { DigestCard } from "./DigestCard";
import type { Digest } from "@/lib/types";

interface HomeContentProps {
  digests: Digest[];
  totalItems: number;
}

export function HomeContent({ digests, totalItems }: HomeContentProps) {
  const { locale } = useLocale();

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          {t("home.title", locale)}
        </h1>
        <p className="text-text-secondary text-sm leading-relaxed mb-4">
          {t("home.desc", locale)}
        </p>
        {digests.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>{digests.length} {t("home.digests", locale)}</span>
            <span className="w-1 h-1 rounded-full bg-border-light" />
            <span>{totalItems} {t("home.totalItems", locale)}</span>
          </div>
        )}
      </div>

      {digests.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">{t("home.noDigests", locale)}</p>
          <p className="text-sm">
            {t("home.runCollect", locale).replace(
              "{cmd}",
              ""
            )}
            <code className="px-1.5 py-0.5 bg-border rounded text-text-secondary">npm run collect</code>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {digests.map((digest) => {
            const sources = [...new Set(digest.items.map((i) => i.source))];
            return (
              <DigestCard
                key={digest.date}
                date={digest.date}
                title={digest.title}
                itemCount={digest.itemCount}
                sources={sources}
                topItems={digest.items}
                locale={locale}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
