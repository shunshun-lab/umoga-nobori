import { getAllDates, getDigestByDate } from "@/lib/content";
import { NewsContent } from "@/components/NewsItem";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ date: string }>;
}

export async function generateStaticParams() {
  return getAllDates().map((date) => ({ date }));
}

export async function generateMetadata({ params }: PageProps) {
  const { date } = await params;
  return {
    title: `Claude Code News - ${date}`,
  };
}

export default async function DigestPage({ params }: PageProps) {
  const { date } = await params;
  const digest = await getDigestByDate(date);

  if (!digest) notFound();

  const allDates = getAllDates();
  const currentIdx = allDates.indexOf(date);
  const prevDate = currentIdx < allDates.length - 1 ? allDates[currentIdx + 1] : null;
  const nextDate = currentIdx > 0 ? allDates[currentIdx - 1] : null;

  return (
    <div>
      <Link
        href="/"
        className="inline-block mb-6 text-sm text-text-muted hover:text-text-secondary transition-colors"
      >
        &larr; Back to all digests
      </Link>

      <div className="mb-6">
        <time className="text-sm font-mono text-accent">{digest.date}</time>
        <div className="mt-1 text-xs text-text-muted">
          {digest.itemCount} items collected
        </div>
      </div>

      <NewsContent html={digest.html} />

      <nav className="mt-12 pt-6 border-t border-border flex justify-between text-sm">
        {prevDate ? (
          <Link href={`/${prevDate}`} className="text-link hover:text-link-hover">
            &larr; {prevDate}
          </Link>
        ) : (
          <span />
        )}
        {nextDate ? (
          <Link href={`/${nextDate}`} className="text-link hover:text-link-hover">
            {nextDate} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
