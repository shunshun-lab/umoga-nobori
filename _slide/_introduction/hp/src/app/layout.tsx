import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "./_components/SiteNav";
import { SiteFooter } from "./_components/SiteFooter";

export const metadata: Metadata = {
  title: "Shunsuke Takagi — Introduction Map",
  description:
    "人とエネルギーを軸に、コミュニティ・システム・メディア・プロダクトを長期で編んでいくための『森の地図』。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased bg-slate-950 text-slate-50">
        <div className="min-h-screen flex flex-col">
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
