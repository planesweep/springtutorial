import type { NextConfig } from 'next'

/**
 * Next.js 14 Konfiguration.
 *
 * Wichtige Feature-Flags:
 * - serverExternalPackages: graphql-yoga läuft nur server-seitig
 * - images.remotePatterns: externe Bild-Domains für Next/Image Optimierung
 * - headers: Security Headers für alle Routen
 */
const config: NextConfig = {
  // Verhindert dass Yoga/graphql im Client-Bundle landet
  serverExternalPackages: ['graphql-yoga', 'graphql', '@graphql-hive/yoga'],

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
