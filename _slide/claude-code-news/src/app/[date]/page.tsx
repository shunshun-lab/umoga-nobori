import { getAllDates, getDigestByDate } from "@/lib/content";
import { DigestContent } from "@/components/DigestContent";
import { BackLink } from "@/components/BackLink";
import { NewsletterLink } from "@/components/NewsletterLink";
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

  const sources = [...new Set(digest.items.map((i) => i.source))];

  return (
    <div>
      <BackLink />

      <div className="flex items-center justify-between mb-2">
        <time className="text-lg font-mono text-accent font-medium">{digest.date}</time>
        <NewsletterLink date={date} />
      </div>

      <DigestContent
        items={digest.items}
        sources={sources}
        itemCount={digest.itemCount}
      />

      <nav className="mt-12 pt-6 border-t border-border flex justify-between text-sm">
        {prevDate ? (
          <Link href={`/${prevDate}`} className="flex items-center gap-1 text-link hover:text-link-hover transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {prevDate}
          </Link>
        ) : (
          <span />
        )}
        {nextDate ? (
          <Link href={`/${nextDate}`} className="flex items-center gap-1 text-link hover:text-link-hover transition-colors">
            {nextDate}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
