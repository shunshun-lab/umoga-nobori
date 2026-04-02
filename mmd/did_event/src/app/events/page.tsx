import type { Metadata } from "next";
import EventsClientPage from "./EventsClientPage";

export const metadata: Metadata = {
  title: "イベント",
  description: "イベントを探す・参加する",
  openGraph: {
    title: "イベント",
    description: "イベントを探す・参加する",
    url: "/events",
  },
  twitter: {
    title: "イベント",
    description: "イベントを探す・参加する",
  },
};

export default function EventsPage() {
  return <EventsClientPage />;
}

