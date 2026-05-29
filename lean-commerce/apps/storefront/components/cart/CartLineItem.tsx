'use client'

import { useCartStore, CartLine } from '@/lib/store/cart'

export function CartLineItem({ line }: { line: CartLine }) {
  const { updateQuantity, removeLine } = useCartStore()

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{line.title}</p>
        <p className="text-sm text-gray-500">€{line.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(line.productId, line.quantity - 1)}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
        >
          −
        </button>
        <span className="w-6 text-center text-sm">{line.quantity}</span>
        <button
          onClick={() => updateQuantity(line.productId, line.quantity + 1)}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
        >
          +
        </button>
      </div>
      <div className="text-sm font-semibold w-20 text-right">
        €{(line.price * line.quantity).toFixed(2)}
      </div>
      <button
        onClick={() => removeLine(line.productId)}
        className="text-gray-300 hover:text-red-400 transition-colors ml-2"
      >
        ✕
      </button>
    </div>
  )
}
