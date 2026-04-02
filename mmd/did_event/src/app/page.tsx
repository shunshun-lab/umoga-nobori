import type { Metadata } from "next";
import Header from "@/components/Header";
import HomePageClient from "@/components/homepage/HomePageClient";

export const metadata: Metadata = {
  title: "ホーム",
  description: "100万人DAOのイベント・コミュニティ・クエストを探す",
};

export default function Home() {
  return (
    <>
      <Header />
      <HomePageClient />
    </>
  );
}
