/**
 * Type Field Resolver — lösen komplexe Felder auf einzelnen Types auf.
 *
 * Cart.subtotal:       BFF-seitig aus Produktpreisen berechnet
 * Cart.lines.product:  via DataLoader geladen (KEIN N+1 mehr — siehe loaders.ts)
 *
 * Beide nutzen denselben per-Request DataLoader aus dem Context. Dadurch wird
 * der FakeStore-Katalog pro GraphQL-Operation genau EINMAL geladen, egal wie
 * viele Positionen der Warenkorb hat und ob subtotal + product gleichzeitig
 * abgefragt werden.
 */

import { encodeProductId } from '../../../product-id'
import type { GraphQLContext } from '../../context'

export const typeResolvers = {
  Cart: {
    /** Summe aller Positionen: Menge × Preis. Produkte gebündelt via DataLoader. */
    subtotal: async (
      cart: { lines: Array<{ productId: number; quantity: number }> },
      _args: unknown,
      ctx: GraphQLContext,
    ) => {
      const products = await ctx.loaders.product.loadMany(cart.lines.map((l) => l.productId))
      return cart.lines.reduce((sum, line, i) => {
        const p = products[i]
        // loadMany kann pro Eintrag ein Error-Objekt liefern → defensiv prüfen
        const price = p && !(p instanceof Error) ? p.price : 0
        return sum + price * line.quantity
      }, 0)
    },
  },

  CartLine: {
    /** Produkt-Details für jede Cart-Zeile (deduped + gebatcht via DataLoader). */
    product: async (line: { productId: number }, _args: unknown, ctx: GraphQLContext) => {
      const p = await ctx.loaders.product.load(line.productId)
      if (!p) return null
      return {
        id: encodeProductId('fakestore', p.id),
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
