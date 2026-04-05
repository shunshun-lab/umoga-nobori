import type { Metadata, Viewport } from "next";
import { Geist_Mono, Noto_Sans_JP } from "next/font/google";
import Link from "next/link";
import { ChatButton } from "@/components/ChatButton";
import "katex/dist/katex.min.css";
import "./globals.css";

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "輪読ノート", template: "%s | 輪読" },
  description:
    "Computational Science and Engineering（Gilbert Strang）輪読メモ・単語帳",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/90 supports-[padding:max(0px)]:pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex h-12 max-w-3xl items-center px-4 sm:px-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          輪読
        </Link>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${noto.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-zinc-900 dark:text-zinc-100">
        <div className="flex min-h-full flex-col">
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <ChatButton />
        </div>
      </body>
    </html>
  );
}
