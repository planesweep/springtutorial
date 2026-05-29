/**
 * Warenkorb-State — Zustand Store
 *
 * Zustand ist eine minimalistische State-Management-Bibliothek.
 * Kein Redux-Boilerplate: ein Hook, ein Store.
 *
 * Persist Middleware: State überlebt Browser-Refresh (localStorage).
 * Immer Middleware: Erlaubt mutierenden Code (intern unveränderlich).
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface CartLine {
  /** Composite Product-ID (z.B. "fakestore_5") — eindeutig über beide Quellen. */
  productId: string
  title: string
  price: number
  image: string
  quantity: number
}

interface CartStore {
  lines: CartLine[]
  addLine: (item: Omit<CartLine, 'quantity'> & { quantity?: number }) => void
  removeLine: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    immer((set, get) => ({
      lines: [],

      addLine: (item) =>
        set(state => {
          const existing = state.lines.find(l => l.productId === item.productId)
          if (existing) {
            existing.quantity += item.quantity ?? 1
          } else {
            state.lines.push({ ...item, quantity: item.quantity ?? 1 })
          }
        }),

      removeLine: (productId) =>
        set(state => {
          state.lines = state.lines.filter(l => l.productId !== productId)
        }),

      updateQuantity: (productId, quantity) =>
        set(state => {
          const line = state.lines.find(l => l.productId === productId)
          if (line) {
            if (quantity <= 0) {
              state.lines = state.lines.filter(l => l.productId !== productId)
            } else {
              line.quantity = quantity
            }
          }
        }),

      clearCart: () => set(state => { state.lines = [] }),

      totalItems: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    })),
    {
      name: 'lean-commerce-cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
