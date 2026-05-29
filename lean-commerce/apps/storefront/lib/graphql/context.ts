/**
 * GraphQL Execution Context.
 * Wird für jede Request-Instanz neu erstellt.
 * Enthält: den rohen JWT-Token aus dem Authorization Header.
 * User-Daten werden lazy im `me` Resolver via DummyJsonAPI.getCurrentUser() geladen.
 */

import type { YogaInitialContext } from 'graphql-yoga'

export interface GraphQLContext {
  /** Raw JWT aus dem Authorization Header (Bearer <token>). null wenn nicht eingeloggt. */
  token: string | null
}

export async function buildContext({ request }: YogaInitialContext): Promise<GraphQLContext> {
  const authHeader = request.headers.get('Authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  return { token }
}
