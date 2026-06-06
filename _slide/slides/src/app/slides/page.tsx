import { decks } from "@/data/slides";
import { DeckCard } from "@/components/slides/DeckCard";
import { SlidePreview } from "@/components/slides/SlidePreview";
import Link from "next/link";
import { HubTabs } from "./HubTabs";

export const metadata = {
  title: "Slides — Library",
};

export default function SlidesHubPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  return <HubContent searchParams={searchParams} />;
}

async function HubContent({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view = params.view === "expanded" ? "expanded" : "library";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 px-8 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Slides</h1>
        <p className="mt-1 text-sm text-slate-400">
          {decks.length} decks ・{decks.reduce((s, d) => s + d.slides.length, 0)} slides
        </p>
      </header>

      <div className="px-8 py-6">
        <HubTabs current={view} />

        {view === "library" ? <LibraryView /> : <ExpandedView />}
      </div>
    </div>
  );
}

function LibraryView() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => (
        <DeckCard key={deck.slug} deck={deck} />
      ))}
    </div>
  );
}

function ExpandedView() {
  return (
    <div className="space-y-16">
      {decks.map((deck) => (
        <section key={deck.slug}>
          <div className="mb-6 flex items-center gap-4">
            <h2 className="text-xl font-bold">{deck.title}</h2>
            <Link
              href={`/slides/${deck.slug}`}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Present →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {deck.slides.map((slide, i) => (
              <div key={i} className="relative">
                <SlidePreview slide={slide} theme={deck.theme} scale={0.25} />
                <span className="absolute bottom-1 right-2 text-[10px] text-slate-500 tabular-nums">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
