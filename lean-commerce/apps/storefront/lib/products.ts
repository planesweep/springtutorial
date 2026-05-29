/**
 * Unified Product Loader — normalisiert Produkte aus beiden Quellen
 * (FakeStore + DummyJSON) auf eine einheitliche Form.
 *
 * Wird von Server Components genutzt, die direkt auf die DataSources
 * zugreifen (Produkt-Detailseite, generateMetadata), damit eine Composite-ID
 * eindeutig zur richtigen API aufgelöst wird.
 */

import { FakeStoreAPI } from './graphql/datasources/FakeStoreAPI'
import { DummyJsonAPI } from './graphql/datasources/DummyJsonAPI'
import { decodeProductId, type ProductSource } from './product-id'

export interface UnifiedProduct {
  /** Composite-ID (z.B. "fakestore_5"). */
  id: string
  source: ProductSource
  numericId: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: { rate: number; count: number }
}

/** Lädt ein Produkt anhand seiner Composite-ID aus der korrekten Quelle. */
export async function getUnifiedProduct(compositeId: string): Promise<UnifiedProduct | null> {
  const { source, id } = decodeProductId(compositeId)

  if (source === 'dummyjson') {
    const p = await DummyJsonAPI.getProductById(id)
    if (!p) return null
    return {
      id: compositeId,
      source,
      numericId: id,
      title: p.title,
      price: p.price,
      description: p.description,
      category: p.category,
      image: p.thumbnail,
      rating: { rate: p.rating, count: p.reviews?.length ?? 0 },
    }
  }

  const p = await FakeStoreAPI.getProductById(id)
  if (!p) return null
  return {
    id: compositeId,
    source,
    numericId: id,
    title: p.title,
    price: p.price,
    description: p.description,
    category: p.category,
    image: p.image,
    rating: { rate: p.rating.rate, count: p.rating.count },
  }
}
