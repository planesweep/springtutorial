/**
 * GraphQL BFF — Next.js Route Handler
 *
 * Einstiegspunkt für alle GraphQL-Anfragen.
 *  POST /api/graphql  → GraphQL Operation
 *  GET  /api/graphql  → GraphiQL Playground (nur Development)
 *
 * Plugin Stack (Envelop):
 *  1. useResponseCache     → Response Cache (In-Memory oder Redis bei REDIS_URL)
 *  2. usePersistedOperations → Hash-basierte Queries (Production Security)
 *  3. useHive              → Schema Reporting + Usage Analytics (optional)
 *
 * Externe Datenquellen (alle kostenlos, kein API-Key):
 *  - FakeStore API  (https://fakestoreapi.com)   → Produkte, Warenkorb
 *  - DummyJSON API  (https://dummyjson.com)      → Suche, Auth
 *  - Open-Meteo API (https://api.open-meteo.com) → Wetterdaten
 */

// useResponseCache / usePersistedOperations / useHive sind GraphQL-Yoga- bzw.
// Envelop-PLUGINS, keine React-Hooks. Die react-hooks-Regel ist hier ein
// False-Positive (sie triggert nur auf den "use"-Präfix der Funktionsnamen).
/* eslint-disable react-hooks/rules-of-hooks */

import { createYoga, type Plugin } from 'graphql-yoga'
import {
  useResponseCache,
  createInMemoryCache,
  type Cache,
} from '@graphql-yoga/plugin-response-cache'
import { usePersistedOperations } from '@graphql-yoga/plugin-persisted-operations'
import { useHive } from '@graphql-hive/yoga'
import Redis from 'ioredis'
import { createRedisCache } from '@envelop/response-cache-redis'
import { schema } from '@/lib/graphql/schema'
import { buildContext } from '@/lib/graphql/context'

/**
 * Cache-Backend wählen:
 *  - REDIS_URL gesetzt → Redis (überlebt Neustart, teilbar über mehrere Instanzen)
 *  - sonst             → In-Memory (geht bei Neustart verloren, nur Single-Instance)
 *
 * ioredis + @envelop/response-cache-redis sind in next.config als
 * serverComponentsExternalPackages markiert → werden nicht ins Bundle gezogen.
 * Eine Redis-Verbindung wird nur bei gesetzter REDIS_URL geöffnet.
 */
function buildCache(): Cache {
  if (process.env.REDIS_URL) {
    const redis = new Redis(process.env.REDIS_URL)
    return createRedisCache({ redis }) as unknown as Cache
  }
  return createInMemoryCache()
}

// Persisted Operations Store.
// Produktion: über Hive CDN oder graphql-codegen befüllt.
// Development: allowArbitraryOperations = true → Store wird ignoriert.
const persistedOpsStore: Record<string, string> = {}

const plugins: Plugin[] = [
  // ── 1. Response Cache ──────────────────────────────────────────────────────
  // TTL 60s für Produkte. Cart/User/AuthPayload: TTL 0 → niemals cachen.
  useResponseCache({
    session: () => null,
    cache: buildCache(),
    ttl: 60_000,
    ttlPerType: {
      Cart: 0,
      User: 0,
      AuthPayload: 0,
    },
    ttlPerSchemaCoordinate: {
      // Wetterdaten: 5 Min im GraphQL Cache (fetch selbst hat 30 Min)
      'Query.storeWeather': 300_000,
      'Query.weather': 300_000,
    },
  }),

  // ── 2. Persisted Operations ────────────────────────────────────────────────
  // Production: Client sendet nur den SHA256-Hash, nicht den Query-Text.
  usePersistedOperations({
    getPersistedOperation: async (hash: string) => {
      if (process.env.HIVE_CDN_ENDPOINT && process.env.HIVE_CDN_KEY) {
        const res = await fetch(
          `${process.env.HIVE_CDN_ENDPOINT}/apps/persisted-documents/${hash}`,
          { headers: { 'X-Hive-CDN-Key': process.env.HIVE_CDN_KEY } },
        )
        if (res.ok) return res.text()
      }
      return persistedOpsStore[hash] ?? null
    },
    allowArbitraryOperations: process.env.NODE_ENV !== 'production',
  }),
]

// ── 3. GraphQL Hive (optional) ────────────────────────────────────────────────
// Nur aktivieren wenn HIVE_TOKEN gesetzt ist.
// API-Hinweis (@graphql-hive/yoga v0.38): `enabled` existiert nur top-level,
// NICHT innerhalb von `reporting`/`usage` (häufige Fehlerquelle).
if (process.env.HIVE_TOKEN) {
  plugins.push(
    useHive({
      enabled: true,
      token: process.env.HIVE_TOKEN,
      reporting: {
        author: 'BFF Storefront',
        commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_SHA ?? 'local',
      },
      usage: {
        // Client-Info aus den von der Middleware gesetzten Headern
        clientInfo(context: { request: Request }) {
          const name = context.request.headers.get('x-graphql-client-name') ?? 'unknown'
          const version = context.request.headers.get('x-graphql-client-version') ?? '0.0.0'
          return { name, version }
        },
      },
    }),
  )
}

const { handleRequest } = createYoga({
  schema,
  context: buildContext,
  // Muss zum Route-Pfad passen, damit Yoga das Routing korrekt auflöst
  graphqlEndpoint: '/api/graphql',
  graphiql: process.env.NODE_ENV === 'development',
  plugins,
  // Next.js stellt die Web-Fetch Response global bereit
  fetchAPI: { Response },
})

// Next.js App Router Handler — handleRequest(request, routeContext) ist Fetch-API-konform.
// Der zweite Parameter (Next-RouteContext mit { params }) wird zum Yoga-Server-Context.
export { handleRequest as GET, handleRequest as POST, handleRequest as OPTIONS }

// Node.js Runtime — graphql-yoga benötigt Node.js APIs (nicht Edge Runtime)
export const runtime = 'nodejs'
