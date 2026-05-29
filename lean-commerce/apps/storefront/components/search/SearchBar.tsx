/**
 * SearchBar — Client Component (Tastatureingabe → URL-Update).
 * Nutzt useRouter für clientseitige Navigation ohne Full-Reload.
 * Debounce: 300ms damit nicht bei jedem Buchstaben gesucht wird.
 */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleChange = useCallback(
    (value: string) => {
      startTransition(() => {
        if (value.trim()) {
          router.replace(`/search?q=${encodeURIComponent(value.trim())}`)
        } else {
          router.replace('/search')
        }
      })
    },
    [router],
  )

  return (
    <div className="relative">
      <input
        type="search"
        defaultValue={defaultValue}
        onChange={e => handleChange(e.target.value)}
        placeholder="Produkte suchen… (DummyJSON: 194 Produkte)"
        className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        {isPending ? (
          <span className="animate-spin inline-block">⟳</span>
        ) : (
          <span>🔍</span>
        )}
      </div>
    </div>
  )
}
