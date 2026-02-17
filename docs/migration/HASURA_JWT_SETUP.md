# Hasura JWT Authentication Setup

This guide explains how to configure Hasura to work with NextAuth JWT tokens.

## Overview

The authentication flow:
1. User authenticates via NextAuth (email/password or OAuth)
2. NextAuth generates JWT token with Hasura claims
3. Frontend sends JWT to Hasura in Authorization header
4. Hasura validates JWT and sets session variables
5. RLS policies use session variables to filter data

## JWT Token Structure

NextAuth JWT includes Hasura claims in the `https://hasura.io/jwt/claims` namespace:

```json
{
  "userId": "user-id-here",
  "email": "user@example.com",
  "role": "USER",
  "https://hasura.io/jwt/claims": {
    "x-hasura-allowed-roles": ["USER", "anonymous"],
    "x-hasura-default-role": "USER",
    "x-hasura-user-id": "user-id-here",
    "x-hasura-role": "USER"
  }
}
```

## Hasura Configuration

### 1. JWT Secret Configuration

Already configured in `docker-compose.yml`:

```yaml
HASURA_GRAPHQL_JWT_SECRET: '{"type":"HS256","key":"${NEXTAUTH_SECRET}"}'
```

**Important**: The `key` must match your `NEXTAUTH_SECRET` environment variable.

### 2. Set Session Variables

Hasura automatically extracts session variables from JWT claims:
- `x-hasura-user-id` → Available as `current_user_id()` in RLS
- `x-hasura-role` → Determines permissions
- `x-hasura-allowed-roles` → Roles user can assume

### 3. Configure RLS Helper

Update RLS helper function to read from Hasura session:

```sql
-- Updated current_user_id() function
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS TEXT AS $$
BEGIN
    -- Get from Hasura JWT session variable
    RETURN current_setting('request.jwt.claims', true)::json->>'x-hasura-user-id';
EXCEPTION
    WHEN OTHERS THEN
        -- Fallback to app setting (for Prisma/direct connections)
        RETURN current_setting('app.current_user_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Frontend Integration

### 1. Get Session Token

```typescript
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session } = useSession();
  
  // JWT token is in session.accessToken
  const token = session?.accessToken;
}
```

### 2. Send to Hasura

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL,
});

const authLink = setContext(async (_, { headers }) => {
  const session = await getSession();
  
  return {
    headers: {
      ...headers,
      authorization: session?.accessToken ? `Bearer ${session.accessToken}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

### 3. GraphQL Query Example

```typescript
import { gql, useQuery } from '@apollo/client';

const GET_MY_PROJECTS = gql`
  query GetMyProjects {
    projects {
      id
      title
      description
      created_at
    }
  }
`;

function MyProjects() {
  const { data, loading, error } = useQuery(GET_MY_PROJECTS);
  
  // RLS automatically filters to show only user's projects
  return (
    <div>
      {data?.projects.map(project => (
        <div key={project.id}>{project.title}</div>
      ))}
    </div>
  );
}
```

## Hasura Console Setup

### 1. Track Tables

1. Open Hasura Console: http://localhost:8080
2. Go to **Data** tab
3. Click **Track All** to track all tables
4. Verify relationships are auto-detected

### 2. Set Permissions

For each table, configure permissions for the `user` role:

#### Example: Projects Table

**Select Permission**:
```json
{
  "user_id": {
    "_eq": "X-Hasura-User-Id"
  }
}
```

**Insert Permission**:
```json
{
  "user_id": {
    "_eq": "X-Hasura-User-Id"
  }
}
```

**Update Permission**:
- Row select: Same as above
- Column update: Allow specific columns only

**Delete Permission**:
```json
{
  "user_id": {
    "_eq": "X-Hasura-User-Id"
  }
}
```

### 3. Admin Role

For `admin` role, set all permissions to allow without checks:
- Select: `{}`
- Insert: `{}`
- Update: `{}`
- Delete: `{}`

## Testing JWT Authentication

### 1. Get JWT Token

```bash
# Login via NextAuth API
curl -X POST http://localhost:9002/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@arkan.dev",
    "password": "admin123"
  }'
```

### 2. Test Hasura Query

```bash
# Use JWT token from session
curl -X POST http://localhost:8080/v1/graphql \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { users { id email name } }"
  }'
```

### 3. Verify Session Variables

In Hasura Console:
1. Go to **API** tab
2. Add header: `Authorization: Bearer YOUR_JWT_TOKEN`
3. Run query
4. Check "Analyze" tab to see session variables

## Real-time Subscriptions

### 1. WebSocket Connection

```typescript
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_WS_URL!,
    connectionParams: async () => {
      const session = await getSession();
      return {
        headers: {
          Authorization: session?.accessToken ? `Bearer ${session.accessToken}` : '',
        },
      };
    },
  })
);
```

### 2. Subscription Example

```typescript
import { gql, useSubscription } from '@apollo/client';

const NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotification {
    notifications(
      where: { is_read: { _eq: false } }
      order_by: { created_at: desc }
    ) {
      id
      title
      message
      created_at
    }
  }
`;

function NotificationBell() {
  const { data } = useSubscription(NOTIFICATION_SUBSCRIPTION);
  
  return (
    <div>
      {data?.notifications.length > 0 && (
        <Badge>{data.notifications.length}</Badge>
      )}
    </div>
  );
}
```

## Security Best Practices

### 1. JWT Secret Management

- **Never commit** `NEXTAUTH_SECRET` to version control
- Use strong random string: `openssl rand -base64 32`
- Rotate secrets periodically in production

### 2. Token Expiration

- Set appropriate `maxAge` in NextAuth session config
- Default: 30 days (configurable)
- Implement refresh token flow for longer sessions

### 3. HTTPS Only

- Always use HTTPS in production
- Set `secure: true` for cookies
- Configure CORS properly

### 4. Rate Limiting

- Implement rate limiting on GraphQL API
- Use Hasura Cloud features or custom middleware
- Monitor for abuse patterns

## Troubleshooting

### JWT Verification Failed

**Error**: `Could not verify JWT: JWTExpired`

**Solution**: 
- Check JWT expiration time
- Refresh session
- Verify `NEXTAUTH_SECRET` matches Hasura config

### Session Variables Not Set

**Error**: `x-hasura-user-id not found`

**Solution**:
- Verify JWT claims structure
- Check Hasura console "Analyze" tab
- Ensure JWT callback is adding claims correctly

### RLS Not Working

**Error**: `User can see other users' data`

**Solution**:
- Verify RLS policies are enabled
- Check `current_user_id()` function
- Test with different users
- Review Hasura permissions

## Migration Checklist

- [ ] NextAuth configured with JWT strategy
- [ ] JWT secret matches between NextAuth and Hasura
- [ ] Hasura claims added to JWT callback
- [ ] RLS helper function updated
- [ ] Hasura tables tracked
- [ ] Hasura permissions configured for `user` role
- [ ] Hasura permissions configured for `admin` role
- [ ] Frontend Apollo Client configured
- [ ] WebSocket subscriptions working
- [ ] JWT authentication tested
- [ ] RLS policies verified with real tokens

## Next Steps

1. Configure all Hasura table permissions
2. Test authentication flow end-to-end
3. Implement real-time subscriptions
4. Add user management UI
5. Proceed to Phase 3: Data Migration
