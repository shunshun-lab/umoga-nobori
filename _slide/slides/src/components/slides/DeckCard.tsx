import Link from "next/link";
import type { DeckData } from "./types";
import { SlidePreview } from "./SlidePreview";

export function DeckCard({ deck }: { deck: DeckData }) {
  const first = deck.slides[0];
  return (
    <Link
      href={`/slides/${deck.slug}`}
      className="group block rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20 hover:bg-white/[0.04]"
    >
      {/* Preview of first slide */}
      {first && (
        <div className="mb-4">
          <SlidePreview slide={first} theme={deck.theme} scale={0.3} />
        </div>
      )}

      <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
        {deck.title}
      </h3>
      <p className="mt-1 text-sm text-slate-400 line-clamp-2">
        {deck.description}
      </p>

      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
        <span>{deck.slides.length} slides</span>
        {deck.date && <span>{deck.date}</span>}
      </div>
    </Link>
  );
}
