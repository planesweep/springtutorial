/**
 * GraphQL BFF — Next.js Route Handler
 *
 * Einstiegspunkt für alle GraphQL-Anfragen.
 *  POST /api/graphql  → GraphQL Operation
 *  GET  /api/graphql  → GraphiQL Playground (nur Development)
 *
 * Plugin Stack (Envelop):
 *  1. useResponseCache     → In-Memory Cache (60s TTL für Produkt-Queries)
 *  2. usePersistedOperations → Hash-basierte Queries (Production Security)
 *  3. useHive              → Schema Reporting + Usage Analytics (optional)
 *
 * Externe Datenquellen (alle kostenlos, kein API-Key):
 *  - FakeStore API  (https://fakestoreapi.com)   → Produkte, Warenkorb
 *  - DummyJSON API  (https://dummyjson.com)      → Suche, Auth
 *  - Open-Meteo API (https://api.open-meteo.com) → Wetterdaten
 */

import { createYoga } from 'graphql-yoga'
import { useResponseCache } from '@graphql-yoga/plugin-response-cache'
import { usePersistedOperations } from '@graphql-yoga/plugin-persisted-operations'
import { schema } from '@/lib/graphql/schema'
import { buildContext } from '@/lib/graphql/context'

// Hive-Plugin: wird nur initialisiert wenn HIVE_TOKEN gesetzt ist.
// Synchroner Import (kein top-level await) — Paket ist in dependencies,
// also immer verfügbar. useHive() gibt bei fehlendem Token einen No-op zurück.
let hivePlugin: ReturnType<typeof import('@graphql-hive/yoga')['useHive']> | null = null

if (process.env.HIVE_TOKEN) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useHive } = require('@graphql-hive/yoga') as typeof import('@graphql-hive/yoga')
    hivePlugin = useHive({
      enabled: true,
      token: process.env.HIVE_TOKEN,
      reporting: {
        enabled: true,
        author: 'BFF Storefront',
        commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_SHA ?? 'local',
      },
      usage: {
        enabled: true,
        clientInfo(ctx: { request: Request }) {
          const name = ctx.request.headers.get('x-graphql-client-name') ?? 'unknown'
          const version = ctx.request.headers.get('x-graphql-client-version') ?? '0.0.0'
          return { name, version }
        },
      },
    })
  } catch {
    console.warn('[BFF] @graphql-hive/yoga konnte nicht geladen werden')
  }
}

// Persisted Operations Store.
// Produktion: über Hive CDN oder graphql-codegen befüllt.
// Development: allowArbitraryOperations = true → Store wird ignoriert.
const persistedOpsStore: Record<string, string> = {}

const yoga = createYoga({
  schema,
  context: buildContext,

  // GraphiQL nur in Development zugänglich
  graphiql: process.env.NODE_ENV === 'development',

  plugins: [
    // ── 1. Response Cache ────────────────────────────────────────────────────
    // In-Memory Cache für teure Queries. TTL 60s für Produkte.
    // Cart/User/AuthPayload: TTL 0 → niemals cachen (user-spezifisch/volatil).
    useResponseCache({
      session: () => null,
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

    // ── 2. Persisted Operations ──────────────────────────────────────────────
    // Production: Client sendet nur den SHA256-Hash, nicht den Query-Text.
    // Schützt vor unbekannten Queries von externen Clients.
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

    // ── 3. GraphQL Hive (optional) ───────────────────────────────────────────
    // Schema-Versionierung und Query-Tracking. Aktiviert nur mit HIVE_TOKEN.
    ...(hivePlugin ? [hivePlugin] : []),
  ],
})

// Next.js Route Handler Exports: Yoga implementiert das Web Fetch API
export const GET = yoga
export const POST = yoga

// Node.js Runtime — graphql-yoga benötigt Node.js APIs (nicht Edge Runtime)
export const runtime = 'nodejs'
