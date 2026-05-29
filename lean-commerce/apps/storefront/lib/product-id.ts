/**
 * Composite Product IDs — löst den FakeStore/DummyJSON ID-Konflikt.
 *
 * Problem: FakeStore (IDs 1-20) und DummyJSON (IDs 1-194) überschneiden sich.
 * Ein nacktes `5` ist mehrdeutig — welche API ist gemeint?
 *
 * Lösung: ID mit Quell-Präfix kodieren → "fakestore_5" / "dummyjson_5".
 * Das ist das übliche GraphQL-Muster (Global Object Identification, vgl. Relay).
 *
 * Separator '_' (kein ':'), damit die ID sowohl in URL-Pfaden als auch in
 * generateStaticParams-Verzeichnisnamen plattformübergreifend gültig ist.
 */

export type ProductSource = 'fakestore' | 'dummyjson'

const SEP = '_'

/** Kodiert Quelle + numerische ID → "fakestore_5". */
export function encodeProductId(source: ProductSource, id: number | string): string {
  return `${source}${SEP}${id}`
}

/**
 * Dekodiert eine Composite-ID → { source, id }.
 * Rückwärtskompatibel: nackte numerische IDs werden als FakeStore interpretiert.
 */
export function decodeProductId(composite: string): { source: ProductSource; id: number } {
  const idx = composite.indexOf(SEP)
  if (idx > 0) {
    const source = composite.slice(0, idx)
    const rawId = composite.slice(idx + 1)
    if (source === 'fakestore' || source === 'dummyjson') {
      const id = parseInt(rawId, 10)
      return { source, id: Number.isNaN(id) ? 0 : id }
    }
  }
  // Fallback: nackte Zahl → FakeStore
  const numeric = parseInt(composite, 10)
  return { source: 'fakestore', id: Number.isNaN(numeric) ? 0 : numeric }
}
