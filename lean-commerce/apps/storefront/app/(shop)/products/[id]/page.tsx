/**
 * Produkt-Detail — Rendering-Strategie: ISR (Incremental Static Regeneration)
 *
 * Demonstriert:
 *  - generateStaticParams: Top-20 Produkte werden zur Build-Zeit statisch generiert
 *  - ISR: alle 5 Minuten revalidieren (Preisänderungen!)
 *  - generateMetadata: dynamische SEO-Tags aus Produktdaten
 *  - Next/Image: automatische Bildoptimierung
 *  - notFound(): korrekter 404 wenn Produkt nicht existiert
 */

import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { FakeStoreAPI } from '@/lib/graphql/datasources/FakeStoreAPI'
import { AddToCartButton } from '@/components/cart/AddToCartButton'

// ISR: alle 5 Minuten revalidieren
export const revalidate = 300

interface PageProps {
  params: { id: string }
}

/**
 * Build-Zeit: Die ersten 20 Produkt-IDs statisch generieren.
 * Alle anderen IDs werden on-demand gerendert und dann gecacht (ISR).
 */
export async function generateStaticParams() {
  const products = await FakeStoreAPI.getProducts({ limit: 20 })
  return products.map(p => ({ id: String(p.id) }))
}

/** Dynamische Metadata aus den Produktdaten. */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await FakeStoreAPI.getProductById(parseInt(params.id, 10))
  if (!product) return { title: 'Produkt nicht gefunden' }
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      images: [{ url: product.image, width: 500, height: 500 }],
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await FakeStoreAPI.getProductById(parseInt(params.id, 10))

  // notFound() gibt 404 zurück — korrekte HTTP-Semantik
  if (!product) notFound()

  return (
    <div className="grid md:grid-cols-2 gap-10">
      {/* Produkt-Bild: Next/Image → automatische Größenoptimierung + Lazy Loading */}
      <div className="bg-white rounded-2xl p-8 flex items-center justify-center border border-gray-100">
        <Image
          src={product.image}
          alt={product.title}
          width={400}
          height={400}
          className="object-contain max-h-80"
          priority  // LCP-Bild → keine Lazy Loading Verzögerung
        />
      </div>

      {/* Produkt-Info */}
      <div className="space-y-5">
        <div>
          <span className="text-xs text-blue-600 font-medium uppercase tracking-wide capitalize">
            {product.category}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-gray-900">
            €{product.price.toFixed(2)}
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <span>★</span>
            <span className="text-sm text-gray-600">
              {product.rating.rate} ({product.rating.count} Bewertungen)
            </span>
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed">{product.description}</p>

        {/* AddToCartButton ist ein Client Component (interaktiv) */}
        <AddToCartButton productId={product.id} productTitle={product.title} price={product.price} />

        <div className="text-xs text-gray-400 border-t pt-4">
          Produkt-ID: {product.id} · Quelle: FakeStore API · ISR 5 Min
        </div>
      </div>
    </div>
  )
}
