/**
 * GraphQL BFF — Next.js Route Handler
 *
 * Dies ist der zentrale Einstiegspunkt für alle GraphQL-Anfragen.
 * Läuft als Next.js Edge-kompatible Route (Node.js Runtime).
 *
 * URL:  POST /api/graphql   → GraphQL Operation
 *       GET  /api/graphql   → GraphiQL Playground (nur Development)
 *
 * Plugin Stack (Envelop):
 *  1. useHive              → Schema Reporting + Usage Analytics (optional)
 *  2. useResponseCache     → In-Memory Cache für teure Queries (60s TTL)
 *  3. usePersistedOperations → Hash-basierte Queries (Production Security)
 *
 * Externe Datenquellen:
 *  - FakeStore API  (https://fakestoreapi.com)  → Produkte, Warenkorb
 *  - DummyJSON API  (https://dummyjson.com)     → Suche, Auth
 *  - Open-Meteo API (https://api.open-meteo.com) → Wetterdaten
 */

import { createYoga } from 'graphql-yoga'
import { useResponseCache } from '@graphql-yoga/plugin-response-cache'
import { usePersistedOperations } from '@graphql-yoga/plugin-persisted-operations'
import { schema } from '@/lib/graphql/schema'
import { buildContext } from '@/lib/graphql/context'

// Persisted Operations Store — in Production: aus Hive CDN laden
// Schlüssel = SHA256-Hash des Query-Dokuments, Wert = Query-String
const persistedOpsStore: Record<string, string> = {
  // Einträge werden von graphql-codegen befüllt (persisted-documents plugin)
  // Beispiel:
  // 'abc123...': 'query Products { products { id title price } }',
}

const yoga = createYoga({
  schema,
  context: buildContext,

  // GraphiQL nur in Development anzeigen
  graphiql: process.env.NODE_ENV === 'development',

  plugins: [
    // ── Response Cache ──────────────────────────────────────────────────────
    // Cacht Query-Responses in-memory. TTL: 60s für Produkt-Queries.
    // Cart, User und Mutations werden NIEMALS gecacht (TTL 0).
    useResponseCache({
      // Public cache: kein User-spezifischer Schlüssel
      session: () => null,
      ttl: 60_000,
      ttlPerType: {
        // User-spezifische und volatile Types immer fresh
        Cart: 0,
        User: 0,
        AuthPayload: 0,
      },
      ttlPerSchemaCoordinate: {
        // Wetter hat eigenen Cache (30 Min via fetch, hier 5 Min Fallback)
        'Query.storeWeather': 300_000,
        'Query.weather': 300_000,
      },
    }),

    // ── Persisted Operations ─────────────────────────────────────────────────
    // In Production: nur bekannte (vorab registrierte) Queries erlauben.
    // Verhindert beliebige Queries von unbekannten Clients.
    usePersistedOperations({
      getPersistedOperation: async (hash: string) => {
        // Hive CDN Integration (wenn konfiguriert):
        if (process.env.HIVE_CDN_ENDPOINT && process.env.HIVE_CDN_KEY) {
          const res = await fetch(
            `${process.env.HIVE_CDN_ENDPOINT}/apps/persisted-documents/${hash}`,
            { headers: { 'X-Hive-CDN-Key': process.env.HIVE_CDN_KEY } },
          )
          if (res.ok) return res.text()
        }
        // Fallback: lokaler Store
        return persistedOpsStore[hash] ?? null
      },
      // In Development: direkte Queries immer erlauben (kein Hash nötig)
      allowArbitraryOperations: process.env.NODE_ENV !== 'production',
    }),

    // ── GraphQL Hive ─────────────────────────────────────────────────────────
    // Nur wenn HIVE_TOKEN gesetzt ist (optional für Development).
    // useHive() wird dynamisch importiert um den Build nicht zu brechen.
    ...(await loadHivePlugin()),
  ],
})

/** Lädt das Hive-Plugin nur wenn HIVE_TOKEN konfiguriert ist. */
async function loadHivePlugin() {
  if (!process.env.HIVE_TOKEN) return []
  try {
    const { useHive } = await import('@graphql-hive/yoga')
    return [
      useHive({
        enabled: true,
        token: process.env.HIVE_TOKEN,
        // Schema bei jedem Start an Hive Registry melden
        reporting: {
          enabled: true,
          author: 'BFF Storefront',
          commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_SHA ?? 'local',
        },
        // Jede GraphQL-Operation tracken (Usage Analytics)
        usage: {
          enabled: true,
          // Clients identifizieren sich über Header
          clientInfo(ctx: { request: Request }) {
            const name = ctx.request.headers.get('x-graphql-client-name') ?? 'unknown'
            const version = ctx.request.headers.get('x-graphql-client-version') ?? '0.0.0'
            return { name, version }
          },
        },
      }),
    ]
  } catch {
    console.warn('[BFF] Hive plugin nicht geladen (HIVE_TOKEN gesetzt aber Paket fehlt?)')
    return []
  }
}

// Next.js Route Handler: GET und POST an Yoga delegieren
export const GET = yoga
export const POST = yoga

// Node.js Runtime (nicht Edge) — graphql-yoga benötigt Node APIs
export const runtime = 'nodejs'
