/**
 * Warenkorb — Client Component (vollständig interaktiv)
 *
 * Der Warenkorb-State wird in Zustand Store gehalten (Client-seitig).
 * Keine ISR/SSR — User-spezifisch und hochdynamisch.
 *
 * Server Action: cartCheckout() zeigt das Server Action Pattern.
 */

'use client'

import { useCartStore } from '@/lib/store/cart'
import { CartLineItem } from '@/components/cart/CartLineItem'
import { checkoutAction } from '@/lib/actions/checkout'
import { useTransition } from 'react'

export default function CartPage() {
  const { lines, clearCart } = useCartStore()
  const [isPending, startTransition] = useTransition()

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)

  if (lines.length === 0) {
    return (
      <div className="text-center py-24 space-y-4">
        <div className="text-5xl">🛒</div>
        <h1 className="text-xl font-semibold text-gray-700">Ihr Warenkorb ist leer</h1>
        <a href="/products" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl text-sm">
          Jetzt einkaufen
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Warenkorb</h1>

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        {lines.map(line => (
          <CartLineItem key={line.productId} line={line} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex justify-between text-gray-700">
          <span>Zwischensumme</span>
          <span className="font-semibold">€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-400 text-sm">
          <span>Versand</span>
          <span>kostenlos</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-4">
          <span>Gesamt</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>

        {/*
          Server Action: checkoutAction() läuft auf dem Server.
          Kein API-Route nötig — typsafe, kein CORS.
        */}
        <form
          action={() =>
            startTransition(async () => {
              await checkoutAction(lines)
              clearCart()
            })
          }
        >
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Wird verarbeitet…' : 'Zur Kasse'}
          </button>
        </form>
      </div>
    </div>
  )
}
