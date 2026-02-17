# Hasura Real-time Integration Strategy

## Overview
Hasura provides GraphQL subscriptions over WebSocket for real-time updates. This document covers setup, configuration, and implementation patterns.

---

## Why Hasura?

✅ **Auto-generated GraphQL API** from PostgreSQL schema  
✅ **Built-in subscriptions** with PostgreSQL LISTEN/NOTIFY  
✅ **Fine-grained permissions** per table/column  
✅ **JWT integration** with NextAuth  
✅ **Zero code** for basic CRUD operations  
✅ **Scalable** WebSocket connections  

---

## Setup & Configuration

### Docker Compose Integration
```yaml
# Add to existing docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: arkan
      POSTGRES_USER: arkan_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  hasura:
    image: hasura/graphql-engine:v2.36.0
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    environment:
      HASURA_GRAPHQL_DATABASE_URL: postgresql://arkan_user:${DB_PASSWORD}@postgres:5432/arkan
      HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
      HASURA_GRAPHQL_DEV_MODE: "true"
      HASURA_GRAPHQL_ENABLED_LOG_TYPES: startup, http-log, webhook-log, websocket-log, query-log
      HASURA_GRAPHQL_ADMIN_SECRET: ${HASURA_ADMIN_SECRET}
      HASURA_GRAPHQL_JWT_SECRET: '{"type":"HS256","key":"${NEXTAUTH_SECRET}"}'
      HASURA_GRAPHQL_UNAUTHORIZED_ROLE: anonymous
```

### Environment Variables
```env
# .env.local
DATABASE_URL="postgresql://arkan_user:password@localhost:5432/arkan"
HASURA_ADMIN_SECRET="your-super-secret-admin-key"
HASURA_GRAPHQL_URL="http://localhost:8080/v1/graphql"
HASURA_GRAPHQL_WS_URL="ws://localhost:8080/v1/graphql"
NEXTAUTH_SECRET="your-nextauth-secret"
```

---

## NextAuth JWT Integration

### Configure NextAuth for Hasura
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

export const authOptions = {
  // ... other config
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
      }
      
      // Add Hasura claims
      token['https://hasura.io/jwt/claims'] = {
        'x-hasura-allowed-roles': [token.role || 'user'],
        'x-hasura-default-role': token.role || 'user',
        'x-hasura-user-id': token.userId,
      };
      
      return token;
    },
    
    async session({ session, token }) {
      session.user.id = token.userId;
      session.user.role = token.role;
      return session;
    }
  }
};
```

---

## Hasura Metadata Configuration

### Track Tables
```bash
# Access Hasura Console
# http://localhost:8080

# Track all tables from public schema
# Data > Public > Track All
```

### Define Relationships
Hasura auto-detects foreign keys and suggests relationships:

```yaml
# Example: projects -> users relationship
- table:
    schema: public
    name: projects
  object_relationships:
    - name: user
      using:
        foreign_key_constraint_on: user_id
```

### Permissions Setup

**User Role - Read Own Data**:
```json
{
  "role": "user",
  "permission": {
    "columns": ["id", "title", "description", "content", "created_at", "updated_at"],
    "filter": {
      "user_id": {
        "_eq": "X-Hasura-User-Id"
      }
    },
    "allow_aggregations": false
  }
}
```

**User Role - Update Own Data**:
```json
{
  "role": "user",
  "permission": {
    "columns": ["title", "description", "content", "settings"],
    "filter": {
      "user_id": {
        "_eq": "X-Hasura-User-Id"
      }
    },
    "check": {
      "user_id": {
        "_eq": "X-Hasura-User-Id"
      }
    }
  }
}
```

**Admin Role - Full Access**:
```json
{
  "role": "admin",
  "permission": {
    "columns": "*",
    "filter": {},
    "allow_aggregations": true
  }
}
```

---

## Client Setup (Apollo Client)

### Installation
```bash
npm install @apollo/client graphql graphql-ws
```

### Apollo Client Configuration
```typescript
// lib/apollo-client.ts
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { getSession } from 'next-auth/react';

// HTTP connection for queries and mutations
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL,
  headers: async () => {
    const session = await getSession();
    return {
      authorization: session?.accessToken ? `Bearer ${session.accessToken}` : '',
    };
  },
});

// WebSocket connection for subscriptions
const wsLink = typeof window !== 'undefined' ? new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_WS_URL!,
    connectionParams: async () => {
      const session = await getSession();
      return {
        headers: {
          authorization: session?.accessToken ? `Bearer ${session.accessToken}` : '',
        },
      };
    },
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

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

### Provider Setup
```typescript
// app/providers.tsx
'use client';

import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
}
```

---

## Real-time Use Cases

### 1. Credit Updates
```typescript
'use client';

import { useSubscription, gql } from '@apollo/client';

const USER_CREDITS_SUBSCRIPTION = gql`
  subscription UserCredits($userId: uuid!) {
    users_by_pk(id: $userId) {
      id
      credits
      updated_at
    }
  }
`;

export function CreditBadge({ userId }: { userId: string }) {
  const { data, loading } = useSubscription(USER_CREDITS_SUBSCRIPTION, {
    variables: { userId },
  });

  if (loading) return <Skeleton className="h-6 w-20" />;

  return (
    <Badge variant="secondary">
      <Coins className="mr-1 h-4 w-4" />
      {data?.users_by_pk?.credits ?? 0} Credits
    </Badge>
  );
}
```

### 2. Live Project Updates
```typescript
const PROJECT_SUBSCRIPTION = gql`
  subscription ProjectUpdates($projectId: uuid!) {
    projects_by_pk(id: $projectId) {
      id
      title
      content
      updated_at
      user {
        name
      }
    }
  }
`;

export function LiveProjectEditor({ projectId }: { projectId: string }) {
  const { data } = useSubscription(PROJECT_SUBSCRIPTION, {
    variables: { projectId },
  });

  // Auto-sync content when other user updates
  useEffect(() => {
    if (data?.projects_by_pk?.content) {
      syncEditorContent(data.projects_by_pk.content);
    }
  }, [data]);

  return <Editor content={data?.projects_by_pk?.content} />;
}
```

### 3. Notification System
```typescript
const NOTIFICATIONS_SUBSCRIPTION = gql`
  subscription UnreadNotifications($userId: uuid!) {
    notifications(
      where: {
        user_id: { _eq: $userId }
        is_read: { _eq: false }
      }
      order_by: { created_at: desc }
    ) {
      id
      type
      title
      message
      created_at
      action_url
    }
  }
`;

export function NotificationBell({ userId }: { userId: string }) {
  const { data } = useSubscription(NOTIFICATIONS_SUBSCRIPTION, {
    variables: { userId },
  });

  const unreadCount = data?.notifications?.length ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <NotificationList notifications={data?.notifications} />
      </PopoverContent>
    </Popover>
  );
}
```

### 4. AI Generation Progress
```typescript
const GENERATION_STATUS_SUBSCRIPTION = gql`
  subscription GenerationStatus($jobId: uuid!) {
    agent_generations_by_pk(id: $jobId) {
      id
      status
      output_data
      error_message
      execution_time_ms
      completed_at
    }
  }
`;

export function GenerationProgress({ jobId }: { jobId: string }) {
  const { data } = useSubscription(GENERATION_STATUS_SUBSCRIPTION, {
    variables: { jobId },
  });

  const job = data?.agent_generations_by_pk;

  if (job?.status === 'completed') {
    return <GenerationResult output={job.output_data} />;
  }

  if (job?.status === 'failed') {
    return <ErrorDisplay message={job.error_message} />;
  }

  return (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Generating content...</span>
    </div>
  );
}
```

---

## PostgreSQL Triggers for Real-time

### Trigger Setup
```sql
-- Function to notify on table changes
CREATE OR REPLACE FUNCTION notify_hasura_change()
RETURNS TRIGGER AS $$
DECLARE
  payload TEXT;
BEGIN
  -- Build JSON payload
  payload := json_build_object(
    'table', TG_TABLE_NAME,
    'operation', TG_OP,
    'data', row_to_json(NEW)
  )::text;
  
  -- Send notification
  PERFORM pg_notify('hasura_change', payload);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER users_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION notify_hasura_change();

CREATE TRIGGER projects_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION notify_hasura_change();

CREATE TRIGGER notifications_notify_trigger
AFTER INSERT OR UPDATE ON notifications
FOR EACH ROW EXECUTE FUNCTION notify_hasura_change();
```

---

## Advanced Patterns

### Combining with React Query
```typescript
// Use subscriptions for real-time, React Query for mutations
export function useProject(projectId: string) {
  // Real-time subscription for updates
  const { data: liveData } = useSubscription(PROJECT_SUBSCRIPTION, {
    variables: { projectId },
  });

  // Mutation with React Query
  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return response.json();
    },
  });

  return {
    project: liveData?.projects_by_pk,
    updateProject: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
```

### Optimistic UI with Subscriptions
```typescript
const [localData, setLocalData] = useState(null);
const { data: serverData } = useSubscription(...);

// Optimistic update
const handleUpdate = async (newData) => {
  setLocalData(newData); // Immediate UI update
  
  try {
    await updateProject(newData);
    // Server will push update via subscription
  } catch (error) {
    setLocalData(null); // Revert on error
    toast.error('Update failed');
  }
};

// Display optimistic or server data
const displayData = localData ?? serverData;
```

---

## Performance Considerations

### 1. Subscription Limits
```typescript
// Limit active subscriptions per client
const MAX_SUBSCRIPTIONS = 10;

// Use subscription multiplexing when possible
const { data } = useSubscription(MULTIPLE_ENTITIES_SUB, {
  variables: { ids: [id1, id2, id3] }, // Single subscription
});
```

### 2. Debounced Updates
```typescript
// Avoid too frequent re-renders
import { useDebounce } from '@/hooks/use-debounce';

const { data } = useSubscription(PROJECT_SUBSCRIPTION);
const debouncedData = useDebounce(data, 500); // Update UI every 500ms max
```

### 3. Conditional Subscriptions
```typescript
// Only subscribe when needed
const { data } = useSubscription(NOTIFICATIONS_SUB, {
  variables: { userId },
  skip: !isUserOnline, // Don't subscribe if user is offline
});
```

---

## Migration from Firestore onSnapshot

### Before (Firestore)
```typescript
const unsubscribe = onSnapshot(
  doc(db, 'users', userId),
  (snapshot) => {
    setUser(snapshot.data());
  }
);
```

### After (Hasura)
```typescript
const { data } = useSubscription(
  gql`
    subscription User($userId: uuid!) {
      users_by_pk(id: $userId) {
        id
        email
        credits
      }
    }
  `,
  { variables: { userId } }
);
```

**Advantages**:
- Type-safe queries with GraphQL
- Better error handling
- Built-in loading states
- Automatic reconnection

---

## Monitoring & Debugging

### Hasura Console
- **GraphiQL**: Test queries/subscriptions
- **Remote Schemas**: Combine multiple GraphQL APIs
- **Event Triggers**: React to database events
- **Scheduled Triggers**: Cron-like jobs

### Logging
```typescript
// Enable detailed logging
const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URL,
    on: {
      connected: () => console.log('WebSocket connected'),
      error: (error) => console.error('WebSocket error:', error),
      closed: () => console.log('WebSocket closed'),
    },
  })
);
```

---

## Summary

Hasura provides:
- ✅ Auto-generated GraphQL API
- ✅ Real-time subscriptions
- ✅ Row-level security
- ✅ JWT integration with NextAuth
- ✅ Zero backend code for CRUD

This enables features like live credit updates, collaborative editing, and real-time notifications with minimal development effort.
