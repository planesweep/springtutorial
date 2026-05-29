/**
 * DummyJSON API DataSource
 * https://dummyjson.com — kein Key für öffentliche Endpoints
 *
 * Übernimmt zwei Rollen:
 *  1. Search & Discovery: /products/search?q=... mit Pagination + Facetten
 *  2. Auth Layer: POST /auth/login → JWT, GET /auth/me → aktueller User
 *
 * DummyJSON hat reichhaltigere Produkt-Daten als FakeStore (Stock, Tags,
 * Reviews, Bilder), deshalb nutzen wir es auch für Produkt-Details.
 */

export interface DummyProduct {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  tags: string[]
  brand: string
  sku: string
  thumbnail: string
  images: string[]
  availabilityStatus: string
  reviews: DummyReview[]
  returnPolicy: string
  shippingInformation: string
  minimumOrderQuantity: number
}

export interface DummyReview {
  rating: number
  comment: string
  date: string
  reviewerName: string
}

export interface DummyProductList {
  products: DummyProduct[]
  total: number
  skip: number
  limit: number
}

export interface DummyUser {
  id: number
  firstName: string
  lastName: string
  email: string
  username: string
  image: string
  token?: string
}

export interface DummyCategory {
  slug: string
  name: string
  url: string
}

const BASE_URL = 'https://dummyjson.com'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    next: { tags: ['dummyjson'] } as { tags: string[] },
  })
  if (!res.ok) throw new Error(`DummyJSON API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export const DummyJsonAPI = {
  /**
   * Volltextsuche über alle Produkte.
   * Gibt paginierte Ergebnisse mit total für Cursor-Berechnung zurück.
   */
  async searchProducts(opts: {
    q: string
    limit?: number
    skip?: number
    select?: string[]
  }): Promise<DummyProductList> {
    const params = new URLSearchParams({ q: opts.q })
    if (opts.limit) params.set('limit', String(opts.limit))
    if (opts.skip) params.set('skip', String(opts.skip))
    if (opts.select?.length) params.set('select', opts.select.join(','))
    return apiFetch<DummyProductList>(`/products/search?${params}`)
  },

  /** Produkte einer Kategorie (slug-basiert, z.B. "smartphones") */
  async getProductsByCategory(category: string, opts?: { limit?: number; skip?: number }): Promise<DummyProductList> {
    const params = new URLSearchParams()
    if (opts?.limit) params.set('limit', String(opts.limit))
    if (opts?.skip) params.set('skip', String(opts.skip))
    return apiFetch<DummyProductList>(`/products/category/${encodeURIComponent(category)}?${params}`)
  },

  /** Alle Kategorien mit Slug, Name und URL */
  async getCategories(): Promise<DummyCategory[]> {
    return apiFetch<DummyCategory[]>('/products/categories')
  },

  /** Produkt-Detail (reichhaltiger als FakeStore) */
  async getProductById(id: number): Promise<DummyProduct | null> {
    return apiFetch<DummyProduct>(`/products/${id}`).catch(() => null)
  },

  /**
   * Login mit Username + Password.
   * DummyJSON akzeptiert: { username: 'emilys', password: 'emilyspass' }
   * Rückgabe enthält accessToken + refreshToken.
   */
  async login(username: string, password: string): Promise<DummyUser & { accessToken: string; refreshToken: string }> {
    return apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, expiresInMins: 60 }),
    })
  },

  /** Aktuellen User aus JWT Token laden (erfordert Bearer Token) */
  async getCurrentUser(token: string): Promise<DummyUser | null> {
    return fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null)
  },
}
