/**
 * GraphQL Execution Context.
 * Wird für jede Request-Instanz neu erstellt.
 * Enthält:
 *  - token:   rohes JWT aus dem Authorization Header (null wenn nicht eingeloggt)
 *  - loaders: per-Request DataLoader (verhindert N+1 bei Cart-Auflösung)
 *
 * User-Daten werden lazy im `me` Resolver via DummyJsonAPI.getCurrentUser() geladen.
 */

import type { YogaInitialContext } from 'graphql-yoga'
import { createLoaders, type Loaders } from './loaders'

export interface GraphQLContext {
  /** Raw JWT aus dem Authorization Header (Bearer <token>). null wenn nicht eingeloggt. */
  token: string | null
  /** Per-Request DataLoader-Instanzen. */
  loaders: Loaders
}

export async function buildContext({ request }: YogaInitialContext): Promise<GraphQLContext> {
  const authHeader = request.headers.get('Authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  return { token, loaders: createLoaders() }
}
