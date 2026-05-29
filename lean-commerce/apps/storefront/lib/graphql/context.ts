/**
 * GraphQL Execution Context.
 * Wird für jede Request-Instanz neu erstellt.
 * Enthält: JWT-Token des eingeloggten Users (falls vorhanden).
 */

import type { YogaInitialContext } from 'graphql-yoga'

export interface GraphQLContext {
  /** Raw JWT aus dem Authorization Header (Bearer <token>). */
  token: string | null
}

export async function buildContext({ request }: YogaInitialContext): Promise<GraphQLContext> {
  const authHeader = request.headers.get('Authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  return { token }
}
