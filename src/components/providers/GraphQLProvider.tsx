
'use client';

import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { useSession } from 'next-auth/react';
import { createClient } from 'graphql-ws';
import { useMemo } from 'react';

export function GraphQLProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const client = useMemo(() => {
    const httpLink = new HttpLink({
      uri: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL || 'http://localhost:8080/v1/graphql',
    });

    // WebSocket link for subscriptions (only on client)
    const wsLink = typeof window !== 'undefined' ? new GraphQLWsLink(
      createClient({
        url: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_WS_URL || 'ws://localhost:8080/v1/graphql',
        connectionParams: () => ({
          headers: session?.hasuraToken || {},
        }),
      })
    ) : null;

    // Split based on operation type
    const splitLink = typeof window !== 'undefined' && wsLink
      ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        httpLink
      )
      : httpLink;

    return new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
        },
      },
    });
  }, [session]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
