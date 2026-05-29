/**
 * Homepage — Rendering-Strategie: ISR (Incremental Static Regeneration)
 *
 * Inhalt wird beim Build statisch generiert und alle 60 Min revalidiert.
 * Wenn ein Webhook /api/revalidate aufruft, wird sofort neu generiert.
 *
 * Zeigt: Server Component, parallele Datenfetches, Suspense Streaming.
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { WeatherWidget } from '@/components/weather/WeatherWidget'
import { FeaturedProducts } from '@/components/product/FeaturedProducts'
import { ProductCardSkeleton } from '@/components/product/ProductCard'

// ISR: Seite alle 60 Sekunden regenerieren
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Lean Commerce Demo',
  description: 'Next.js 14 · GraphQL Yoga BFF · Open-Meteo · FakeStore · DummyJSON',
}

export default async function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">

      {/* Hero Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white">
        <h1 className="text-4xl font-bold mb-2">Lean Commerce Demo</h1>
        <p className="text-blue-100 text-lg mb-1">
          Next.js 14 App Router · GraphQL Yoga BFF · GraphQL Hive
        </p>
        <p className="text-blue-200 text-sm">
          Externe APIs: Open-Meteo · FakeStore · DummyJSON (alle kostenlos, kein API-Key)
        </p>
      </section>

      {/* Wetter-Widget — streamt separat (langsame externe API) */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Wetter in Wien  <span className="text-sm font-normal text-gray-500">(Open-Meteo API)</span>
        </h2>
        {/*
          Suspense: Wetter-Daten kommen von Open-Meteo (async Server Component).
          Der Rest der Seite rendert sofort — Wetter streamt nach.
        */}
        <Suspense fallback={<WeatherWidgetSkeleton />}>
          <WeatherWidget />
        </Suspense>
      </section>

      {/* Produkt-Highlights */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Produkte  <span className="text-sm font-normal text-gray-500">(FakeStore API)</span>
        </h2>
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          }
        >
          <FeaturedProducts />
        </Suspense>
      </section>

      {/* Architektur-Referenz */}
      <section className="border border-gray-200 rounded-xl p-6 bg-white">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Architektur</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {[
            { layer: 'Storefront', tech: 'Next.js 14 App Router', color: 'blue' },
            { layer: 'BFF', tech: 'GraphQL Yoga + Hive', color: 'purple' },
            { layer: 'Backends', tech: 'FakeStore · DummyJSON · Open-Meteo', color: 'green' },
          ].map(({ layer, tech, color }) => (
            <div key={layer} className={`p-4 rounded-lg bg-${color}-50 border border-${color}-100`}>
              <div className={`text-xs font-medium text-${color}-600 uppercase tracking-wide`}>{layer}</div>
              <div className="mt-1 text-gray-700">{tech}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          GraphQL Endpoint: <code className="bg-gray-100 px-1 rounded">/api/graphql</code>
          {' '}· GraphiQL Playground verfügbar in Development
        </div>
      </section>

    </main>
  )
}

function WeatherWidgetSkeleton() {
  return (
    <div className="animate-pulse bg-gray-100 rounded-xl h-32 flex items-center justify-center text-gray-400">
      Wetter wird geladen…
    </div>
  )
}
