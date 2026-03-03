import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "西和園芸 | 奈良県香芝市の花屋",
    template: "%s | 西和園芸",
  },
  description:
    "奈良県香芝市の花屋「西和園芸」。花束、アレンジメント、ウェディングフラワー、鉢物、ガーデニング用品を取り揃えております。お電話でのご注文・ご相談お気軽にどうぞ。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "西和園芸",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
