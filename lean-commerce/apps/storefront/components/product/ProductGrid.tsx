/**
 * ProductGrid — async Server Component
 * Lädt Produkte von FakeStore API und rendert das Grid.
 * Wird in Suspense eingebettet → streamt nach wenn Daten bereit sind.
 */

import { FakeStoreAPI } from '@/lib/graphql/datasources/FakeStoreAPI'
import { encodeProductId } from '@/lib/product-id'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  category?: string
  sort?: 'asc' | 'desc'
  limit?: number
}

export async function ProductGrid({ category, sort = 'asc', limit }: ProductGridProps) {
  const products = await FakeStoreAPI.getProducts({ category, sort, limit })

  if (products.length === 0) {
    return <p className="text-gray-400 text-center py-12">Keine Produkte gefunden.</p>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
