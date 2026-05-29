/**
 * Suche — Rendering-Strategie: SSR (searchParams aus URL)
 *
 * Demonstriert:
 *  - URL-basierte Suche (q, category Parameter)
 *  - DummyJSON /products/search als Search Backend
 *  - Facetten-Aggregation im BFF (GraphQL Resolver)
 *  - Wetter-Empfehlungen (optional, per includeWeatherRecs=true)
 *  - Suspense: Ergebnisse streamen, Eingabe sofort sichtbar
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { DummyJsonAPI } from '@/lib/graphql/datasources/DummyJsonAPI'
import { SearchResults } from '@/components/search/SearchResults'
import { SearchBar } from '@/components/search/SearchBar'
import { ProductCardSkeleton } from '@/components/product/ProductCard'

export const metadata: Metadata = { title: 'Suche' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { q?: string; category?: string; weatherRecs?: string }
}

export default function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q ?? ''
  const includeWeatherRecs = searchParams.weatherRecs === 'true'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Suche</h1>
        <span className="text-xs text-gray-400">Quelle: DummyJSON API</span>
      </div>

      {/* SearchBar ist Client Component (onInput → URL aktualisieren) */}
      <SearchBar defaultValue={query} />

      {query ? (
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          }
        >
          <SearchResults
            query={query}
            category={searchParams.category}
            includeWeatherRecs={includeWeatherRecs}
          />
        </Suspense>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>Suchbegriff eingeben um Produkte zu finden</p>
          <p className="text-sm mt-1">Powered by DummyJSON · 194 Produkte durchsuchen</p>
        </div>
      )}
    </div>
  )
}
