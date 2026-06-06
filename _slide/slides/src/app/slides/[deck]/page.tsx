import { notFound } from "next/navigation";
import { getDeck, getAllSlugs } from "@/data/slides";
import { Deck } from "@/components/slides/Deck";

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
  return { title: deck ? `${deck.title} — Slides` : "Not Found" };
}

export default async function DeckPage({
  params,
}: {
  params: Promise<{ deck: string }>;
}) {
  const { deck: slug } = await params;
  const deck = getDeck(slug);
  if (!deck) notFound();

  return <Deck deck={deck} />;
}
