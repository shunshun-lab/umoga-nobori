import { notFound } from "next/navigation";
import { getDeck, getAllSlugs } from "@/data/slides";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { PrintButton } from "@/components/slides/PrintButton";
import Link from "next/link";

export function generateStaticParams() {
  return getAllSlugs().map((deck) => ({ deck }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ deck: string }>;
}) {
  const { deck: slug } = await params;
  const deck = getDeck(slug);
  return { title: deck ? `${deck.title} — Print` : "Not Found" };
}

export default async function PrintPage({
  params,
}: {
  params: Promise<{ deck: string }>;
}) {
  const { deck: slug } = await params;
  const deck = getDeck(slug);
  if (!deck) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation – hidden in print */}
      <div className="no-print sticky top-0 z-50 flex items-center justify-between border-b bg-slate-950 px-6 py-3 text-sm text-slate-300">
        <Link href={`/slides/${deck.slug}`} className="hover:text-white transition-colors">
          ← Present
        </Link>
        <span className="font-medium text-white">{deck.title}</span>
        <PrintButton />
      </div>

      {/* All slides stacked */}
      <div className="mx-auto max-w-5xl py-8 space-y-8 px-4">
        {deck.slides.map((slide, i) => (
          <div key={i} className="print-slide">
            <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-200 shadow-sm">
              <SlideRenderer slide={slide} theme={deck.theme} />
            </div>
            <p className="mt-2 text-right text-xs text-slate-400 tabular-nums no-print">
              {i + 1} / {deck.slides.length}
            </p>
          </div>
        ))}

        {/* Credits section */}
        {deck.credits && deck.credits.length > 0 && (
          <div className="print-slide mt-12 border-t border-slate-200 pt-8">
            <h2 className="mb-4 text-lg font-bold text-slate-700">画像・引用元</h2>
            <ul className="space-y-2 text-xs text-slate-500">
              {deck.credits.map((c, i) => (
                <li key={i}>
                  <span className="font-medium text-slate-600">{c.context}</span>
                  {" — "}
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">
                      {c.attribution}
                    </a>
                  ) : (
                    c.attribution
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
