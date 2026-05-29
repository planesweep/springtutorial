/**
 * Server Action: Checkout
 *
 * 'use server' markiert diese Datei als Server-only.
 * Die Funktion kann direkt aus Client Components aufgerufen werden —
 * Next.js generiert automatisch einen verschlüsselten POST-Endpunkt.
 *
 * Kein manueller API-Route nötig. Type-safe end-to-end.
 */

'use server'

import { revalidatePath } from 'next/cache'
import type { CartLine } from '@/lib/store/cart'

export async function checkoutAction(lines: CartLine[]) {
  // Im echten Shop: Bestellung an Commerce Monolith senden
  // Hier: Demo-Log + kurze Verzögerung (simuliert API-Call)
  await new Promise(res => setTimeout(res, 800))

  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)

  // eslint-disable-next-line no-console -- Demo: Bestellung serverseitig protokollieren
  console.log('[Server Action] Checkout:', {
    lines: lines.map(l => ({ id: l.productId, title: l.title, qty: l.quantity })),
    total: total.toFixed(2),
    timestamp: new Date().toISOString(),
  })

  // Cache der Cart-Seite invalidieren
  revalidatePath('/cart')

  return { success: true, orderId: `ORD-${Date.now()}`, total }
}
