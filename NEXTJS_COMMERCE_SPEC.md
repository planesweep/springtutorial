# Lean Decoupled Commerce — Next.js Demo App
## Entwicklungsplan & Technische Spezifikation

> **Zweck:** Trainingsprojekt & Proof-of-Concept für alle Layer der Lean Decoupled Commerce Architektur.
> Jeder Layer ist vollständig implementiert und demonstriert reale Entwicklungsmuster.
>
> Architektur-Referenz: `architecture-lean-decoupled-sf-yoga` (Atlassian Confluence)

---

## 1. Architektur-Überblick

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser  (Desktop / Mobile Web Clients)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / TLS
┌────────────────────────▼────────────────────────────────────────┐
│  Edge & CDN Layer                                               │
│  Cloudflare / CloudFront                                        │
│  • Static Assets   • SSR Cache (stale-while-revalidate)        │
│  • WAF             • Image CDN                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│  Storefront Layer  [PUBLIC EDGE]                                │
│  React / Next.js 14 (App Router)                                │
│  • SSR  • SSG  • ISR  • Streaming  • Server Actions            │
└────────────────────────┬────────────────────────────────────────┘
                         │ GraphQL (Persisted Docs)
┌────────────────────────▼──────────────┬─────────────────────────┐
│  GraphQL BFF Layer  [PRIVATE / VPC]   │  GraphQL Hive (Optional) │
│  GraphQL Yoga · Node.js               │  Registry & Observability│
│  • Hand-written Schema (SDL-first)    │  • Schema CI/CD          │
│  • REST DataSources                   │  • Persisted Docs CDN    │
│  • Persisted Operations               │  • Usage Analytics       │
│  • Response Cache (in-memory/Redis)   │  • Breaking Change Guard │
└──────┬──────────────┬─────────────────┘─────────────────────────┘
       │ REST/OData   │ REST/HTTPS        │ GraphQL/REST
┌──────▼──────┐ ┌─────▼───────────┐ ┌────▼────────────────────────┐
│  Commerce   │ │ Search &        │ │  Headless CMS               │
│  Monolith   │ │ Discovery       │ │  Content Platform            │
│  REST APIs  │ │ Algolia/        │ │  Contentful / Strapi         │
│  (Legacy)   │ │ Typesense       │ │  (GraphQL / REST)            │
│  Cart·Check │ │ (REST API)      │ │                              │
│  Price·Ordr │ │                 │ │                              │
└─────────────┘ └─────────────────┘ └──────────────────────────────┘
```

---

## 1b. Freie Externe APIs (alle auf freepublicapis.com)

| API | URL | Rolle in der Architektur | Endpoints |
|---|---|---|---|
| **FakeStore API** | `https://fakestoreapi.com` | Commerce Monolith | `GET /products`, `GET /products/{id}`, `GET /products/categories`, `POST /carts`, `PUT /carts/{id}` |
| **DummyJSON API** | `https://dummyjson.com` | Search & Auth | `GET /products/search?q=`, `GET /products/category/:cat`, `POST /auth/login`, `GET /auth/me` |
| **Open-Meteo API** | `https://api.open-meteo.com/v1/forecast` | Wetter-Feature | `?latitude=&longitude=&current_weather=true&daily=...` |

**Kein API-Key erforderlich** für alle drei APIs. Kostenlos, täglich getestet.

### Open-Meteo → Wetterbasierte Empfehlungs-Logik

```
Regen / Gewitter  → raincoat, umbrella, boots
Schnee            → winter, boots, gloves, jacket
Klar + > 22°C     → sunglasses, shorts, tshirt, sunscreen
Kalt < 10°C       → jacket, sweater, scarf
```

---

## 2. Technologie-Stack

| Layer | Technologie | Version | Begründung |
|---|---|---|---|
| **Storefront** | Next.js (App Router) | 14.x | SSR/SSG/ISR, Server Components, Streaming |
| **UI Framework** | React | 18.x | Concurrent Features, Suspense |
| **Sprache** | TypeScript | 5.x | End-to-end Type Safety |
| **Styling** | Tailwind CSS + shadcn/ui | 3.x | Utility-first, accessible components |
| **BFF Runtime** | Node.js | 20 LTS | Stable, ESM native |
| **GraphQL Server** | GraphQL Yoga | 5.x | Standards-compliant, Envelop plugins |
| **Schema Registry** | GraphQL Hive | Cloud / Self-hosted | Schema CI, Usage Analytics |
| **GraphQL Client** | urql / gql.tada | latest | Lightweight, type-safe |
| **State Management** | Zustand | 4.x | Minimal boilerplate für Cart/Session |
| **Data Fetching** | TanStack Query | 5.x | Client-side cache, background sync |
| **Commerce Backend** | **FakeStore API** | freepublicapis.com | Produkte, Kategorien, Warenkorb — kein Key |
| **Search Backend** | **DummyJSON API** | freepublicapis.com | Volltext-Suche, Facetten, Auth — kein Key |
| **Wetter Backend** | **Open-Meteo API** | freepublicapis.com | Wetterdaten + Forecast — kein Key, kein Limit |
| **Testing** | Jest + React Testing Library | - | Unit & Integration |
| **E2E** | Playwright | - | Browser-Automatisierung |
| **CI/CD** | GitHub Actions | - | Lint, Test, Hive Schema CI |
| **Package Manager** | pnpm | 8.x | Workspaces, fast |

---

## 3. Monorepo-Projektstruktur

```
lean-commerce/                          ← Monorepo Root
├── package.json                        ← pnpm workspace config
├── pnpm-workspace.yaml
├── turbo.json                          ← Turborepo pipeline
├── .github/
│   └── workflows/
│       ├── ci.yml                      ← Lint, Test, Build
│       └── hive-schema-check.yml       ← Hive Schema CI (Breaking Changes)
│
├── apps/
│   ├── storefront/                     ← Next.js 14 App (Hauptanwendung)
│   │   ├── app/                        ← App Router Root
│   │   │   ├── layout.tsx              ← Root Layout (fonts, providers)
│   │   │   ├── page.tsx                ← Homepage (SSG + ISR)
│   │   │   ├── loading.tsx             ← Global Loading UI (Streaming)
│   │   │   ├── error.tsx               ← Global Error Boundary
│   │   │   ├── not-found.tsx           ← 404 Page
│   │   │   │
│   │   │   ├── (shop)/                 ← Route Group (shared layout)
│   │   │   │   ├── layout.tsx          ← Shop Shell (Header, Footer, Cart)
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx        ← Product Listing (SSR + Streaming)
│   │   │   │   │   ├── loading.tsx     ← Skeleton Loader
│   │   │   │   │   └── [slug]/
│   │   │   │   │       ├── page.tsx    ← Product Detail (ISR, generateStaticParams)
│   │   │   │   │       └── opengraph-image.tsx ← OG Image Generation
│   │   │   │   ├── categories/
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx    ← Category Page (SSR)
│   │   │   │   ├── search/
│   │   │   │   │   └── page.tsx        ← Search Results (CSR + Suspense)
│   │   │   │   ├── cart/
│   │   │   │   │   └── page.tsx        ← Cart Page (Client Component)
│   │   │   │   └── checkout/
│   │   │   │       ├── page.tsx        ← Checkout (Server Action Forms)
│   │   │   │       └── confirmation/
│   │   │   │           └── page.tsx    ← Order Confirmation
│   │   │   │
│   │   │   ├── (auth)/                 ← Route Group (auth layout)
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   │
│   │   │   ├── account/
│   │   │   │   ├── layout.tsx          ← Parallel Routes (orders | profile)
│   │   │   │   ├── page.tsx
│   │   │   │   ├── @orders/            ← Parallel Route Slot
│   │   │   │   │   └── page.tsx
│   │   │   │   └── @profile/           ← Parallel Route Slot
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx            ← CMS Content (ISR)
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx        ← Blog Post (ISR vom CMS)
│   │   │   │
│   │   │   └── api/                    ← Route Handlers (API Endpoints)
│   │   │       ├── graphql/
│   │   │       │   └── route.ts        ← GraphQL Yoga Handler (BFF Entry)
│   │   │       ├── revalidate/
│   │   │       │   └── route.ts        ← On-Demand ISR Revalidation Webhook
│   │   │       └── health/
│   │   │           └── route.ts        ← Health Check Endpoint
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                     ← shadcn/ui Base Components
│   │   │   ├── product/                ← Product Card, Gallery, Variants
│   │   │   ├── cart/                   ← Cart Drawer, Line Items
│   │   │   ├── search/                 ← Search Bar, Facets, Results
│   │   │   └── layout/                 ← Header, Footer, Navigation
│   │   │
│   │   ├── lib/
│   │   │   ├── graphql/
│   │   │   │   ├── client.ts           ← urql Client Setup (SSR + CSR)
│   │   │   │   └── queries/            ← .graphql Dokumente (Persisted Ops)
│   │   │   ├── actions/                ← Server Actions (Cart, Checkout)
│   │   │   ├── hooks/                  ← Custom React Hooks
│   │   │   └── utils/                  ← Formatierung, Helpers
│   │   │
│   │   ├── middleware.ts               ← Edge Middleware (Auth, i18n, A/B)
│   │   ├── next.config.mjs             ← Next.js Config (Next 14.2: .mjs, NICHT .ts)
│   │   └── tailwind.config.ts
│   │
│   └── bff/                            ← GraphQL BFF (Yoga Server)
│       ├── src/
│       │   ├── index.ts                ← Server Entry (Standalone oder Next.js Route)
│       │   ├── schema/
│       │   │   ├── typeDefs/           ← SDL Schema Definitionen (SDL-first)
│       │   │   │   ├── product.graphql
│       │   │   │   ├── cart.graphql
│       │   │   │   ├── order.graphql
│       │   │   │   ├── search.graphql
│       │   │   │   ├── content.graphql
│       │   │   │   └── user.graphql
│       │   │   ├── resolvers/          ← Resolver Implementierungen
│       │   │   │   ├── query/
│       │   │   │   ├── mutation/
│       │   │   │   └── type/           ← Field Resolver für komplexe Types
│       │   │   └── index.ts            ← Schema Assembly (makeExecutableSchema)
│       │   │
│       │   ├── datasources/            ← REST DataSource Klassen
│       │   │   ├── CommerceAPI.ts      ← Commerce Monolith (Cart/Orders/Pricing)
│       │   │   ├── SearchAPI.ts        ← Algolia / Meilisearch Adapter
│       │   │   └── CmsAPI.ts           ← Contentful / Strapi Adapter
│       │   │
│       │   ├── plugins/                ← Envelop Plugins
│       │   │   ├── hive.ts             ← GraphQL Hive Usage Reporting
│       │   │   ├── persisted-ops.ts    ← Persisted Operations (Security)
│       │   │   ├── response-cache.ts   ← Response Cache (Keyv / Redis)
│       │   │   └── auth.ts             ← JWT Auth Plugin
│       │   │
│       │   └── context.ts              ← GraphQL Context (Auth, DataSources)
│       │
│       └── package.json
│
├── packages/
│   ├── gql-types/                      ← Codegen: Shared TypeScript Types
│   │   ├── src/generated/              ← Auto-generated aus Schema
│   │   └── codegen.ts                  ← GraphQL Codegen Config
│   │
│   └── mock-backends/                  ← Simulierte Backend-Services
│       ├── commerce/                   ← json-server REST API
│       │   ├── db.json                 ← Produktkatalog, Warenkorb, Orders
│       │   └── server.ts               ← Express + json-server
│       ├── search/                     ← Meilisearch oder Mock
│       └── cms/                        ← Strapi oder static JSON CMS
│
└── docs/
    ├── architecture/
    └── adr/                            ← Architecture Decision Records
```

---

## 4. GraphQL Schema (SDL-first)

### 4.1 Product Domain

```graphql
# packages/bff/src/schema/typeDefs/product.graphql
#
# SDL-first Schema Definition für Produkte.
# Wird von GraphQL Codegen verarbeitet → TypeScript Typen in packages/gql-types
# Hive überwacht Breaking Changes auf diesem Schema.

"""Repräsentiert ein Produkt im Katalog."""
type Product {
  id: ID!
  slug: String!
  name: String!
  description: String
  """Preis in kleinster Währungseinheit (Cent). Immer vom Commerce Monolith."""
  price: Money!
  compareAtPrice: Money
  images: [Image!]!
  variants: [ProductVariant!]!
  """SEO-relevante Felder vom Headless CMS."""
  seo: SEO
  """Echtzeit-Lagerverfügbarkeit vom Commerce Monolith."""
  availableForSale: Boolean!
  tags: [String!]!
  category: Category
  createdAt: String!
  updatedAt: String!
}

"""Produktvariante (Größe, Farbe, etc.)"""
type ProductVariant {
  id: ID!
  title: String!
  price: Money!
  sku: String!
  availableForSale: Boolean!
  selectedOptions: [SelectedOption!]!
}

type SelectedOption {
  name: String!
  value: String!
}

type Money {
  amount: Float!
  currencyCode: String!
}

type Image {
  url: String!
  altText: String
  width: Int
  height: Int
}

type SEO {
  title: String
  description: String
}

type Category {
  id: ID!
  slug: String!
  name: String!
  description: String
  image: Image
}

"""Paginierte Produktliste mit Cursor-Pagination."""
type ProductConnection {
  nodes: [Product!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# Query Erweiterungen (zusammengeführt in schema/index.ts)
extend type Query {
  product(slug: String!): Product
  products(
    first: Int = 20
    after: String
    category: String
    sortKey: ProductSortKey = RELEVANCE
    query: String
  ): ProductConnection!
  categories: [Category!]!
}

enum ProductSortKey {
  RELEVANCE
  PRICE_ASC
  PRICE_DESC
  NEWEST
  BEST_SELLING
}
```

### 4.2 Cart Domain

```graphql
# packages/bff/src/schema/typeDefs/cart.graphql

"""Warenkorb – gespeichert im Commerce Monolith, ID in Session/Cookie."""
type Cart {
  id: ID!
  lines: [CartLine!]!
  """Berechnete Gesamtsummen vom Monolith."""
  cost: CartCost!
  totalQuantity: Int!
  checkoutUrl: String!
}

type CartLine {
  id: ID!
  quantity: Int!
  merchandise: ProductVariant!
  cost: CartLineCost!
}

type CartCost {
  subtotalAmount: Money!
  totalTaxAmount: Money
  totalAmount: Money!
}

type CartLineCost {
  totalAmount: Money!
}

input CartLineInput {
  merchandiseId: ID!
  quantity: Int!
}

extend type Query {
  cart(id: ID!): Cart
}

extend type Mutation {
  cartCreate: Cart!
  cartLinesAdd(cartId: ID!, lines: [CartLineInput!]!): Cart!
  cartLinesUpdate(cartId: ID!, lines: [CartLineUpdateInput!]!): Cart!
  cartLinesRemove(cartId: ID!, lineIds: [ID!]!): Cart!
}

input CartLineUpdateInput {
  id: ID!
  quantity: Int!
}
```

### 4.3 Search Domain

```graphql
# packages/bff/src/schema/typeDefs/search.graphql
#
# Search Layer: aggregiert Ergebnisse von Algolia/Typesense/Meilisearch.
# BFF normalisiert die provider-spezifischen Responses auf dieses Schema.

type SearchResult {
  products: ProductConnection!
  facets: [SearchFacet!]!
  query: String!
  totalHits: Int!
  processingTimeMs: Int!
}

type SearchFacet {
  name: String!
  values: [SearchFacetValue!]!
}

type SearchFacetValue {
  value: String!
  count: Int!
}

input SearchInput {
  query: String!
  filters: [SearchFilter!]
  first: Int = 20
  after: String
  sortKey: ProductSortKey = RELEVANCE
}

input SearchFilter {
  facet: String!
  values: [String!]!
}

extend type Query {
  search(input: SearchInput!): SearchResult!
}
```

### 4.4 CMS / Content Domain

```graphql
# packages/bff/src/schema/typeDefs/content.graphql
#
# Headless CMS Layer: Inhalte von Contentful / Strapi.
# Blog, Marketing-Seiten, Hero-Banner.

type BlogPost {
  id: ID!
  slug: String!
  title: String!
  excerpt: String
  content: String!              # Rich Text / Markdown
  coverImage: Image
  author: Author
  publishedAt: String!
  tags: [String!]!
  seo: SEO
}

type Author {
  id: ID!
  name: String!
  avatar: Image
  bio: String
}

type HeroBanner {
  id: ID!
  headline: String!
  subline: String
  ctaLabel: String
  ctaUrl: String
  image: Image
  backgroundVideo: String
}

extend type Query {
  blogPosts(first: Int = 10, after: String): BlogPostConnection!
  blogPost(slug: String!): BlogPost
  homepageContent: HomepageContent
}

type BlogPostConnection {
  nodes: [BlogPost!]!
  pageInfo: PageInfo!
}

type HomepageContent {
  heroBanner: HeroBanner
  featuredProducts: [Product!]!
  promotionalBanners: [HeroBanner!]!
}
```

### 4.5 User / Auth Domain

```graphql
# packages/bff/src/schema/typeDefs/user.graphql

type User {
  id: ID!
  email: String!
  firstName: String
  lastName: String
  orders: [Order!]!
  defaultAddress: Address
}

type Order {
  id: ID!
  orderNumber: String!
  processedAt: String!
  financialStatus: OrderStatus!
  fulfillmentStatus: FulfillmentStatus!
  lineItems: [OrderLineItem!]!
  totalPrice: Money!
  shippingAddress: Address
}

type OrderLineItem {
  title: String!
  quantity: Int!
  variant: ProductVariant
  price: Money!
}

type Address {
  id: ID!
  firstName: String
  lastName: String
  address1: String!
  address2: String
  city: String!
  province: String
  country: String!
  zip: String!
}

enum OrderStatus { PENDING PAID REFUNDED PARTIALLY_REFUNDED }
enum FulfillmentStatus { UNFULFILLED FULFILLED PARTIAL IN_PROGRESS }

extend type Query {
  me: User
  order(id: ID!): Order
}

extend type Mutation {
  login(email: String!, password: String!): AuthPayload!
  logout: Boolean!
  register(input: RegisterInput!): AuthPayload!
}

type AuthPayload {
  token: String!
  user: User!
}

input RegisterInput {
  email: String!
  password: String!
  firstName: String
  lastName: String
}
```

---

## 5. GraphQL BFF – Implementierungsdetails

### 5.1 GraphQL Yoga Server Setup

```typescript
// apps/bff/src/index.ts
//
// GraphQL Yoga BFF – läuft als:
// Option A: Next.js Route Handler (apps/storefront/app/api/graphql/route.ts)
// Option B: Eigenständiger Node.js Server (für Skalierung / Microservice)
//
// Envelop Plugin Stack:
//  1. useHive          → Schema Reporting + Usage Analytics an Hive Cloud
//  2. usePersistedOps  → Nur bekannte Queries erlaubt (Production Security)
//  3. useResponseCache → In-Memory oder Redis Cache für teure Queries
//  4. useAuth          → JWT Validierung, User in Context injizieren

import { createYoga, createSchema } from 'graphql-yoga'
import { useHive } from '@graphql-hive/yoga'
import { useResponseCache } from '@graphql-yoga/plugin-response-cache'
import { usePersistedOperations } from '@graphql-yoga/plugin-persisted-operations'
import { typeDefs } from './schema/typeDefs'
import { resolvers } from './schema/resolvers'
import { buildContext } from './context'

const schema = createSchema({ typeDefs, resolvers })

export const yoga = createYoga({
  schema,
  context: buildContext,  // DataSources + Auth in jeden Request-Kontext
  plugins: [
    // Hive: Schema wird bei jedem Start reportet; jede Operation trackt Usage
    useHive({
      enabled: !!process.env.HIVE_TOKEN,
      token: process.env.HIVE_TOKEN!,
      usage: { enabled: true },
      reporting: { enabled: true, author: 'BFF', commit: process.env.GIT_SHA },
    }),
    // Persisted Operations: Client sendet nur den Hash, nicht den Query-Text
    usePersistedOperations({
      getPersistedOperation: async (hash) => {
        // Im Production: aus Hive CDN oder lokalem Store laden
        const store = await import('./persisted-ops.json')
        return store[hash] ?? null
      },
      allowArbitraryOperations: process.env.NODE_ENV !== 'production',
    }),
    // Response Cache: Produkt-Queries werden 60s gecacht
    useResponseCache({
      session: (request) => null,  // Public cache (kein User-spezifischer Cache)
      ttl: 60_000,
      ttlPerType: { Cart: 0, User: 0 },  // Cart + User NIE cachen
    }),
  ],
})
```

### 5.2 DataSource Pattern (REST Adapter)

```typescript
// apps/bff/src/datasources/CommerceAPI.ts
//
// DataSource kapselt alle HTTP-Calls zum Commerce Monolith.
// Instanz wird im GraphQL Context erstellt → eine Instanz pro Request.
// Intern: node-fetch + automatisches Retry (p-retry).
// Logging: strukturiertes JSON-Log mit Request-ID für Tracing.

import { RESTDataSource } from '@apollo/datasource-rest'

export class CommerceAPI extends RESTDataSource {
  override baseURL = process.env.COMMERCE_API_URL!

  // Produkt-Liste vom Monolith holen (inklusive Preise und Stock)
  async getProducts(params: GetProductsParams): Promise<CommerceProduct[]> {
    return this.get('/v1/products', { params })
  }

  async getProductBySlug(slug: string): Promise<CommerceProduct | null> {
    return this.get(`/v1/products/${slug}`).catch(() => null)
  }

  // Cart Operationen – KEIN Caching, immer fresh
  async createCart(): Promise<CommerceCart> {
    return this.post('/v1/carts')
  }

  async getCart(cartId: string): Promise<CommerceCart | null> {
    return this.get(`/v1/carts/${cartId}`).catch(() => null)
  }

  async addCartLines(cartId: string, lines: CartLineInput[]): Promise<CommerceCart> {
    return this.post(`/v1/carts/${cartId}/lines`, { body: { lines } })
  }
}
```

### 5.3 GraphQL Context

```typescript
// apps/bff/src/context.ts
//
// Context wird für jeden Request neu erstellt.
// Enthält: authentifizierten User, alle DataSource-Instanzen.
// Server Actions und Client-seitige Queries teilen denselben Context-Typ.

import type { YogaInitialContext } from 'graphql-yoga'
import { CommerceAPI } from './datasources/CommerceAPI'
import { SearchAPI } from './datasources/SearchAPI'
import { CmsAPI } from './datasources/CmsAPI'
import { verifyJwt } from './lib/auth'

export async function buildContext({ request }: YogaInitialContext) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  const user = token ? await verifyJwt(token) : null

  return {
    user,
    dataSources: {
      commerce: new CommerceAPI(),
      search: new SearchAPI(),
      cms: new CmsAPI(),
    },
  }
}

export type GraphQLContext = Awaited<ReturnType<typeof buildContext>>
```

---

## 6. GraphQL Hive Integration

### 6.1 Was Hive leistet

| Feature | Beschreibung | Konfiguration |
|---|---|---|
| **Schema Registry** | Jede Schema-Version wird versioniert gespeichert | `useHive({ reporting: { enabled: true } })` |
| **Breaking Change Guard** | CI/CD blockiert bei inkompatiblen Schema-Änderungen | `hive schema:check` in GitHub Actions |
| **Usage Analytics** | Welche Queries nutzen welche Felder? | `useHive({ usage: { enabled: true } })` |
| **Persisted Docs CDN** | Clients laden Queries vom Hive CDN statt sie mitzusenden | `HIVE_CDN_ENDPOINT` env var |
| **Schema Explorer** | Interaktives Schema-Browsing (Ersatz für Playground) | Hive Cloud UI |

### 6.2 GitHub Actions – Hive Schema CI

```yaml
# .github/workflows/hive-schema-check.yml
#
# Läuft bei jedem PR der das GraphQL Schema ändert.
# Blockiert den Merge wenn Breaking Changes erkannt werden.
name: Hive Schema Check

on:
  pull_request:
    paths:
      - 'apps/bff/src/schema/**/*.graphql'

jobs:
  schema-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check Schema gegen Hive Registry
        run: pnpm --filter bff hive schema:check
        env:
          HIVE_TOKEN: ${{ secrets.HIVE_TOKEN }}

      - name: Publish Schema (nur main branch)
        if: github.ref == 'refs/heads/main'
        run: pnpm --filter bff hive schema:publish
        env:
          HIVE_TOKEN: ${{ secrets.HIVE_TOKEN }}
```

### 6.3 Hive Umgebungsvariablen

```bash
# .env.local (nicht committen!)
HIVE_TOKEN=your-hive-token-here          # Hive API Token (aus Hive Cloud UI)
HIVE_CDN_ENDPOINT=https://cdn.graphql-hive.com/artifacts/v1/TARGET_ID/supergraph
                                          # Für Persisted Docs CDN Zugriff
```

---

## 7. Next.js 14 Features – Demo-Muster

### 7.1 Server Components vs Client Components

```
Feature                  | Rendering   | Warum
─────────────────────────────────────────────────────────────────
Product Listing          | SC          | SEO, kein JS Bundle
Product Detail           | SC + ISR    | SEO, statisch + revalidierbar
Search Results           | CC          | Interaktiv, Filter, Instant
Cart Drawer              | CC          | Hochdynamisch, Optimistic Updates
Hero Banner              | SC          | Statisch vom CMS
Blog Post                | SC + ISR    | SEO, CMS-gesteuert
Checkout Form            | CC + SA     | Server Actions für Submission
Account Dashboard        | SC + CC     | Auth-geschützt, Parallel Routes
Navigation               | SC + CC     | Menü statisch, Cart-Counter CC
```

### 7.2 Rendering-Strategien

| Route | Strategie | Revalidierung | Begründung |
|---|---|---|---|
| `/` | **ISR** | 3600s | Homepage-Content ändert sich selten |
| `/products` | **SSR** | – | Filter/Sort aus URL params |
| `/products/[slug]` | **ISR** | 300s + On-Demand | Produktpreise können sich ändern |
| `/categories/[slug]` | **ISR** | 600s | Kategorien stabil |
| `/search` | **CSR** | – | Vollständig interaktiv |
| `/cart` | **CSR** | – | User-spezifisch, kein Cache |
| `/checkout` | **SSR** | – | Immer frische Preise |
| `/blog/[slug]` | **ISR** | 1800s + On-Demand | CMS-Webhook triggert Revalidierung |
| `/account` | **SSR** | – | Auth-geschützt |

### 7.3 Server Actions (Checkout)

```typescript
// apps/storefront/lib/actions/cart.ts
//
// Server Actions laufen auf dem Server, können aber direkt in Client
// Components aufgerufen werden. Kein expliziter API-Endpunkt nötig.
// Vorteil: Type-safe, kein CORS, kein API-Route Boilerplate.
'use server'

import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { gqlClient } from '@/lib/graphql/client'
import { ADD_TO_CART_MUTATION } from '@/lib/graphql/queries/cart'

export async function addToCart(variantId: string, quantity: number) {
  const cartId = cookies().get('cartId')?.value

  const { data, errors } = await gqlClient.mutation(ADD_TO_CART_MUTATION, {
    cartId: cartId ?? (await createCart()),
    lines: [{ merchandiseId: variantId, quantity }],
  })

  if (errors) throw new Error(errors[0].message)

  // Next.js On-Demand Cache Invalidierung
  revalidateTag('cart')

  return data!.cartLinesAdd
}
```

### 7.4 Edge Middleware

```typescript
// apps/storefront/middleware.ts
//
// Edge Middleware läuft auf der CDN-Edge (Cloudflare Workers / Vercel Edge).
// Kein kalter Start, < 1ms Overhead.
// Aufgaben: Auth-Guard, i18n-Redirect, A/B-Testing, Bot-Detection.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyEdgeToken } from '@/lib/auth/edge'

export const config = {
  // Nur auf geschützte Routen anwenden
  matcher: ['/account/:path*', '/checkout/:path*'],
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value

  if (!token || !(await verifyEdgeToken(token))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
```

### 7.5 On-Demand ISR via Webhook

```typescript
// apps/storefront/app/api/revalidate/route.ts
//
// Webhook-Endpunkt für CMS und Commerce Monolith.
// CMS ruft diesen Endpunkt auf wenn ein BlogPost publiziert wird.
// Commerce Monolith ruft auf wenn sich ein Produktpreis ändert.

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { type, slug } = await request.json()

  switch (type) {
    case 'product':
      revalidatePath(`/products/${slug}`)
      revalidateTag(`product-${slug}`)
      break
    case 'blog-post':
      revalidatePath(`/blog/${slug}`)
      revalidateTag('blog')
      break
    case 'category':
      revalidatePath(`/categories/${slug}`)
      break
  }

  return NextResponse.json({ revalidated: true, type, slug })
}
```

### 7.6 Parallel Routes (Account Dashboard)

```typescript
// apps/storefront/app/account/layout.tsx
//
// Parallel Routes zeigen gleichzeitig mehrere unabhängige Seiten
// in einem einzigen Layout. Ideal für Dashboards.
// @orders und @profile laden parallel (kein Waterfall).

export default function AccountLayout({
  children,
  orders,    // Slot: @orders/page.tsx
  profile,   // Slot: @profile/page.tsx
}: {
  children: React.ReactNode
  orders: React.ReactNode
  profile: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <aside className="md:col-span-1">{profile}</aside>
      <main className="md:col-span-2">{orders}</main>
    </div>
  )
}
```

### 7.7 Streaming mit Suspense

```typescript
// apps/storefront/app/(shop)/products/page.tsx
//
// Streaming: Header und Shell werden sofort gesendet.
// ProductList wartet auf Daten – zeigt Skeleton.
// Kein Blocking der gesamten Seite durch langsame Queries.

import { Suspense } from 'react'
import { ProductListSkeleton } from '@/components/product/ProductListSkeleton'
import { ProductList } from '@/components/product/ProductList'
import { SearchFacets } from '@/components/search/SearchFacets'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string; page?: string }
}) {
  return (
    <div className="flex gap-8">
      {/* SearchFacets kann sofort gerendert werden (statische Kategorien) */}
      <Suspense fallback={<div>Loading filters...</div>}>
        <SearchFacets />
      </Suspense>

      {/* ProductList streamt – Browser zeigt Skeleton bis Daten ankommen */}
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
```

---

## 8. urql GraphQL Client Setup

```typescript
// apps/storefront/lib/graphql/client.ts
//
// Zwei Client-Modi:
//  • Server Components: direkter Fetch (kein Browser-State)
//  • Client Components: urql mit Caching + Subscriptions (future)
//
// Persisted Operations: Client sendet SHA256-Hash statt Query-Text.
// → Reduziert Bundle-Größe, verhindert unbekannte Queries auf dem Server.

import { createClient, fetchExchange, cacheExchange } from 'urql'
import { persistedExchange } from '@urql/exchange-persisted'
import { requestPolicyExchange } from '@urql/exchange-request-policy'

// Server-seitiger Client (für Server Components und Server Actions)
export function createServerClient() {
  return createClient({
    url: process.env.GRAPHQL_ENDPOINT!,
    exchanges: [fetchExchange],
    fetchOptions: {
      headers: { 'Content-Type': 'application/json' },
      // Next.js fetch-Erweiterung: Tag-basiertes Caching
      next: { tags: ['graphql'] },
    },
  })
}

// Browser-seitiger Client (für Client Components)
export function createBrowserClient() {
  return createClient({
    url: '/api/graphql',  // Proxied durch Next.js Route Handler
    exchanges: [
      requestPolicyExchange({ ttl: 30_000 }),  // cache-and-network nach 30s
      cacheExchange,
      persistedExchange({
        // Hive CDN: Queries werden vom CDN geladen, nicht vom Client gesendet
        preferGetForPersistedQueries: true,
        generateHash: async (query, document) => {
          // SHA256 Hash des normalisierten Query-Dokuments
          const msgBuffer = new TextEncoder().encode(query)
          const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        },
      }),
      fetchExchange,
    ],
  })
}
```

---

## 9. Entwicklungsphasen (Iterativ)

### Phase 1 – Monorepo Setup & Grundgerüst (Woche 1)

| Task | Details |
|---|---|
| Monorepo initialisieren | pnpm workspaces + Turborepo |
| Next.js 14 App erstellen | `create-next-app` mit App Router, TypeScript, Tailwind |
| GraphQL Yoga BFF erstellen | Als Next.js Route Handler + als Standalone |
| Mock-Backends aufsetzen | json-server Commerce API, statisches CMS JSON |
| Basisschema definieren | Product, Cart SDL |
| GraphQL Codegen | TypeScript Types aus Schema generieren |

### Phase 2 – GraphQL BFF (Woche 2)

| Task | Details |
|---|---|
| Alle Schema-Typen | Product, Cart, Order, Search, Content, User |
| Alle Resolver | Query + Mutation Resolver |
| DataSources | CommerceAPI, SearchAPI, CmsAPI |
| Context | Auth + DataSources |
| Response Cache | In-Memory Cache für Produkt-Queries |
| Persisted Operations | Hash-Store aufbauen |
| GraphQL Playground | Yoga built-in (nur Development) |

### Phase 3 – Hive Integration (Woche 2-3)

| Task | Details |
|---|---|
| Hive Cloud Account | Target erstellen, Token holen |
| useHive Plugin | In Yoga einbinden |
| Schema Reporting | Erstes Schema publishen |
| Usage Analytics | Queries tracken lassen |
| GitHub Actions | Schema Check CI einrichten |
| Persisted Docs CDN | Queries über Hive CDN laden |
| Hive Dashboard | Usage in UI zeigen |

### Phase 4 – Next.js Storefront (Woche 3-4)

| Task | Details |
|---|---|
| Homepage | Hero Banner (ISR) + Featured Products |
| Product Listing | SSR + Streaming + Skeleton |
| Product Detail | ISR + generateStaticParams |
| Search | CSR + Facetten-Filter |
| Cart | Zustand Store + Optimistic Updates |
| Checkout | Server Actions |
| Auth | Edge Middleware + JWT |
| Account | Parallel Routes |
| Blog | ISR vom CMS |

### Phase 5 – Qualität & Testing (Woche 5)

| Task | Details |
|---|---|
| Unit Tests | Resolver, DataSources, Utils |
| Integration Tests | GraphQL Queries gegen echten Yoga Server |
| E2E Tests | Playwright: Add to Cart → Checkout Flow |
| Performance | Lighthouse CI, Bundle Analyzer |
| Accessibility | axe-core in Tests |
| ISR Webhook | Revalidierungs-Endpunkt testen |

### Phase 6 – Dokumentation & Demo (Woche 6)

| Task | Details |
|---|---|
| CLAUDE.md | Codebase-Übersicht für KI-Assistenten |
| ADRs | Architecture Decision Records |
| Inline Docs | JSDoc für alle Public APIs |
| Demo-Script | Geführte Präsentation aller Features |
| Deployment | Vercel (Storefront) + Railway/Fly.io (BFF) |

---

## 10. Umgebungsvariablen (vollständig)

```bash
# ═══════════════════════════════════════════════════════
# apps/storefront/.env.local
# ═══════════════════════════════════════════════════════

# GraphQL BFF Endpunkt
GRAPHQL_ENDPOINT=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql

# Auth
NEXTAUTH_SECRET=change-me-in-production
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=change-me-in-production

# On-Demand ISR
REVALIDATE_SECRET=change-me-in-production

# ═══════════════════════════════════════════════════════
# apps/bff/.env.local
# ═══════════════════════════════════════════════════════

# GraphQL Hive
HIVE_TOKEN=your-hive-token
HIVE_CDN_ENDPOINT=https://cdn.graphql-hive.com/artifacts/v1/TARGET_ID/supergraph

# Backend APIs
COMMERCE_API_URL=http://localhost:4001           # json-server Mock
SEARCH_API_URL=http://localhost:7700             # Meilisearch
CMS_API_URL=http://localhost:1337               # Strapi

# Cache (optional, sonst In-Memory)
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=change-me-in-production

# Build Info (von CI injiziert für Hive Schema Reporting)
GIT_SHA=$GITHUB_SHA
```

---

## 11. Entwicklungsmuster (Patterns) – Zusammenfassung

| Pattern | Layer | Ort | Lernziel |
|---|---|---|---|
| SDL-first Schema | BFF | `schema/typeDefs/` | Schema als Single Source of Truth |
| DataSource Pattern | BFF | `datasources/` | REST → GraphQL Adapter |
| Envelop Plugin Stack | BFF | `plugins/` | Yoga Erweiterbarkeit |
| Response Cache | BFF | `plugins/response-cache.ts` | Performance ohne Redis |
| Persisted Operations | BFF + Client | `persisted-ops.json` | Security + Performance |
| Server Components | Storefront | `app/` | Zero-JS-Bundle Rendering |
| Client Components | Storefront | `'use client'` | Interaktivität |
| ISR + On-Demand | Storefront | `generateStaticParams` | Statisch + aktuell |
| Streaming + Suspense | Storefront | `<Suspense>` | Progressive Page Load |
| Server Actions | Storefront | `'use server'` | Typesafe Mutations |
| Parallel Routes | Storefront | `@slot/` | Dashboard Pattern |
| Edge Middleware | Storefront | `middleware.ts` | Auth am Edge |
| Optimistic Updates | Storefront | `useOptimistic` | UX: sofortiges Feedback |
| Webhook Revalidierung | Storefront | `/api/revalidate` | CMS → Next.js Trigger |
| Monorepo | Root | `turbo.json` | Multi-Package Organisation |
| Schema CI | CI | GitHub Actions | Breaking Change Prevention |

---

## 12. Demo-Flow (Präsentation)

```
1. Homepage laden                   → ISR, Hero vom CMS, Featured Products
2. Produkte browsen                 → SSR, Streaming Skeleton sichtbar
3. Produkt anklicken               → ISR Detail Page, OG Image
4. Suche benutzen                  → CSR, Facetten, Instant Results (Search API)
5. In Warenkorb legen              → Server Action, Optimistic Update
6. Warenkorb öffnen               → Zustand Store, Cart Drawer
7. Zur Kasse                       → Checkout mit Server Actions
8. Login / Auth                    → Edge Middleware Redirect
9. Account aufrufen                → Parallel Routes (Orders + Profile)
10. Blog lesen                     → ISR vom Headless CMS
11. Hive Dashboard zeigen          → Schema, Usage Analytics
12. Schema ändern (Breaking)       → GitHub Actions blockiert PR
13. Produkt im CMS ändern          → Webhook löst ISR Revalidierung aus
14. GraphQL Playground (Dev)       → Schema Explorer, Query testen
```

---

## 13. Kritische Erfolgskriterien

- [ ] Alle GraphQL Queries im Playground funktionieren
- [ ] Hive empfängt Schema und Usage Reports (Dashboard nicht leer)
- [ ] Persisted Operations blockieren unbekannte Queries in Production
- [ ] ISR + On-Demand Revalidierung funktioniert nachweisbar
- [ ] Server Actions ohne explizite API-Route funktionieren
- [ ] Edge Middleware schützt Auth-Routen ohne Cold Start
- [ ] Streaming: Skeleton sichtbar bei langsamen Backend-Queries
- [ ] E2E: Add to Cart → Checkout vollständig durchlaufbar
- [ ] TypeScript: 0 Compiler-Errors, Codegen Types aktuell
- [ ] Lighthouse Score: Performance > 90 auf Product Detail Page

---

*Dokument: NEXTJS_COMMERCE_SPEC.md · Stand: 2026-05-29*
*Architektur-Referenz: Lean Decoupled Commerce (arovski.atlassian.net)*
