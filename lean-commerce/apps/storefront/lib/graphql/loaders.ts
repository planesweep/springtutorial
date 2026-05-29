/**
 * Per-Request DataLoader — behebt das N+1-Problem bei der Cart-Auflösung.
 *
 * FakeStore hat keinen Batch-Endpoint. Statt N Einzel-Requests (einen pro
 * Warenkorb-Position) lädt die Batch-Funktion EINMAL den kompletten Katalog
 * (~20 Produkte) und indexiert ihn nach ID. Damit kollabieren beliebig viele
 * Produkt-Lookups innerhalb einer GraphQL-Operation auf genau einen Request.
 *
 * Zusätzlicher Effekt: DataLoader dedupliziert. Fragen `Cart.subtotal` UND
 * `CartLine.product` dasselbe Produkt an, wird es nur einmal aufgelöst.
 *
 * WICHTIG: Loader werden pro Request erzeugt (siehe context.ts), damit der
 * Cache nicht zwischen verschiedenen Nutzern geteilt wird.
 */

import DataLoader from 'dataloader'
import { FakeStoreAPI, type FakeStoreProduct } from './datasources/FakeStoreAPI'

export function createProductLoader(): DataLoader<number, FakeStoreProduct | null> {
  return new DataLoader<number, FakeStoreProduct | null>(async (ids) => {
    // Ein einziger HTTP-Request für den gesamten Katalog
    const all = await FakeStoreAPI.getProducts()
    const byId = new Map(all.map((p) => [p.id, p]))
    // DataLoader verlangt: Rückgabe-Array in exakt gleicher Reihenfolge wie `ids`
    return ids.map((id) => byId.get(id) ?? null)
  })
}

export interface Loaders {
  product: DataLoader<number, FakeStoreProduct | null>
}

export function createLoaders(): Loaders {
  return { product: createProductLoader() }
}
