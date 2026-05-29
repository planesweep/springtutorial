import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Monorepo-Root robust bestimmen (unabhängig vom aktuellen Arbeitsverzeichnis):
// next.config.mjs liegt in apps/storefront/ → zwei Ebenen hoch = Repo-Root.
const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

/**
 * Next.js 14.2 Konfiguration.
 *
 * Hinweis: Next 14.2 unterstützt KEINE next.config.ts (erst ab Next 15) →
 * diese Datei ist bewusst .mjs mit JSDoc-Typannotation.
 *
 * Wichtige Feature-Flags:
 * - output: 'standalone'                           → schlankes Docker-Image
 * - experimental.outputFileTracingRoot             → Monorepo-Dateien korrekt tracen
 * - experimental.serverComponentsExternalPackages  → Server-only Pakete nicht bundlen
 *   (In Next 14.2 liegen diese Keys unter `experimental`; erst ab Next 15 top-level.)
 *
 * @type {import('next').NextConfig}
 */
const config = {
  // Standalone Output: alle benötigten Dateien werden in .next/standalone/ kopiert.
  output: 'standalone',

  experimental: {
    // Standalone-Build muss vom Monorepo-Root tracen, sonst fehlen Workspace-Deps
    outputFileTracingRoot: repoRoot,
    // Server-only Pakete: nicht ins RSC/Client-Bundle ziehen.
    // ioredis + redis-cache werden nur bei gesetzter REDIS_URL via require() geladen.
    serverComponentsExternalPackages: [
      'graphql-yoga',
      'graphql',
      '@graphql-hive/yoga',
      'ioredis',
      '@envelop/response-cache-redis',
    ],
  },

  images: {
    remotePatterns: [
      // FakeStore API Produktbilder
      { protocol: 'https', hostname: 'fakestoreapi.com' },
      // DummyJSON Produktbilder
      { protocol: 'https', hostname: 'cdn.dummyjson.com' },
      { protocol: 'https', hostname: 'i.dummyjson.com' },
    ],
  },

  // Security & Performance Headers (demonstriert Next.js Headers Feature)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
      // GraphQL Endpunkt: CORS für externe Clients erlauben (Dev)
      {
        source: '/api/graphql',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.CORS_ORIGIN ?? '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },

  // URL-Rewrites: BFF als eigenständiger Server (Option B) proxyen
  async rewrites() {
    if (process.env.EXTERNAL_BFF_URL) {
      return [{ source: '/api/graphql', destination: `${process.env.EXTERNAL_BFF_URL}/graphql` }]
    }
    return []
  },
}

export default config
