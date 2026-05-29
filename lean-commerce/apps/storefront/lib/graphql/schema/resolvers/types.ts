/**
 * Type Field Resolver — lösen komplexe Felder auf einzelnen Types auf.
 *
 * Cart.subtotal:       wird BFF-seitig aus Produktpreisen berechnet
 * Cart.lines.product:  lazy geladen von FakeStore API (N+1 bewusst im Demo,
 *                      Production: DataLoader nutzen)
 */

import { FakeStoreAPI } from '../../datasources/FakeStoreAPI'

export const typeResolvers = {
  Cart: {
    /** Summe aller Positionen: Menge × Preis, BFF-seitig berechnet. */
    subtotal: async (cart: { lines: Array<{ productId: number; quantity: number }> }) => {
      const prices = await Promise.all(
        cart.lines.map(async line => {
          const product = await FakeStoreAPI.getProductById(line.productId)
          return (product?.price ?? 0) * line.quantity
        }),
      )
      return prices.reduce((sum, p) => sum + p, 0)
    },
  },

  CartLine: {
    /** Produkt-Details für jede Cart-Zeile nachladen (lazy). */
    product: async (line: { productId: number }) => {
      const p = await FakeStoreAPI.getProductById(line.productId)
      if (!p) return null
      return {
        id: String(p.id),
        title: p.title,
        price: p.price,
        description: p.description,
        category: p.category,
        image: p.image,
        rating: { rate: p.rating.rate, count: p.rating.count },
        details: null,
      }
    },
  },
}
