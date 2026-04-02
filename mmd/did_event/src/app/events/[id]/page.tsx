import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import EventDetailClientPage from "./EventDetailClientPage";

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(input: string, max = 180): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max - 1)}…`;
}

export async function generateMetadata(
  props: {
    params: Promise<{ id: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: { title: true, description: true, imageUrl: true },
  });

  if (!event) {
    return {
      title: "イベント",
      description: "イベント詳細",
      robots: { index: false, follow: false },
    };
  }

  const description = event.description
    ? truncate(stripHtml(event.description), 180)
    : "イベント詳細";

  const images = event.imageUrl ? [event.imageUrl] : undefined;

  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      url: `/events/${params.id}`,
      type: "article",
      images,
    },
    twitter: {
      title: event.title,
      description,
      images,
    },
  };
}

export default function EventDetailPage() {
  return <EventDetailClientPage />;
}

