/**
 * Schema Assembly — typeDefs + alle Resolver zusammenführen.
 * Exportiert ein fertiges GraphQL-Schema für createYoga().
 */

import { createSchema } from 'graphql-yoga'
import { typeDefs } from './typeDefs'
import { queryResolvers } from './resolvers/query'
import { mutationResolvers } from './resolvers/mutation'
import { typeResolvers } from './resolvers/types'

export const schema = createSchema({
  typeDefs,
  resolvers: {
    ...queryResolvers,
    ...mutationResolvers,
    ...typeResolvers,
  },
})
