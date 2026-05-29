/**
 * FeaturedProducts — Top-8 Produkte für die Homepage.
 * Async Server Component — wird via Suspense gestreamt.
 */

import { FakeStoreAPI } from '@/lib/graphql/datasources/FakeStoreAPI'
import { encodeProductId } from '@/lib/product-id'
import { ProductCard } from './ProductCard'

export async function FeaturedProducts() {
  let products: Awaited<ReturnType<typeof FakeStoreAPI.getProducts>>
  try {
    products = await FakeStoreAPI.getProducts({ limit: 8 })
  } catch {
    // FakeStore beim Prerender nicht erreichbar → leeren Hinweis rendern
    return (
      <p className="text-gray-400 text-sm">
        Produkte momentan nicht verfügbar (FakeStore nicht erreichbar).
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map(p => (
        <ProductCard
          key={p.id}
          id={encodeProductId('fakestore', p.id)}
          title={p.title}
          price={p.price}
          image={p.image}
          category={p.category}
          rating={p.rating.rate}
        />
      ))}
    </div>
  )
}
