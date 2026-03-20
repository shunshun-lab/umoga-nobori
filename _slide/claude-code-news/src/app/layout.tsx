import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { LocaleProvider } from "@/components/LocaleProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Claude Code News",
  description:
    "Daily auto-collected Claude Code news from Anthropic Blog, GitHub Releases, Hacker News, Reddit, Dev.to.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-bg-primary text-text-primary min-h-screen`}
      >
        <LocaleProvider>
          <Header />
          <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
        </LocaleProvider>
      </body>
    </html>
  );
}
