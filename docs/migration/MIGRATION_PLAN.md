# Phased Migration Plan - Firebase to PostgreSQL

## Executive Summary

**Objective**: Migrate Arkan from Firebase (Firestore + Auth) to PostgreSQL with NextAuth, Prisma, and Hasura while maintaining zero downtime and data integrity.

**Timeline**: 6-8 weeks  
**Risk Level**: High (financial data migration)  
**Rollback Strategy**: Parallel systems for 2 weeks

---

## Migration Phases Overview

| Phase | Duration | Focus Area | Risk | Dependencies |
|-------|----------|------------|------|--------------|
| **Phase 0** | 1 week | Infrastructure Setup | Low | None |
| **Phase 1** | 1 week | Schema & Database | Medium | Phase 0 |
| **Phase 2** | 2 weeks | Authentication Migration | Medium | Phase 1 |
| **Phase 3** | 2 weeks | Data Migration & Validation | **High** | Phase 2 |
| **Phase 4** | 1 week | Real-time Features | Medium | Phase 3 |
| **Phase 5** | 1 week | Testing & Optimization | Medium | Phase 4 |
| **Phase 6** | 1 week | Cutover & Monitoring | **High** | Phase 5 |

---

## Phase 0: Infrastructure Setup (Week 1)

### Goals
- Setup local PostgreSQL development environment
- Configure Prisma
- Setup Hasura
- Prepare Docker environment

### Tasks

#### 1. Docker Configuration
```yaml
# docker-compose.yml additions
services:
  postgres:
    image: postgres:15-alpine
    container_name: arkan-postgres
    environment:
      POSTGRES_DB: arkan_dev
      POSTGRES_USER: arkan_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U arkan_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  hasura:
    image: hasura/graphql-engine:v2.36.0
    container_name: arkan-hasura
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "8080:8080"
    environment:
      HASURA_GRAPHQL_DATABASE_URL: postgresql://arkan_user:${DB_PASSWORD}@postgres:5432/arkan_dev
      HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
      HASURA_GRAPHQL_DEV_MODE: "true"
      HASURA_GRAPHQL_ADMIN_SECRET: ${HASURA_ADMIN_SECRET}
      HASURA_GRAPHQL_JWT_SECRET: '{"type":"HS256","key":"${NEXTAUTH_SECRET}"}'

volumes:
  postgres_data:
```

#### 2. Prisma Setup
```bash
# Install dependencies
npm install prisma @prisma/client
npm install -D prisma

# Initialize Prisma
npx prisma init

# Copy schema from docs/migration/schema.prisma
# Generate client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init
```

#### 3. Environment Configuration
```env
# .env.local
DATABASE_URL="postgresql://arkan_user:password@localhost:5432/arkan_dev"
DIRECT_URL="postgresql://arkan_user:password@localhost:5432/arkan_dev"

NEXTAUTH_URL="http://localhost:9002"
NEXTAUTH_SECRET="your-32-char-secret-key-here"

HASURA_ADMIN_SECRET="hasura-admin-secret"
HASURA_GRAPHQL_URL="http://localhost:8080/v1/graphql"
HASURA_GRAPHQL_WS_URL="ws://localhost:8080/v1/graphql"

# Keep Firebase credentials for parallel running
NEXT_PUBLIC_FIREBASE_API_KEY="..."
# ... other Firebase config
```

### Deliverables
- ✅ PostgreSQL running in Docker
- ✅ Hasura console accessible at http://localhost:8080
- ✅ Prisma schema migrated
- ✅ Database tables created
- ✅ All services healthy

### Success Criteria
```bash
# Verify PostgreSQL
docker exec -it arkan-postgres psql -U arkan_user -d arkan_dev -c "\dt"

# Verify Hasura
curl http://localhost:8080/healthz

# Verify Prisma
npx prisma studio
```

---

## Phase 1: Schema & Database (Week 2)

### Goals
- Create all PostgreSQL tables
- Setup indexes and constraints
- Implement triggers for audit logging
- Configure Row-Level Security (RLS)

### Tasks

#### 1. Execute Schema Migrations
```bash
# Apply Prisma migrations
npx prisma migrate deploy

# Verify all tables
npx prisma db pull
```

#### 2. Create Database Triggers
```sql
-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Credit ledger automation
CREATE OR REPLACE FUNCTION log_credit_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.credits != OLD.credits THEN
        INSERT INTO credit_ledger (
            user_id, amount, balance_before, balance_after,
            transaction_type, description
        ) VALUES (
            NEW.id,
            NEW.credits - OLD.credits,
            OLD.credits,
            NEW.credits,
            'adjustment',
            'Automatic credit change'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_user_credit_changes AFTER UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION log_credit_change();
```

#### 3. Configure Hasura
```bash
# Access Hasura console
open http://localhost:8080

# Track all tables
# Data > Public > Track All Tables

# Configure relationships (auto-detected from foreign keys)

# Set permissions for 'user' role
# See docs/migration/REALTIME_STRATEGY.md for details
```

### Deliverables
- ✅ All tables created with proper schema
- ✅ Indexes created for performance
- ✅ Triggers configured for automation
- ✅ Hasura tracking all tables
- ✅ Basic permissions configured

### Success Criteria
```sql
-- Verify table count (should be 17)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verify triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Test credit ledger trigger
BEGIN;
UPDATE users SET credits = credits + 10 WHERE id = '...';
SELECT * FROM credit_ledger WHERE user_id = '...';
ROLLBACK;
```

---

## Phase 2: Authentication Migration (Weeks 3-4)

### Goals
- Install and configure NextAuth.js
- Migrate Firebase Auth users to PostgreSQL
- Setup OAuth providers
- Implement password reset flow

### Week 3: NextAuth Setup

#### 1. Install NextAuth
```bash
npm install next-auth @next-auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

#### 2. Configure NextAuth
- Copy configuration from `docs/migration/AUTH_MIGRATION.md`
- Setup Google OAuth provider
- Configure Credentials provider
- Implement JWT callbacks for Hasura

#### 3. Create Auth Pages
```bash
# Create auth pages
mkdir -p app/login app/signup app/auth/error

# Implement login form (see AUTH_MIGRATION.md)
# Implement signup form
# Implement error page
```

### Week 4: User Migration

#### 1. Export Firebase Users
```typescript
// scripts/export-firebase-users.ts
import admin from 'firebase-admin';
import fs from 'fs';

async function exportUsers() {
  const users: any[] = [];
  let pageToken: string | undefined;

  do {
    const result = await admin.auth().listUsers(1000, pageToken);
    users.push(...result.users);
    pageToken = result.pageToken;
  } while (pageToken);

  fs.writeFileSync(
    'firebase-users-export.json',
    JSON.stringify(users, null, 2)
  );

  console.log(`Exported ${users.length} users`);
}

exportUsers();
```

#### 2. Migrate Users to PostgreSQL
```typescript
// scripts/migrate-users.ts
import { prisma } from '@/lib/prisma';
import admin from 'firebase-admin';

async function migrateUsers() {
  const users = await admin.auth().listUsers();
  let migrated = 0;
  let errors = 0;

  for (const fbUser of users.users) {
    try {
      // Get Firestore user data
      const firestoreDoc = await admin.firestore()
        .collection('users')
        .doc(fbUser.uid)
        .get();

      const userData = firestoreDoc.data();

      // Create in PostgreSQL
      await prisma.user.upsert({
        where: { id: fbUser.uid },
        update: {
          emailVerified: fbUser.emailVerified,
          emailVerifiedAt: fbUser.emailVerified ? new Date() : null,
        },
        create: {
          id: fbUser.uid,
          email: fbUser.email!,
          name: fbUser.displayName || userData?.name || 'User',
          emailVerified: fbUser.emailVerified,
          emailVerifiedAt: fbUser.emailVerified ? new Date() : null,
          passwordHash: null, // Will need to reset
          role: userData?.role || 'user',
          credits: userData?.credits || 0,
          bio: userData?.bio,
          profilePictureUrl: fbUser.photoURL || userData?.profilePictureUrl,
          hasCompletedOnboarding: userData?.hasCompletedOnboarding || false,
          apiKeys: userData?.apiKeys || {},
          createdAt: fbUser.metadata.creationTime 
            ? new Date(fbUser.metadata.creationTime) 
            : new Date(),
        }
      });

      // Migrate OAuth accounts
      for (const provider of fbUser.providerData) {
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: provider.providerId.replace('.com', ''),
              providerAccountId: provider.uid,
            }
          },
          update: {},
          create: {
            userId: fbUser.uid,
            type: 'oauth',
            provider: provider.providerId.replace('.com', ''),
            providerAccountId: provider.uid,
          }
        });
      }

      migrated++;
    } catch (error) {
      console.error(`Failed to migrate user ${fbUser.email}:`, error);
      errors++;
    }
  }

  console.log(`Migration complete: ${migrated} users, ${errors} errors`);
}

migrateUsers();
```

#### 3. Validate Migration
```typescript
// scripts/validate-user-migration.ts
async function validateUserMigration() {
  const fbUsers = await admin.auth().listUsers();
  const pgUsers = await prisma.user.findMany();

  console.log(`Firebase users: ${fbUsers.users.length}`);
  console.log(`PostgreSQL users: ${pgUsers.length}`);

  // Check credits match
  for (const fbUser of fbUsers.users) {
    const firestoreData = await admin.firestore()
      .collection('users')
      .doc(fbUser.uid)
      .get();

    const pgUser = await prisma.user.findUnique({
      where: { id: fbUser.uid }
    });

    if (firestoreData.data()?.credits !== pgUser?.credits) {
      console.error(`Credits mismatch for ${fbUser.email}`);
    }
  }
}
```

### Deliverables
- ✅ NextAuth.js configured
- ✅ All Firebase users migrated to PostgreSQL
- ✅ OAuth accounts created
- ✅ Login/signup flows working
- ✅ User migration validated

### Success Criteria
- User count matches (Firebase = PostgreSQL)
- All credits preserved
- OAuth users can login
- New signups work with NextAuth

---

## Phase 3: Data Migration & Validation (Weeks 5-6)

### Goals
- Migrate all Firestore collections to PostgreSQL
- Validate financial data integrity
- Setup parallel running mode
- Create rollback procedures

### Week 5: Non-Critical Data

#### 1. Migrate Projects
```typescript
// scripts/migrate-projects.ts
async function migrateProjects() {
  const projectsSnap = await admin.firestore()
    .collection('projects')
    .get();

  for (const doc of projectsSnap.docs) {
    const data = doc.data();
    
    await prisma.project.create({
      data: {
        id: doc.id,
        userId: data.meta?.author || data.userId,
        title: data.meta?.title || 'Untitled',
        description: data.meta?.description,
        projectType: data.meta?.projectType || 'report',
        status: determineStatus(data),
        content: {
          chapters: data.chapters || [],
          toc: data.toc || {},
        },
        meta: data.meta || {},
        settings: data.settings || {},
        logoUrl: data.logoUrl,
        coverPageData: data.coverPage,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    });
  }
}
```

#### 2. Migrate Configuration
```typescript
// Migrate features, agents, sections, templates
// See MIGRATION_MAPPING.md for details
```

### Week 6: Critical Financial Data

#### 1. Pre-Migration Validation
```typescript
// Calculate total credits in Firestore
const totalFirestoreCredits = await calculateFirestoreCredits();
console.log(`Total Firestore credits: ${totalFirestoreCredits}`);
```

#### 2. Migrate Transactions (CRITICAL)
```typescript
// scripts/migrate-transactions.ts
async function migrateTransactions() {
  const transactionsSnap = await admin.firestore()
    .collection('transactions')
    .orderBy('createdAt')
    .get();

  const report = {
    total: transactionsSnap.size,
    migrated: 0,
    errors: [],
  };

  for (const doc of transactionsSnap.docs) {
    try {
      const data = doc.data();
      
      await prisma.transaction.create({
        data: {
          id: doc.id,
          userId: data.userId,
          planId: data.planId,
          planName: data.planName,
          credits: data.credits,
          price: data.price,
          currency: 'USD',
          userName: data.userName,
          userEmail: data.userEmail,
          status: data.status,
          proofUrl: data.proofUrl,
          adminNotes: data.adminNotes,
          verifiedAt: data.verifiedAt?.toDate(),
          verifiedBy: data.verifiedBy,
          createdAt: data.createdAt.toDate(),
        }
      });

      report.migrated++;
    } catch (error) {
      report.errors.push({ id: doc.id, error: error.message });
    }
  }

  return report;
}
```

#### 3. Post-Migration Validation (CRITICAL)
```typescript
// scripts/validate-financial-data.ts
async function validateFinancialIntegrity() {
  console.log('=== Financial Data Validation ===');

  // 1. Verify user credits
  const fbCredits = await calculateFirestoreUserCredits();
  const pgCredits = await calculatePostgresUserCredits();
  
  if (fbCredits !== pgCredits) {
    throw new Error(`Credit mismatch! FB: ${fbCredits}, PG: ${pgCredits}`);
  }
  console.log(`✅ User credits match: ${pgCredits}`);

  // 2. Verify transactions
  const fbTransCount = await countFirestoreTransactions();
  const pgTransCount = await prisma.transaction.count();
  
  if (fbTransCount !== pgTransCount) {
    throw new Error(`Transaction count mismatch! FB: ${fbTransCount}, PG: ${pgTransCount}`);
  }
  console.log(`✅ Transaction count matches: ${pgTransCount}`);

  // 3. Verify verified transactions credits
  const fbVerifiedCredits = await calculateFirestoreVerifiedCredits();
  const pgVerifiedCredits = await calculatePostgresVerifiedCredits();
  
  if (fbVerifiedCredits !== pgVerifiedCredits) {
    throw new Error(`Verified credits mismatch!`);
  }
  console.log(`✅ Verified credits match: ${pgVerifiedCredits}`);

  // 4. Spot check 100 random users
  const randomUsers = await getRandomUsers(100);
  for (const user of randomUsers) {
    const fbData = await getFirestoreUserCredits(user.id);
    const pgData = await getPostgresUserCredits(user.id);
    
    if (fbData !== pgData) {
      throw new Error(`Credits mismatch for user ${user.email}`);
    }
  }
  console.log(`✅ Spot check passed for 100 users`);

  console.log('=== All validations passed! ===');
}
```

### Deliverables
- ✅ All projects migrated
- ✅ All transactions migrated with validation
- ✅ Configuration data migrated
- ✅ Financial integrity verified
- ✅ Parallel systems running

### Success Criteria
```
✅ User count: Firebase = PostgreSQL
✅ Project count: Firebase = PostgreSQL  
✅ Transaction count: Firebase = PostgreSQL
✅ Total credits: Firebase = PostgreSQL
✅ 100% financial data accuracy
```

---

## Phase 4: Real-time Features (Week 7)

### Goals
- Setup Hasura subscriptions
- Implement live credit updates
- Migrate notification system
- Test WebSocket connections

### Tasks

#### 1. Configure Hasura Permissions
- See `docs/migration/REALTIME_STRATEGY.md`

#### 2. Implement Apollo Client
```bash
npm install @apollo/client graphql graphql-ws
```

#### 3. Create Real-time Components
```typescript
// Replace Firestore onSnapshot with GraphQL subscriptions
// See REALTIME_STRATEGY.md for examples
```

### Deliverables
- ✅ Hasura permissions configured
- ✅ Apollo Client setup
- ✅ Real-time credit updates working
- ✅ Notification subscriptions active

---

## Phase 5: Testing & Optimization (Week 8)

### Goals
- Load testing
- Performance optimization
- Security audit
- User acceptance testing

### Tasks

#### 1. Load Testing
```bash
# Use k6 or Apache JMeter
# Test scenarios:
# - 100 concurrent users
# - 1000 queries/second
# - WebSocket connection stability
```

#### 2. Performance Optimization
```sql
-- Analyze slow queries
EXPLAIN ANALYZE SELECT * FROM projects WHERE user_id = '...';

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_projects_user_updated 
ON projects(user_id, updated_at DESC);
```

#### 3. Security Audit
- Review RLS policies
- Test Hasura permissions
- Audit API routes
- Check SQL injection vulnerabilities

### Deliverables
- ✅ Load test results
- ✅ Performance optimizations applied
- ✅ Security audit passed
- ✅ UAT completed

---

## Phase 6: Cutover & Monitoring (Week 9)

### Goals
- Final cutover to PostgreSQL
- Monitor for issues
- Decommission Firebase (gradual)

### Cutover Plan

#### Day 1-2: Enable PostgreSQL
```typescript
// Feature flag approach
const USE_POSTGRES = process.env.NEXT_PUBLIC_USE_POSTGRES === 'true';

// In API routes
if (USE_POSTGRES) {
  return await prisma.user.findMany();
} else {
  return await firestore.collection('users').get();
}
```

#### Day 3-5: Monitor & Fix
- Watch error rates
- Monitor database performance
- Fix any issues found

#### Day 6-7: Full Cutover
```bash
# Set environment variable
NEXT_PUBLIC_USE_POSTGRES=true

# Deploy
vercel --prod
```

### Post-Cutover Monitoring

#### Week 1-2: Parallel Running
- Keep Firebase running (read-only)
- PostgreSQL is primary
- Compare data daily

#### Week 3-4: Firebase Decommission
- Archive Firebase data
- Cancel Firebase subscription
- Remove Firebase SDK

### Rollback Procedure

If critical issues occur:

```bash
# 1. Revert environment variable
NEXT_PUBLIC_USE_POSTGRES=false

# 2. Deploy previous version
vercel rollback

# 3. Investigate issues in PostgreSQL
# 4. Fix and retry cutover
```

---

## Risk Mitigation

### High-Risk Areas

1. **Financial Data**
   - Triple validation before cutover
   - Daily reconciliation reports
   - Maintain audit trail

2. **Authentication**
   - Parallel auth systems during migration
   - Password reset emails ready
   - Support team prepared

3. **Data Loss**
   - Daily PostgreSQL backups
   - Keep Firebase data for 30 days
   - Export all data before cutover

---

## Success Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Data Accuracy | 100% | |
| Downtime | 0 hours | |
| User Complaints | < 5 | |
| API Response Time | < 200ms | |
| Error Rate | < 0.1% | |

---

## Timeline Summary

```
Week 1: Infrastructure ████████
Week 2: Schema       ████████
Week 3: Auth Setup   ████████
Week 4: User Migration ████████
Week 5: Data Migration ████████
Week 6: Financial Data ████████
Week 7: Real-time    ████████
Week 8: Testing      ████████
Week 9: Cutover      ████████
```

**Total**: 9 weeks (6-8 weeks active development + 1 week buffer)

---

## Next Steps

1. ✅ Review and approve migration plan
2. ⏳ Setup development environment (Phase 0)
3. ⏳ Begin schema migration (Phase 1)
4. ⏳ Configure NextAuth (Phase 2)
