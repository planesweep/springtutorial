/**
 * AddToCartButton — Client Component (benötigt useCartStore Hook).
 * Optimistic UI: Button-Text wechselt sofort, kein Reload.
 * 'use client' isoliert Interaktivität auf diese Komponente.
 */

'use client'

import { useCartStore } from '@/lib/store/cart'
import { useState } from 'react'

interface Props {
  productId: number
  productTitle: string
  price: number
  image?: string
}

export function AddToCartButton({ productId, productTitle, price, image = '' }: Props) {
  const addLine = useCartStore(s => s.addLine)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addLine({ productId, title: productTitle, price, image })
    // Optimistic UI: sofort "Hinzugefügt" zeigen, nach 1.5s zurücksetzen
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full py-3 rounded-xl font-semibold transition-all ${
        added
          ? 'bg-green-500 text-white'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
      }`}
    >
      {added ? '✓ Hinzugefügt' : 'In den Warenkorb'}
    </button>
  )
}
