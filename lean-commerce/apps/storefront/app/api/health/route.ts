/**
 * Health Check Endpunkt — für Monitoring und Load Balancer.
 * Prüft Erreichbarkeit aller drei externen APIs.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface APIStatus {
  status: 'ok' | 'error'
  latencyMs?: number
  error?: string
}

async function checkAPI(url: string, name: string): Promise<[string, APIStatus]> {
  const start = Date.now()
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
    return [name, { status: res.ok ? 'ok' : 'error', latencyMs: Date.now() - start }]
  } catch (e) {
    return [name, { status: 'error', error: String(e), latencyMs: Date.now() - start }]
  }
}

export async function GET() {
  // Alle drei APIs parallel prüfen
  const checks = await Promise.all([
    checkAPI('https://fakestoreapi.com/products?limit=1', 'fakestore'),
    checkAPI('https://dummyjson.com/products?limit=1', 'dummyjson'),
    checkAPI('https://api.open-meteo.com/v1/forecast?latitude=48.21&longitude=16.37&current_weather=true', 'open-meteo'),
  ])

  const apis = Object.fromEntries(checks)
  const allOk = Object.values(apis).every(v => v.status === 'ok')

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.1',
      apis,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 },
  )
}
