import Link from "next/link";
import type { NewsItem } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { SourceDot } from "./SourceBadge";

interface DigestCardProps {
  date: string;
  title: string;
  itemCount: number;
  sources: string[];
  topItems: NewsItem[];
  locale: Locale;
}

export function DigestCard({ date, itemCount, sources, topItems, locale }: DigestCardProps) {
  return (
    <Link
      href={`/${date}`}
      className="block p-5 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover hover:border-border-light transition-all duration-200 group"
    >
      <div className="flex items-center justify-between mb-3">
        <time className="text-sm font-mono text-accent font-medium">{date}</time>
        <span className="text-xs px-2.5 py-1 rounded-full bg-border text-text-muted font-medium">
          {itemCount} {t("home.items", locale)}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        {sources.map((s) => (
          <div key={s} className="flex items-center gap-1">
            <SourceDot source={s} />
            <span className="text-[11px] text-text-muted">
              {s.replace("GitHub claude-code ", "").replace("r/ClaudeAI", "Reddit")}
            </span>
          </div>
        ))}
      </div>

      {topItems.length > 0 && (
        <ul className="space-y-1.5">
          {topItems.slice(0, 3).map((item, i) => (
            <li key={i} className="text-xs text-text-secondary leading-snug flex items-start gap-1.5">
              <span className="text-text-muted mt-0.5 shrink-0">-</span>
              <span className="group-hover:text-text-primary transition-colors line-clamp-1">
                {item.title}
              </span>
            </li>
          ))}
          {topItems.length > 3 && (
            <li className="text-[11px] text-text-muted pl-3">
              +{topItems.length - 3} {t("home.more", locale)}
            </li>
          )}
        </ul>
      )}
    </Link>
  );
}
