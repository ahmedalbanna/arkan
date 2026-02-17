# Development Environment Setup Guide

## Prerequisites

Before starting the migration, ensure you have:

- ✅ **Node.js** 18+ installed
- ✅ **Docker Desktop** installed and running
- ✅ **Git** installed
- ✅ **Firebase Admin SDK** credentials
- ✅ Basic knowledge of PostgreSQL and Docker

---

## Quick Start (5 Minutes)

```bash
# 1. Clone and navigate to project
cd /path/to/arkan

# 2. Copy environment template
cp docs/migration/.env.migration.example .env.local

# 3. Start PostgreSQL + Hasura
docker-compose -f docs/migration/docker-compose.migration.yml up -d postgres hasura

# 4. Wait for services to be healthy
docker-compose -f docs/migration/docker-compose.migration.yml ps

# 5. Install dependencies
npm install prisma @prisma/client @next-auth/prisma-adapter next-auth

# 6. Copy Prisma schema
cp docs/migration/schema.prisma prisma/schema.prisma

# 7. Run initial migration
npx prisma migrate dev --name init

# 8. Generate Prisma Client
npx prisma generate

# 9. Open Prisma Studio to verify
npx prisma studio
```

Your development environment is ready! 🎉

---

## Detailed Setup Instructions

### Step 1: Environment Configuration

#### 1.1 Create Environment File

```bash
cp docs/migration/.env.migration.example .env.local
```

#### 1.2 Update Critical Variables

Open `.env.local` and update:

```env
# PostgreSQL
POSTGRES_PASSWORD=your-secure-password-here

# NextAuth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Hasura
HASURA_ADMIN_SECRET=your-hasura-admin-secret
```

Generate secure secrets:
```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate Hasura admin secret
openssl rand -base64 32
```

#### 1.3 Keep Firebase Credentials

During migration, keep your existing Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... other Firebase config
```

---

### Step 2: Start Docker Services

#### 2.1 Start Core Services

```bash
# Start PostgreSQL and Hasura only
docker-compose -f docs/migration/docker-compose.migration.yml up -d postgres hasura

# View logs
docker-compose -f docs/migration/docker-compose.migration.yml logs -f

# Check service health
docker-compose -f docs/migration/docker-compose.migration.yml ps
```

Expected output:
```
NAME                      STATUS              PORTS
arkan-postgres-migration  Up (healthy)        0.0.0.0:5432->5432/tcp
arkan-hasura-migration    Up (healthy)        0.0.0.0:8080->8080/tcp
```

#### 2.2 Optional: Start Additional Services

```bash
# Start pgAdmin (database UI)
docker-compose -f docs/migration/docker-compose.migration.yml --profile tools up -d pgadmin

# Start Redis (caching)
docker-compose -f docs/migration/docker-compose.migration.yml --profile cache up -d redis

# Start PgBouncer (connection pooling - for production testing)
docker-compose -f docs/migration/docker-compose.migration.yml --profile production up -d pgbouncer
```

#### 2.3 Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Hasura Console** | http://localhost:8080 | Admin Secret from `.env.local` |
| **pgAdmin** | http://localhost:5050 | Email: `admin@arkan.local`, Password: `admin` |
| **Prisma Studio** | Run `npx prisma studio` | Auto-opens at http://localhost:5555 |
| **PostgreSQL** | `localhost:5432` | User/Pass from `.env.local` |

---

### Step 3: Setup Prisma

#### 3.1 Install Prisma

```bash
npm install -D prisma
npm install @prisma/client
```

#### 3.2 Initialize Prisma

```bash
# Initialize Prisma (creates prisma/ folder)
npx prisma init

# Copy migration schema
cp docs/migration/schema.prisma prisma/schema.prisma
```

#### 3.3 Run Initial Migration

```bash
# Create initial migration
npx prisma migrate dev --name init

# This will:
# 1. Create all tables in PostgreSQL
# 2. Generate Prisma Client
# 3. Apply triggers and constraints
```

#### 3.4 Verify Database Schema

```bash
# Open Prisma Studio
npx prisma studio

# Or connect with psql
docker exec -it arkan-postgres-migration psql -U arkan_user -d arkan_dev

# List all tables
\dt

# Describe users table
\d users
```

Expected tables (17 total):
```
users, accounts, sessions, verification_tokens,
projects, transactions, credit_ledger,
agent_generations, features, agents, agent_categories,
sections, templates, settings,
indexed_documents, device_tokens, notifications
```

---

### Step 4: Setup Hasura

#### 4.1 Access Hasura Console

1. Open http://localhost:8080
2. Enter admin secret from `.env.local`
3. You should see the Hasura console

#### 4.2 Track All Tables

1. Go to **Data** tab
2. Click **public** schema
3. Click **Track All** button
4. All 17 tables should now be tracked

#### 4.3 Configure Relationships

Hasura auto-detects foreign keys. Review suggested relationships:

1. Go to **Data > public > users**
2. Click **Relationships** tab
3. Click **Track All** for suggested relationships

Expected relationships:
- `users` → `projects` (one-to-many)
- `users` → `transactions` (one-to-many)
- `projects` → `user` (many-to-one)
- etc.

#### 4.4 Setup Permissions

For each table, configure permissions:

**User Role - users table**:
```json
{
  "filter": {
    "id": { "_eq": "X-Hasura-User-Id" }
  },
  "columns": ["id", "email", "name", "credits", "role"]
}
```

See `docs/migration/REALTIME_STRATEGY.md` for complete permission setup.

---

### Step 5: Setup NextAuth

#### 5.1 Install NextAuth

```bash
npm install next-auth @next-auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

#### 5.2 Create Auth Configuration

Copy the NextAuth setup from `docs/migration/AUTH_MIGRATION.md`:

```bash
# Create auth route
mkdir -p app/api/auth/[...nextauth]

# Copy auth configuration
# See AUTH_MIGRATION.md for complete code
```

#### 5.3 Setup OAuth Providers

**Google OAuth**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect: `http://localhost:9002/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`

#### 5.4 Test Authentication

```bash
# Start Next.js dev server
npm run dev

# Navigate to http://localhost:9002/login
# Try logging in with Google OAuth
```

---

### Step 6: Setup Apollo Client (for Hasura)

#### 6.1 Install Apollo

```bash
npm install @apollo/client graphql graphql-ws
```

#### 6.2 Create Apollo Client

Create `lib/apollo-client.ts` - see `docs/migration/REALTIME_STRATEGY.md` for code.

#### 6.3 Add Provider

Update `app/providers.tsx`:
```typescript
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';

export function Providers({ children }) {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
}
```

---

### Step 7: Verify Setup

#### 7.1 Run Health Checks

```bash
# Check PostgreSQL
docker exec arkan-postgres-migration pg_isready -U arkan_user

# Check Hasura
curl http://localhost:8080/healthz

# Check Prisma connection
npx prisma db pull
```

#### 7.2 Test Database Operations

```typescript
// test-db.ts
import { prisma } from '@/lib/prisma';

async function testDatabase() {
  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      credits: 10,
    }
  });

  console.log('Created user:', user);

  // Query user
  const found = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });

  console.log('Found user:', found);

  // Delete test user
  await prisma.user.delete({
    where: { id: user.id }
  });

  console.log('Test passed!');
}

testDatabase();
```

Run test:
```bash
npx tsx test-db.ts
```

#### 7.3 Test Hasura GraphQL

Open Hasura Console GraphiQL:

```graphql
query TestQuery {
  users {
    id
    email
    name
    credits
  }
}
```

---

## Common Issues & Solutions

### Issue 1: PostgreSQL Won't Start

**Error**: `port 5432 already in use`

**Solution**:
```bash
# Check what's using port 5432
lsof -i :5432

# Either stop the conflicting service or change port
# In .env.local:
POSTGRES_PORT=5433

# Restart services
docker-compose -f docs/migration/docker-compose.migration.yml down
docker-compose -f docs/migration/docker-compose.migration.yml up -d
```

### Issue 2: Hasura Can't Connect to Database

**Error**: `could not connect to server`

**Solution**:
```bash
# Wait for PostgreSQL to be healthy
docker-compose -f docs/migration/docker-compose.migration.yml ps

# Check PostgreSQL logs
docker logs arkan-postgres-migration

# Restart Hasura
docker-compose -f docs/migration/docker-compose.migration.yml restart hasura
```

### Issue 3: Prisma Migration Fails

**Error**: `P1001: Can't reach database server`

**Solution**:
```bash
# Verify DATABASE_URL in .env.local
# Should match PostgreSQL credentials

# Test connection
docker exec -it arkan-postgres-migration psql -U arkan_user -d arkan_dev

# Reset database
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Issue 4: NextAuth Session Issues

**Error**: `[next-auth][error][JWT_SESSION_ERROR]`

**Solution**:
```bash
# Regenerate NEXTAUTH_SECRET
openssl rand -base64 32

# Update .env.local
NEXTAUTH_SECRET=new-generated-secret

# Restart Next.js dev server
npm run dev
```

---

## Development Workflow

### Daily Development

```bash
# 1. Start services
docker-compose -f docs/migration/docker-compose.migration.yml up -d

# 2. Start Next.js
npm run dev

# 3. Open Prisma Studio (optional)
npx prisma studio

# 4. Code...

# 5. Stop services when done
docker-compose -f docs/migration/docker-compose.migration.yml stop
```

### Schema Changes

```bash
# 1. Edit prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_new_field

# 3. Prisma Client will auto-regenerate
```

### Database Reset

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually
docker-compose -f docs/migration/docker-compose.migration.yml down -v
docker-compose -f docs/migration/docker-compose.migration.yml up -d
npx prisma migrate dev --name init
```

---

## IDE Setup

### VSCode Extensions

Install recommended extensions:
- **Prisma** - Syntax highlighting for Prisma schema
- **GraphQL** - GraphQL syntax support
- **PostgreSQL** - Database management
- **Docker** - Docker container management

### VSCode Settings

```json
// .vscode/settings.json
{
  "prisma.showPrismaDataPlatformNotification": false,
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

---

## Backup & Restore

### Backup Database

```bash
# Backup PostgreSQL
docker exec arkan-postgres-migration pg_dump -U arkan_user arkan_dev > backup.sql

# Backup with timestamp
docker exec arkan-postgres-migration pg_dump -U arkan_user arkan_dev > backup-$(date +%Y%m%d-%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
docker exec -i arkan-postgres-migration psql -U arkan_user arkan_dev < backup.sql
```

---

## Next Steps

After completing setup:

1. ✅ Verify all services are running
2. ✅ Test database operations with Prisma
3. ✅ Test GraphQL queries in Hasura
4. ✅ Test NextAuth authentication
5. ⏳ Begin Phase 1: Schema Migration (see `MIGRATION_PLAN.md`)

---

## Support & Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Hasura Docs**: https://hasura.io/docs
- **NextAuth Docs**: https://next-auth.js.org
- **PostgreSQL Docs**: https://www.postgresql.org/docs

For migration-specific questions, refer to:
- `ARCHITECTURE.md` - System architecture
- `MIGRATION_PLAN.md` - Phased migration approach
- `DATA_FLOW.md` - Client-server patterns
- `REALTIME_STRATEGY.md` - Hasura integration
