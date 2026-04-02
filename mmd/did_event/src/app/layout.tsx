// src/app/layout.tsx
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import { Providers } from './providers'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import PwaManager from '@/components/pwa/PwaManager'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'
import JxcHeader from '@/components/JxcHeader'
import enTranslations from '@/lib/i18n/locales/en.json'
import { isJxcRequest } from '@/lib/jxc-context'

const siteUrl =
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3020");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "100万人DAO",
    template: "%s | 100万人DAO",
  },
  description: "イベント・コミュニティ・クエストをDID/VCで運用できるプラットフォーム",
  manifest: '/manifest.json',
  openGraph: {
    title: "100万人DAO",
    description: "イベント・コミュニティ・クエストをDID/VCで運用できるプラットフォーム",
    url: "/",
    siteName: "100万人DAO",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "100万人DAO",
    description: "イベント・コミュニティ・クエストをDID/VCで運用できるプラットフォーム",
  },
}

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale')?.value;
  const initialLocale = localeCookie === 'en' ? 'en' : 'ja';
  const jxc = await isJxcRequest();

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={jxc ? "JXC" : "100万人DAO"} />
        <link rel="apple-touch-icon" href="/logo-100dao.png" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body {...(jxc ? { 'data-jxc': '' } : {})}>
        <Providers initialLocale={initialLocale} initialTranslations={initialLocale === 'en' ? enTranslations : undefined}>
          <ServiceWorkerRegister />
          <PwaManager />
          {jxc && <JxcHeader />}
          <LayoutWithSidebar>{children}</LayoutWithSidebar>
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
