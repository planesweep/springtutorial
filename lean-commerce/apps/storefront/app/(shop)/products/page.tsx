/**
 * Produkt-Listing — Rendering-Strategie: SSR (Server-Side Rendering)
 *
 * searchParams (URL-Parameter) werden serverseitig ausgewertet → SSR.
 * Streaming: Kategorie-Filter sofort sichtbar, Produkte streamen nach.
 *
 * Demonstriert:
 *  - Dynamic Segment + searchParams in Server Components
 *  - Parallel Suspense (Filter + Liste gleichzeitig)
 *  - FakeStore API Kategorien als Facetten-Navigation
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { FakeStoreAPI } from '@/lib/graphql/datasources/FakeStoreAPI'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductCardSkeleton } from '@/components/product/ProductCard'

export const metadata: Metadata = {
  title: 'Produkte',
  description: 'Alle Produkte aus dem FakeStore Katalog',
}

// SSR: keine revalidate-Konstante → immer frisch rendern
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { category?: string; sort?: string }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  // Kategorien parallel zu den Produkten laden (kein Waterfall)
  const categoriesPromise = FakeStoreAPI.getCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produkte</h1>
        <span className="text-xs text-gray-400">Quelle: FakeStore API</span>
      </div>

      <div className="flex gap-8">
        {/* Kategorie-Filter: Suspense → sofort rendern wenn Kategorien da sind */}
        <Suspense fallback={<CategoryFilterSkeleton />}>
          <CategoryFilter
            categoriesPromise={categoriesPromise}
            selectedCategory={searchParams.category}
          />
        </Suspense>

        {/* Produkt-Grid: streamt separat */}
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            }
          >
            <ProductGrid
              category={searchParams.category}
              sort={searchParams.sort as 'asc' | 'desc'}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function CategoryFilter({
  categoriesPromise,
  selectedCategory,
}: {
  categoriesPromise: Promise<string[]>
  selectedCategory?: string
}) {
  const categories = await categoriesPromise
  return (
    <aside className="w-48 shrink-0 space-y-1">
      <div className="text-sm font-medium text-gray-700 mb-2">Kategorien</div>
      <Link
        href="/products"
        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
          !selectedCategory ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        Alle
      </Link>
      {categories.map(cat => (
        <Link
          key={cat}
          href={`/products?category=${encodeURIComponent(cat)}`}
          className={`block px-3 py-2 rounded-lg text-sm transition-colors capitalize ${
            selectedCategory === cat
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {cat}
        </Link>
      ))}
    </aside>
  )
}

function CategoryFilterSkeleton() {
  return (
    <aside className="w-48 shrink-0 space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </aside>
  )
}
