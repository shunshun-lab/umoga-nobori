// src/app/layout.tsx
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import { Providers } from './providers'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import PwaManager from '@/components/pwa/PwaManager'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'
import enTranslations from '@/lib/i18n/locales/en.json'

export const metadata: Metadata = {
  title: 'MMD DID Event App',
  description: 'Event management system with DID and VC integration',
  manifest: '/manifest.json',
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

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="100万人DAO" />
        <link rel="apple-touch-icon" href="/logo-100dao.png" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body>
        <Providers initialLocale={initialLocale} initialTranslations={initialLocale === 'en' ? enTranslations : undefined}>
          <ServiceWorkerRegister />
          <PwaManager />
          <LayoutWithSidebar>{children}</LayoutWithSidebar>
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
