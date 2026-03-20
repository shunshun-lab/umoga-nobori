import { getAllDates, getDigestByDate } from "@/lib/content";
import { NewsletterContent } from "@/components/NewsletterContent";
import { BackLink } from "@/components/BackLink";
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
    title: `Claude Code Newsletter - ${date}`,
  };
}

export default async function NewsletterPage({ params }: PageProps) {
  const { date } = await params;
  const digest = await getDigestByDate(date);

  if (!digest) notFound();

  const sources = [...new Set(digest.items.map((i) => i.source))];

  return (
    <div>
      <BackLink />
      <NewsletterContent
        date={digest.date}
        items={digest.items}
        sources={sources}
        itemCount={digest.itemCount}
      />
    </div>
  );
}
