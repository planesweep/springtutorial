/**
 * On-Demand ISR Revalidierungs-Endpunkt
 *
 * Webhook-Empfänger: CMS oder Commerce System ruft diesen Endpunkt auf,
 * wenn sich Inhalte ändern → Next.js generiert betroffene Seiten neu.
 *
 * Sicherheit: REVALIDATE_SECRET Header muss stimmen.
 *
 * Beispiel-Aufruf:
 *   curl -X POST /api/revalidate \
 *     -H "x-revalidate-secret: <secret>" \
 *     -H "Content-Type: application/json" \
 *     -d '{"type": "product", "id": "1"}'
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { type?: string; id?: string; slug?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, id, slug } = body

  switch (type) {
    case 'product':
      if (id) {
        revalidatePath(`/products/${id}`)
        revalidateTag(`fakestore-/products-${id}`)
      } else {
        revalidatePath('/products')
        revalidateTag('fakestore')
      }
      break

    case 'all-products':
      revalidatePath('/products', 'layout')
      revalidateTag('fakestore')
      break

    default:
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  }

  return NextResponse.json({
    revalidated: true,
    type,
    id,
    slug,
    timestamp: new Date().toISOString(),
  })
}

/** GET: Health Check für den Webhook-Endpunkt */
export function GET() {
  return NextResponse.json({ status: 'ready', endpoint: '/api/revalidate' })
}
