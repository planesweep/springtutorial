/**
 * CartIndicator — Client Component.
 * Zeigt Anzahl der Artikel im Warenkorb im Header.
 * Hydration: Server rendert ohne Zahl (SSR), Client ergänzt sie.
 */

'use client'

import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'

export function CartIndicator() {
  const totalItems = useCartStore(s => s.totalItems())

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <span className="text-xl">🛒</span>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </Link>
  )
}
