/**
 * Loading UI — wird sofort gezeigt während page.tsx lädt (Streaming).
 * Next.js zeigt diese Komponente automatisch beim Navigieren zu /products.
 */
import { ProductCardSkeleton } from '@/components/product/ProductCard'

export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="flex gap-8">
        <aside className="w-48 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </aside>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
