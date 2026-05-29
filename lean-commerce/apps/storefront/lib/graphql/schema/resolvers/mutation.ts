/**
 * Mutation Resolver — schreibende Operationen.
 *
 * Login:      DummyJSON /auth/login → JWT zurückgeben
 * Cart*:      FakeStore API /carts (POST/PUT)
 */

import { FakeStoreAPI } from '../../datasources/FakeStoreAPI'
import { DummyJsonAPI } from '../../datasources/DummyJsonAPI'
import { GraphQLError } from 'graphql'

export const mutationResolvers = {
  Mutation: {
    /**
     * Login via DummyJSON.
     * Test-Credentials: emilys / emilyspass
     * Rückgabe: accessToken + refreshToken + User
     */
    login: async (_: unknown, args: { input: { username: string; password: string } }) => {
      try {
        const result = await DummyJsonAPI.login(args.input.username, args.input.password)
        return {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            id: String(result.id),
            firstName: result.firstName,
            lastName: result.lastName,
            email: result.email,
            username: result.username,
            avatarUrl: result.image,
          },
        }
      } catch {
        throw new GraphQLError('Ungültige Zugangsdaten', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }
    },

    /** Neuen Warenkorb bei FakeStore anlegen. */
    cartCreate: async (_: unknown, args: { userId?: number }) => {
      const cart = await FakeStoreAPI.createCart(args.userId ?? 1, [])
      return {
        id: String(cart.id),
        userId: cart.userId,
        date: cart.date,
        lines: [],
        subtotal: 0,
        totalItems: 0,
      }
    },

    /** Produkte zum Warenkorb hinzufügen (FakeStore PUT /carts/:id). */
    cartLinesAdd: async (
      _: unknown,
      args: { cartId: string; lines: Array<{ productId: number; quantity: number }> },
    ) => {
      const updated = await FakeStoreAPI.updateCart(parseInt(args.cartId, 10), args.lines)
      return {
        id: String(updated.id),
        userId: updated.userId,
        date: updated.date,
        lines: updated.products.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
          product: null,
        })),
        subtotal: 0,  // Field Resolver berechnet echten Wert
        totalItems: updated.products.reduce((sum, p) => sum + p.quantity, 0),
      }
    },

    /** Warenkorb-Mengen aktualisieren. */
    cartLinesUpdate: async (
      _: unknown,
      args: { cartId: string; lines: Array<{ productId: number; quantity: number }> },
    ) => {
      const updated = await FakeStoreAPI.updateCart(parseInt(args.cartId, 10), args.lines)
      return {
        id: String(updated.id),
        userId: updated.userId,
        date: updated.date,
        lines: updated.products.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
          product: null,
        })),
        subtotal: 0,
        totalItems: updated.products.reduce((sum, p) => sum + p.quantity, 0),
      }
    },
  },
}
