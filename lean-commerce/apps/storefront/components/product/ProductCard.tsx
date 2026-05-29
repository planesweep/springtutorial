/**
 * ProductCard — Server Component (keine Interaktivität benötigt)
 * ProductCardSkeleton — Skeleton für Suspense Loading States
 */

import Image from 'next/image'
import Link from 'next/link'

interface ProductCardProps {
  id: string
  title: string
  price: number
  image: string
  category: string
  rating: number | { rate: number; count?: number }
}

export function ProductCard({ id, title, price, image, category, rating }: ProductCardProps) {
  const ratingValue = typeof rating === 'number' ? rating : rating.rate

  return (
    <Link
      href={`/products/${id}`}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
    >
      <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
        <Image
          src={image}
          alt={title}
          width={200}
          height={200}
          className="object-contain h-36 w-auto group-hover:scale-105 transition-transform"
        />
      </div>
      <div className="p-4 space-y-1">
        <p className="text-xs text-blue-600 capitalize">{category}</p>
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{title}</h3>
        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-gray-900">€{price.toFixed(2)}</span>
          <span className="text-xs text-amber-500">★ {ratingValue.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-5 bg-gray-100 rounded w-1/2 mt-2" />
      </div>
    </div>
  )
}
