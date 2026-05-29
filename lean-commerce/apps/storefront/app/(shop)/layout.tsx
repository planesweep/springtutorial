/**
 * Shop Route Group Layout — Header + Footer für alle /products, /search etc.
 *
 * Route Groups (eingeklammerte Ordner) teilen ein Layout ohne die URL zu ändern.
 * (shop) → /products, /search, /cart, /weather teilen dieses Layout.
 */

import Link from 'next/link'
import { CartIndicator } from '@/components/cart/CartIndicator'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Lean Commerce
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/products" className="hover:text-blue-600 transition-colors">Produkte</Link>
            <Link href="/search?q=phone" className="hover:text-blue-600 transition-colors">Suche</Link>
            <Link href="/weather" className="hover:text-blue-600 transition-colors">Wetter</Link>
          </nav>
          <CartIndicator />
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        Demo · Next.js 14 · GraphQL Yoga · Open-Meteo · FakeStore · DummyJSON · Hive
      </footer>
    </div>
  )
}
