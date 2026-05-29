/**
 * SearchResults — async Server Component.
 * Ruft DummyJSON /products/search auf und zeigt Treffer + Facetten.
 */

import { DummyJsonAPI } from '@/lib/graphql/datasources/DummyJsonAPI'
import { encodeProductId } from '@/lib/product-id'
import { ProductCard } from '@/components/product/ProductCard'

interface Props {
  query: string
  category?: string
  includeWeatherRecs?: boolean
}

export async function SearchResults({ query, category, includeWeatherRecs }: Props) {
  const result = category
    ? await DummyJsonAPI.getProductsByCategory(category, { limit: 20 })
    : await DummyJsonAPI.searchProducts({ q: query, limit: 20 })

  // Facetten aus Treffern aggregieren
  const categoryMap = new Map<string, number>()
  result.products.forEach(p => categoryMap.set(p.category, (categoryMap.get(p.category) ?? 0) + 1))

  return (
    <div className="space-y-6">
      {/* Ergebnis-Info + Facetten */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-500">
          {result.total} Treffer für „{query}&ldquo;
        </span>
        {Array.from(categoryMap.entries()).map(([cat, count]) => (
          <a
            key={cat}
            href={`/search?q=${query}&category=${cat}`}
            className="px-3 py-1 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-700 rounded-full text-xs transition-colors"
          >
            {cat} ({count})
          </a>
        ))}
      </div>

      {result.products.length === 0 ? (
        <p className="text-center py-12 text-gray-400">Keine Treffer gefunden.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {result.products.map(p => (
            <ProductCard
              key={p.id}
              id={encodeProductId('dummyjson', p.id)}
              title={p.title}
              price={p.price}
              image={p.thumbnail}
              category={p.category}
              rating={p.rating}
            />
          ))}
        </div>
      )}
    </div>
  )
}
