/**
 * FeaturedProducts — Top-8 Produkte für die Homepage.
 * Async Server Component — wird via Suspense gestreamt.
 */

import { FakeStoreAPI } from '@/lib/graphql/datasources/FakeStoreAPI'
import { ProductCard } from './ProductCard'

export async function FeaturedProducts() {
  const products = await FakeStoreAPI.getProducts({ limit: 8 })

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map(p => (
        <ProductCard
          key={p.id}
          id={String(p.id)}
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
