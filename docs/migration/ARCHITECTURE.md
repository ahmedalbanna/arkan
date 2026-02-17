# PostgreSQL Migration - System Architecture

## Overview
This document describes the complete system architecture for Arkan after migrating from Firebase to PostgreSQL with NextAuth, Prisma, and Hasura.

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Browser)                        │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Next.js App │  │ React Query  │  │ Zustand State Stores     │  │
│  │  (Pages/UI)  │  │ (Server State)│  │ (Client State)          │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────────────┘  │
│         │                  │                  │                       │
│         └──────────────────┴──────────────────┘                       │
│                            │                                          │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                             │ HTTP/WebSocket
                             │
┌────────────────────────────┼──────────────────────────────────────────┐
│                   NEXT.JS SERVER LAYER                                │
│                            │                                           │
│  ┌─────────────────────────┼─────────────────────────────┐           │
│  │         Next.js 15 App Router                          │           │
│  │                         │                              │           │
│  │  ┌──────────────────┐  │  ┌──────────────────────┐   │           │
│  │  │ Server Components│  │  │   API Routes         │   │           │
│  │  │ (SSR/RSC)        │  │  │   /api/*             │   │           │
│  │  └────────┬─────────┘  │  └──────────┬───────────┘   │           │
│  │           │             │             │                │           │
│  │  ┌────────┴─────────┐  │  ┌──────────┴───────────┐   │           │
│  │  │ Server Actions   │  │  │  NextAuth.js         │   │           │
│  │  │ (Form Handling)  │  │  │  Auth Routes         │   │           │
│  │  └────────┬─────────┘  │  └──────────┬───────────┘   │           │
│  │           │             │             │                │           │
│  └───────────┼─────────────┴─────────────┼────────────────┘           │
│              │                           │                            │
│              └───────────┬───────────────┘                            │
│                          │                                            │
│              ┌───────────┴───────────┐                                │
│              │   Prisma ORM Client   │                                │
│              └───────────┬───────────┘                                │
│                          │                                            │
└──────────────────────────┼────────────────────────────────────────────┘
                           │
                           │ PostgreSQL Protocol
                           │
┌──────────────────────────┼────────────────────────────────────────────┐
│                  DATABASE & REALTIME LAYER                            │
│                          │                                            │
│  ┌───────────────────────┴───────────────────────┐                   │
│  │         PostgreSQL Database                   │                   │
│  │  ┌─────────────────────────────────────────┐ │                   │
│  │  │  Tables: users, projects, transactions  │ │                   │
│  │  │  JSONB: Flexible content storage        │ │                   │
│  │  │  RLS: Row-Level Security Policies       │ │                   │
│  │  │  Triggers: Auto-update, audit logging   │ │                   │
│  │  └─────────────────────────────────────────┘ │                   │
│  └───────────────┬───────────────────────────────┘                   │
│                  │                                                    │
│                  │ NOTIFY/LISTEN                                      │
│                  │                                                    │
│  ┌───────────────┴───────────────────────────────┐                   │
│  │           Hasura GraphQL Engine               │                   │
│  │  ┌─────────────────────────────────────────┐ │                   │
│  │  │  GraphQL API (Auto-generated)           │ │                   │
│  │  │  Real-time Subscriptions (WebSocket)    │ │                   │
│  │  │  Permissions & Authorization            │ │                   │
│  │  └─────────────────────────────────────────┘ │                   │
│  └───────────────────────────────────────────────┘                   │
│                          │                                            │
└──────────────────────────┼────────────────────────────────────────────┘
                           │
                           │ WebSocket/GraphQL
                           │
                    ┌──────┴──────┐
                    │   Client    │
                    │ (Realtime)  │
                    └─────────────┘
```

---

## Technology Stack Comparison

### Current (Firebase)
| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 18 |
| **Authentication** | Firebase Auth |
| **Database** | Firestore NoSQL |
| **Storage** | Firebase Storage |
| **Real-time** | Firestore onSnapshot |
| **Backend** | Firebase Functions, Next.js API Routes |
| **State Management** | Zustand, React Query |

### New (PostgreSQL)
| Layer | Technology | Why? |
|-------|------------|------|
| **Frontend** | Next.js 15, React 18 | ✅ No change |
| **Authentication** | NextAuth.js | Better integration, flexible providers |
| **Database** | PostgreSQL + Prisma | ACID compliance, relational integrity |
| **Storage** | Firebase Storage | ✅ Keep (or migrate to S3/Cloudinary later) |
| **Real-time** | Hasura GraphQL Subscriptions | Live updates, auto-generated API |
| **Backend** | Next.js API Routes, Server Actions | ✅ No change |
| **State Management** | Zustand, React Query | ✅ No change |

---

## Core Architecture Components

### 1. Client Layer

#### React Application
```typescript
// Client-side architecture
┌─────────────────────────────────────┐
│         Next.js App Router          │
│  ┌───────────────────────────────┐  │
│  │    Pages & Route Handlers     │  │
│  │  - /app/dashboard/page.tsx    │  │
│  │  - /app/builder/page.tsx      │  │
│  │  - /app/api/*/route.ts        │  │
│  └───────────────────────────────┘  │
│                 │                    │
│  ┌──────────────┴──────────────┐    │
│  │   UI Components Layer       │    │
│  │  - shadcn/ui components     │    │
│  │  - Custom business logic    │    │
│  └──────────────┬──────────────┘    │
│                 │                    │
│  ┌──────────────┴──────────────┐    │
│  │   State Management Layer    │    │
│  │  - React Query (server)     │    │
│  │  - Zustand (client UI)      │    │
│  │  - GraphQL Client (Hasura)  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Key Patterns**:
- **Server Components**: Default for data fetching
- **Client Components**: For interactivity (`'use client'`)
- **React Query**: Server state management with caching
- **Zustand**: Client-side UI state (modals, forms)

#### State Management Strategy

**Server State** (React Query):
```typescript
// Query user data
const { data: user, isLoading } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId)
});

// Mutate with optimistic updates
const updateProject = useMutation({
  mutationFn: (data) => apiService.updateProject(data),
  onMutate: async (newData) => {
    // Optimistic update
    await queryClient.cancelQueries(['projects']);
    const previous = queryClient.getQueryData(['projects']);
    queryClient.setQueryData(['projects'], (old) => ({
      ...old,
      ...newData
    }));
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['projects'], context.previous);
  }
});
```

**Client State** (Zustand):
```typescript
// UI state store
const useEditorStore = create((set) => ({
  isPreviewOpen: false,
  selectedChapter: null,
  openPreview: () => set({ isPreviewOpen: true }),
  closePreview: () => set({ isPreviewOpen: false }),
  selectChapter: (id) => set({ selectedChapter: id })
}));
```

**Real-time State** (GraphQL Subscriptions):
```typescript
// Subscribe to credit changes
const { data } = useSubscription(
  gql`
    subscription UserCredits($userId: uuid!) {
      users_by_pk(id: $userId) {
        credits
        updated_at
      }
    }
  `,
  { variables: { userId } }
);
```

---

### 2. Server Layer (Next.js)

#### Authentication Flow (NextAuth.js)

```typescript
// /app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user || !user.passwordHash) return null;
        
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        
        return isValid ? user : null;
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      // Add custom user data to session
      session.user.id = user.id;
      session.user.role = user.role;
      session.user.credits = user.credits;
      return session;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Authentication Middleware**:
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      // Protect admin routes
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return token?.role === 'admin';
      }
      // Require auth for all other protected routes
      return !!token;
    }
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/builder/:path*', '/admin/:path*']
};
```

#### Prisma Integration

**Client Setup**:
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Example Service Pattern**:
```typescript
// services/userService.ts
import { prisma } from '@/lib/prisma';

export class UserService {
  async getUser(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        projects: {
          where: { deletedAt: null },
          orderBy: { updatedAt: 'desc' }
        }
      }
    });
  }
  
  async updateCredits(userId: string, amount: number) {
    return await prisma.$transaction(async (tx) => {
      // Get current user
      const user = await tx.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) throw new Error('User not found');
      
      const newBalance = user.credits + amount;
      if (newBalance < 0) throw new Error('Insufficient credits');
      
      // Update user credits
      const updated = await tx.user.update({
        where: { id: userId },
        data: { credits: newBalance }
      });
      
      // Create ledger entry (via trigger or manually)
      await tx.creditLedger.create({
        data: {
          userId,
          amount,
          balanceBefore: user.credits,
          balanceAfter: newBalance,
          transactionType: amount > 0 ? 'purchase' : 'deduction',
          description: `Credit ${amount > 0 ? 'addition' : 'deduction'}`
        }
      });
      
      return updated;
    });
  }
}
```

#### API Route Pattern

```typescript
// /app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectType: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse and validate
    const body = await request.json();
    const data = CreateProjectSchema.parse(body);
    
    // Create project
    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description,
        projectType: data.projectType,
        status: 'draft',
        content: {},
        meta: {},
        settings: {}
      }
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Project creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const projects = await prisma.project.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null
    },
    orderBy: { updatedAt: 'desc' }
  });
  
  return NextResponse.json(projects);
}
```

---

### 3. Database Layer (PostgreSQL)

#### Connection Pooling

**Development** (Direct connection):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/arkan_dev"
```

**Production** (Connection pooling with PgBouncer):
```env
DATABASE_URL="postgresql://user:password@pgbouncer:6432/arkan_prod?pgbouncer=true"
DIRECT_URL="postgresql://user:password@postgres:5432/arkan_prod"
```

#### Row-Level Security (RLS)

Implement Firestore-like security rules using PostgreSQL RLS:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (id = current_setting('app.user_id')::uuid);

-- Admins can read all users
CREATE POLICY users_select_admin ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = current_setting('app.user_id')::uuid
      AND role = 'admin'
    )
  );

-- Users can update their own profile (limited fields)
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (id = current_setting('app.user_id')::uuid)
  WITH CHECK (
    id = current_setting('app.user_id')::uuid
    AND role = OLD.role -- Cannot change own role
    AND credits = OLD.credits -- Cannot change own credits directly
  );

-- Projects: users can manage their own
CREATE POLICY projects_all_own ON projects
  FOR ALL
  USING (user_id = current_setting('app.user_id')::uuid);
```

**Set user context in API calls**:
```typescript
// In API route handler
await prisma.$executeRaw`SET LOCAL app.user_id = ${session.user.id}`;
```

---

### 4. Real-time Layer (Hasura)

#### Hasura Configuration

**docker-compose.yml** (added to existing):
```yaml
hasura:
  image: hasura/graphql-engine:latest
  ports:
    - "8080:8080"
  depends_on:
    - postgres
  environment:
    HASURA_GRAPHQL_DATABASE_URL: postgresql://user:password@postgres:5432/arkan
    HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
    HASURA_GRAPHQL_ADMIN_SECRET: ${HASURA_ADMIN_SECRET}
    HASURA_GRAPHQL_JWT_SECRET: '{"type":"HS256","key":"${NEXTAUTH_SECRET}"}'
    HASURA_GRAPHQL_UNAUTHORIZED_ROLE: "anonymous"
```

#### GraphQL Schema Generation

Hasura auto-generates GraphQL schema from PostgreSQL tables:

```graphql
# Auto-generated queries
type User {
  id: uuid!
  email: String!
  name: String!
  credits: Int!
  projects(where: project_bool_exp, order_by: [project_order_by!]): [Project!]!
}

type Query {
  users(where: user_bool_exp): [User!]!
  users_by_pk(id: uuid!): User
  projects(where: project_bool_exp): [Project!]!
}

type Mutation {
  update_users_by_pk(pk_columns: users_pk_columns_input!, _set: users_set_input!): User
}

type Subscription {
  users(where: user_bool_exp): [User!]!
  users_by_pk(id: uuid!): User
}
```

#### Permission Rules in Hasura

```json
// User select permissions
{
  "role": "user",
  "permission": {
    "columns": ["id", "email", "name", "credits", "role"],
    "filter": {
      "id": {
        "_eq": "X-Hasura-User-Id"
      }
    }
  }
}

// Projects permissions
{
  "role": "user",
  "permission": {
    "columns": "*",
    "filter": {
      "user_id": {
        "_eq": "X-Hasura-User-Id"
      }
    }
  }
}
```

#### Client Integration

```typescript
// Apollo Client setup
import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = new HttpLink({
  uri: 'http://localhost:8080/v1/graphql',
  headers: {
    'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET,
    // Or use JWT from NextAuth session
  }
});

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:8080/v1/graphql',
  connectionParams: {
    headers: {
      'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET
    }
  }
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

**Real-time Credit Updates**:
```typescript
// Component subscribing to credit changes
function CreditDisplay({ userId }) {
  const { data, loading } = useSubscription(
    gql`
      subscription GetUserCredits($userId: uuid!) {
        users_by_pk(id: $userId) {
          credits
        }
      }
    `,
    { variables: { userId } }
  );
  
  return <div>Credits: {data?.users_by_pk?.credits ?? 0}</div>;
}
```

---

## Data Flow Patterns

### Pattern 1: Server-Side Rendering (SSR)

```typescript
// Server Component - Direct Prisma query
async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    take: 10
  });
  
  return <ProjectList projects={projects} />;
}
```

### Pattern 2: Client-Side Data Fetching

```typescript
// Client Component with React Query
'use client';

function ProjectsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      return res.json();
    }
  });
  
  if (isLoading) return <Skeleton />;
  return <ProjectList projects={data} />;
}
```

### Pattern 3: Server Actions (Forms)

```typescript
// Server Action for form submission
'use server';

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');
  
  const title = formData.get('title') as string;
  
  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      title,
      status: 'draft'
    }
  });
  
  revalidatePath('/dashboard');
  return { success: true, project };
}

// Client component
'use client';
function CreateProjectForm() {
  return (
    <form action={createProject}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Pattern 4: Real-time Subscriptions

```typescript
// Notification system
function NotificationBell({ userId }) {
  const { data } = useSubscription(
    gql`
      subscription UnreadNotifications($userId: uuid!) {
        notifications(
          where: {
            user_id: { _eq: $userId },
            is_read: { _eq: false }
          }
        ) {
          id
          title
          message
          created_at
        }
      }
    `,
    { variables: { userId } }
  );
  
  const count = data?.notifications?.length ?? 0;
  
  return <Bell badge={count} />;
}
```

---

## Performance Optimization Strategies

### 1. Database Query Optimization

```typescript
// Use select to minimize data transfer
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    credits: true,
    // Don't fetch entire apiKeys JSONB if not needed
  }
});

// Use connection pooling
// Configured via DATABASE_URL with pgbouncer

// Index optimization
// Already defined in schema.prisma
```

### 2. Caching Strategies

**React Query Cache**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    }
  }
});
```

**Next.js Cache**:
```typescript
// Revalidate on-demand
import { revalidatePath, revalidateTag } from 'next/cache';

// After mutation
await prisma.project.update({...});
revalidatePath('/dashboard');
revalidateTag('projects');
```

### 3. Connection Management

- **PgBouncer**: Connection pooling for PostgreSQL
- **Prisma Connection Pool**: Configure in `schema.prisma`
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    relationMode = "prisma"
    connectionLimit = 20
  }
  ```

---

## Security Architecture

### 1. Authentication Flow
```
User Login → NextAuth.js → Verify Credentials → Create Session
     ↓                              ↓
JWT Token ← Session Stored in DB → Session Cookie
```

### 2. Authorization Layers

1. **Next.js Middleware**: Route protection
2. **API Route Guards**: Session validation
3. **Prisma RLS**: Database-level security
4. **Hasura Permissions**: GraphQL access control

### 3. Data Encryption

- **At Rest**: PostgreSQL TDE (Transparent Data Encryption)
- **In Transit**: SSL/TLS for all connections
- **Application Layer**: Encrypt sensitive JSONB fields (API keys)

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│              Vercel / Cloud Platform                │
│  ┌───────────────────────────────────────────────┐  │
│  │         Next.js Application                   │  │
│  │  - Server Components                          │  │
│  │  - API Routes                                 │  │
│  │  - NextAuth.js                                │  │
│  └─────────────┬─────────────────────────────────┘  │
└────────────────┼────────────────────────────────────┘
                 │
                 ├──────────────────┬─────────────────┐
                 │                  │                 │
        ┌────────▼────────┐  ┌──────▼──────┐  ┌──────▼──────┐
        │   PostgreSQL    │  │   Hasura    │  │   Storage   │
        │   (Managed)     │  │   Cloud     │  │  (Firebase) │
        │  - Supabase     │  │             │  │             │
        │  - Neon         │  │             │  │             │
        │  - Railway      │  │             │  │             │
        └─────────────────┘  └─────────────┘  └─────────────┘
```

---

## Monitoring & Observability

### 1. Database Monitoring
- **Prisma Studio**: Visual database browser
- **PostgreSQL Logs**: Query performance analysis
- **Connection Pool Metrics**: Monitor active connections

### 2. Application Monitoring
- **Next.js Analytics**: Vercel Analytics
- **Error Tracking**: Sentry integration
- **Performance**: Web Vitals monitoring

### 3. Real-time Monitoring
- **Hasura Console**: GraphQL operation tracking
- **WebSocket Connections**: Monitor active subscriptions

---

## Summary

The new architecture provides:
- ✅ **ACID Compliance**: PostgreSQL for financial data integrity
- ✅ **Flexibility**: JSONB for dynamic content
- ✅ **Real-time**: Hasura GraphQL subscriptions
- ✅ **Modern Auth**: NextAuth.js with multiple providers
- ✅ **Type Safety**: Prisma ORM with TypeScript
- ✅ **Scalability**: Connection pooling, optimized queries
- ✅ **Security**: Multi-layer authorization and RLS
- ✅ **Developer Experience**: Prisma Studio, Hasura Console

This architecture maintains the benefits of the current Firebase setup while adding the reliability and integrity needed for a production financial application.
