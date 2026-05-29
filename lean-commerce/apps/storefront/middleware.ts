/**
 * Next.js Edge Middleware
 *
 * Läuft auf der CDN-Edge (Vercel Edge Runtime / Cloudflare Workers).
 * Kein Cold Start — < 1ms Overhead.
 *
 * Aufgaben:
 *  1. Auth-Guard: /cart schützen (Demo: immer durchlassen, Token prüfen)
 *  2. Request-ID injizieren: für Tracing im BFF
 *  3. Demo-Feature: Geolocation-Header weiterleiten
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  // Middleware nur auf diese Pfade anwenden
  matcher: [
    '/cart/:path*',
    '/api/graphql',
  ],
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Eindeutige Request-ID für Distributed Tracing
  const requestId = crypto.randomUUID()
  response.headers.set('x-request-id', requestId)

  // Demo: Auth-Guard für /cart
  // In Production: JWT aus Cookie validieren (jose.jwtVerify)
  if (request.nextUrl.pathname.startsWith('/cart')) {
    const sessionToken = request.cookies.get('session')?.value
    // Demo: kein Token → Seite trotzdem zeigen (nur demonstrieren)
    if (!sessionToken) {
      response.headers.set('x-auth-status', 'anonymous')
    }
  }

  // GraphQL: Client-Info Header für Hive Usage Tracking setzen
  if (request.nextUrl.pathname === '/api/graphql') {
    response.headers.set('x-graphql-client-name', 'lean-commerce-storefront')
    response.headers.set('x-graphql-client-version', process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.1')
  }

  return response
}
