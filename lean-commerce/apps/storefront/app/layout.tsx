/**
 * Root Layout — wird von allen Seiten geteilt.
 *
 * Demonstriert Next.js Features:
 *  - next/font: Schriften werden build-time optimiert (kein Layout Shift)
 *  - Metadata API: SEO-Tags zentral verwaltet
 *  - viewport: separate Export für Viewport-Einstellungen
 */

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Inter-Font: subsets + display swap = optimales Web Font Loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Metadata API: steuert <head> Inhalte (title, description, OG, Twitter)
export const metadata: Metadata = {
  title: {
    template: '%s | Lean Commerce Demo',
    default: 'Lean Commerce Demo',
  },
  description:
    'Demo-Shop: Next.js 14 · GraphQL Yoga BFF · Open-Meteo · FakeStore API · DummyJSON · Hive',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'Lean Commerce Demo',
  },
}

// Viewport als separater Export (Next.js 14 Anforderung)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
