/**
 * FakeStore API DataSource
 * https://fakestoreapi.com — kein API-Key erforderlich
 *
 * Simuliert den "Commerce Monolith" (Produkte, Kategorien, Warenkorb).
 * Alle Methoden cachen intern mit Next.js fetch-Tags für ISR-Kompatibilität.
 */

export interface FakeStoreProduct {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: { rate: number; count: number }
}

export interface FakeStoreCart {
  id: number
  userId: number
  date: string
  products: Array<{ productId: number; quantity: number }>
}

const BASE_URL = 'https://fakestoreapi.com'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    // Next.js erweitert fetch: Tags erlauben gezielte Cache-Invalidierung
    next: { tags: ['fakestore', `fakestore-${path.replace(/\//g, '-')}`] } as NextFetchRequestConfig,
  })
  if (!res.ok) throw new Error(`FakeStore API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

// Workaround: next-type für erweiterte fetch-Options
type NextFetchRequestConfig = { tags?: string[]; revalidate?: number | false }

export const FakeStoreAPI = {
  /** Alle Produkte, optional gefiltert nach Kategorie und Limit */
  async getProducts(opts?: {
    category?: string
    limit?: number
    sort?: 'asc' | 'desc'
  }): Promise<FakeStoreProduct[]> {
    const params = new URLSearchParams()
    if (opts?.limit) params.set('limit', String(opts.limit))
    if (opts?.sort) params.set('sort', opts.sort)

    const path = opts?.category
      ? `/products/category/${encodeURIComponent(opts.category)}`
      : '/products'

    // Trailing '?' vermeiden wenn keine Query-Parameter gesetzt sind
    const query = params.toString()
    return apiFetch<FakeStoreProduct[]>(query ? `${path}?${query}` : path)
  },

  /** Einzelnes Produkt nach ID */
  async getProductById(id: number): Promise<FakeStoreProduct | null> {
    return apiFetch<FakeStoreProduct>(`/products/${id}`).catch(() => null)
  },

  /** Alle verfügbaren Kategorien */
  async getCategories(): Promise<string[]> {
    return apiFetch<string[]>('/products/categories')
  },

  /** Warenkorb nach ID */
  async getCart(cartId: number): Promise<FakeStoreCart | null> {
    return apiFetch<FakeStoreCart>(`/carts/${cartId}`).catch(() => null)
  },

  /** Neuen Warenkorb anlegen */
  async createCart(userId: number, products: Array<{ productId: number; quantity: number }>): Promise<FakeStoreCart> {
    return apiFetch<FakeStoreCart>('/carts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, date: new Date().toISOString().split('T')[0], products }),
    })
  },

  /** Warenkorb aktualisieren (Produkte hinzufügen/ändern) */
  async updateCart(cartId: number, products: Array<{ productId: number; quantity: number }>): Promise<FakeStoreCart> {
    return apiFetch<FakeStoreCart>(`/carts/${cartId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products }),
    })
  },
}
