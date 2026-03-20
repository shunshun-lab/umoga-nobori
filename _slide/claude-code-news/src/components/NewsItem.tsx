import type { NewsItem } from "@/lib/types";
import { SourceBadge } from "./SourceBadge";

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover hover:border-border-light transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-text-primary leading-snug group-hover:text-link transition-colors">
          {item.title}
        </h3>
        <span className="shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5 text-text-muted group-hover:text-link transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </span>
      </div>
      {item.summary && (
        <p className="text-xs text-text-muted leading-relaxed mb-3 line-clamp-2">
          {item.summary}
        </p>
      )}
      <div className="flex items-center gap-2">
        <SourceBadge source={item.source} />
        {item.date && (
          <span className="text-[11px] text-text-muted font-mono">{item.date}</span>
        )}
      </div>
    </a>
  );
}
