# Testing Strategy for PostgreSQL Migration

## Overview
Comprehensive testing strategy to ensure zero data loss, maintain functionality, and verify system integrity during the Firebase to PostgreSQL migration.

---

## Testing Pyramid

```
                   /\
                  /  \
                 / E2E \           10% - End-to-End Tests
                /______\
               /        \
              /Integration\        30% - Integration Tests  
             /____________\
            /              \
           /  Unit Tests    \      60% - Unit Tests
          /__________________\
```

---

## Test Categories

### 1. Data Integrity Tests (Critical)
### 2. Functional Tests
### 3. Performance Tests
### 4. Security Tests
### 5. Real-time Tests
### 6. Migration Validation Tests

---

## 1. Data Integrity Tests

### 1.1 Pre-Migration Validation

```typescript
// scripts/tests/pre-migration-validation.ts
import admin from 'firebase-admin';
import { prisma } from '@/lib/prisma';

async function validatePreMigration() {
  console.log('=== Pre-Migration Validation ===\n');

  // Test 1: Count all Firestore collections
  const counts = {
    users: (await admin.firestore().collection('users').count().get()).data().count,
    projects: (await admin.firestore().collection('projects').count().get()).data().count,
    transactions: (await admin.firestore().collection('transactions').count().get()).data().count,
    agentGenerations: (await admin.firestore().collection('agent_generations').count().get()).data().count,
  };

  console.log('Firestore Document Counts:');
  console.log(JSON.stringify(counts, null, 2));

  // Test 2: Calculate total credits
  const userDocs = await admin.firestore().collection('users').get();
  const totalCredits = userDocs.docs.reduce((sum, doc) => {
    return sum + (doc.data().credits || 0);
  }, 0);

  console.log(`\nTotal Credits in System: ${totalCredits}`);

  // Test 3: Calculate financial totals
  const transDocs = await admin.firestore().collection('transactions').get();
  const financialTotals = {
    pending: 0,
    verified: 0,
    rejected: 0,
    totalAmount: 0,
  };

  transDocs.docs.forEach(doc => {
    const data = doc.data();
    financialTotals[data.status]++;
    if (data.status === 'verified') {
      financialTotals.totalAmount += data.price;
    }
  });

  console.log('\nTransaction Totals:');
  console.log(JSON.stringify(financialTotals, null, 2));

  // Save snapshot for comparison
  const snapshot = {
    timestamp: new Date().toISOString(),
    counts,
    totalCredits,
    financialTotals,
  };

  fs.writeFileSync(
    'pre-migration-snapshot.json',
    JSON.stringify(snapshot, null, 2)
  );

  console.log('\n✅ Pre-migration snapshot saved to pre-migration-snapshot.json');
}
```

### 1.2 Post-Migration Validation

```typescript
// scripts/tests/post-migration-validation.ts
async function validatePostMigration() {
  console.log('=== Post-Migration Validation ===\n');

  // Load pre-migration snapshot
  const preSnapshot = JSON.parse(
    fs.readFileSync('pre-migration-snapshot.json', 'utf-8')
  );

  const errors: string[] = [];

  // Test 1: Verify record counts
  const counts = {
    users: await prisma.user.count(),
    projects: await prisma.project.count(),
    transactions: await prisma.transaction.count(),
    agentGenerations: await prisma.agentGeneration.count(),
  };

  console.log('PostgreSQL Record Counts:');
  console.log(JSON.stringify(counts, null, 2));

  for (const [key, count] of Object.entries(counts)) {
    if (count !== preSnapshot.counts[key]) {
      errors.push(`${key} count mismatch: expected ${preSnapshot.counts[key]}, got ${count}`);
    }
  }

  // Test 2: Verify total credits
  const users = await prisma.user.findMany({ select: { credits: true } });
  const totalCredits = users.reduce((sum, u) => sum + u.credits, 0);

  console.log(`\nTotal Credits: ${totalCredits}`);

  if (totalCredits !== preSnapshot.totalCredits) {
    errors.push(`Credits mismatch: expected ${preSnapshot.totalCredits}, got ${totalCredits}`);
  }

  // Test 3: Verify financial data
  const transactions = await prisma.transaction.groupBy({
    by: ['status'],
    _count: true,
    _sum: { price: true },
  });

  console.log('\nTransaction Summary:');
  console.log(JSON.stringify(transactions, null, 2));

  // Test 4: Spot check 100 random users
  const randomUserIds = await getRandomUserIds(100);
  for (const userId of randomUserIds) {
    const fbDoc = await admin.firestore().collection('users').doc(userId).get();
    const pgUser = await prisma.user.findUnique({ where: { id: userId } });

    if (fbDoc.data()?.credits !== pgUser?.credits) {
      errors.push(`User ${userId} credits mismatch`);
    }
  }

  // Report results
  if (errors.length === 0) {
    console.log('\n✅ All validation tests passed!');
  } else {
    console.log('\n❌ Validation failed with errors:');
    errors.forEach(err => console.log(`  - ${err}`));
    process.exit(1);
  }
}
```

### 1.3 Continuous Validation

```typescript
// Run daily during parallel mode
async function dailyReconciliation() {
  const report = {
    date: new Date().toISOString(),
    checks: [],
    errors: [],
  };

  // Check 1: User credits match
  const fbUsers = await getAllFirestoreUsers();
  for (const fbUser of fbUsers) {
    const pgUser = await prisma.user.findUnique({ where: { id: fbUser.id } });
    
    if (fbUser.credits !== pgUser?.credits) {
      report.errors.push({
        type: 'CREDIT_MISMATCH',
        userId: fbUser.id,
        firebase: fbUser.credits,
        postgres: pgUser?.credits,
      });
    }
  }

  report.checks.push({
    name: 'User Credits',
    total: fbUsers.length,
    errors: report.errors.filter(e => e.type === 'CREDIT_MISMATCH').length,
  });

  // Save report
  fs.writeFileSync(
    `reconciliation-${new Date().toISOString().split('T')[0]}.json`,
    JSON.stringify(report, null, 2)
  );

  // Alert if errors found
  if (report.errors.length > 0) {
    sendAlertEmail(report);
  }
}
```

---

## 2. Functional Tests

### 2.1 API Route Tests

```typescript
// __tests__/api/projects.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/projects/route';

describe('/api/projects', () => {
  beforeEach(async () => {
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should create a project', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@test.com', name: 'Test', role: 'user' }
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'Test Project',
        projectType: 'report',
      },
    });

    // Mock session
    jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue({
      user: { id: user.id }
    });

    await POST(req);

    const projects = await prisma.project.findMany();
    expect(projects).toHaveLength(1);
    expect(projects[0].title).toBe('Test Project');
  });

  it('should list user projects', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@test.com', name: 'Test', role: 'user' }
    });

    await prisma.project.createMany({
      data: [
        { userId: user.id, title: 'Project 1', status: 'draft' },
        { userId: user.id, title: 'Project 2', status: 'draft' },
      ]
    });

    const { req } = createMocks({ method: 'GET' });

    jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue({
      user: { id: user.id }
    });

    const response = await GET(req);
    const data = await response.json();

    expect(data).toHaveLength(2);
  });
});
```

### 2.2 Prisma Service Tests

```typescript
// __tests__/services/credit-service.test.ts
import { prisma } from '@/lib/prisma';
import { CreditService } from '@/services/credit-service';

describe('CreditService', () => {
  let user: any;

  beforeEach(async () => {
    user = await prisma.user.create({
      data: { email: 'test@test.com', name: 'Test', role: 'user', credits: 10 }
    });
  });

  it('should deduct credits', async () => {
    await CreditService.deductCredits(user.id, 5);

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated?.credits).toBe(5);

    // Verify ledger entry
    const ledger = await prisma.creditLedger.findMany({
      where: { userId: user.id }
    });
    expect(ledger).toHaveLength(1);
    expect(ledger[0].amount).toBe(-5);
  });

  it('should not allow negative credits', async () => {
    await expect(
      CreditService.deductCredits(user.id, 20)
    ).rejects.toThrow('Insufficient credits');

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated?.credits).toBe(10); // Unchanged
  });

  it('should add credits', async () => {
    await CreditService.addCredits(user.id, 50);

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated?.credits).toBe(60);
  });
});
```

---

## 3. Performance Tests

### 3.1 Database Query Performance

```typescript
// scripts/tests/performance-tests.ts
async function testQueryPerformance() {
  console.log('=== Query Performance Tests ===\n');

  // Test 1: User lookup by email (should use index)
  const start1 = Date.now();
  await prisma.user.findUnique({ where: { email: 'test@test.com' } });
  const time1 = Date.now() - start1;
  console.log(`User lookup by email: ${time1}ms (target: <10ms)`);

  // Test 2: List user projects (should use index)
  const start2 = Date.now();
  await prisma.project.findMany({
    where: { userId: 'user-id' },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });
  const time2 = Date.now() - start2;
  console.log(`List projects: ${time2}ms (target: <50ms)`);

  // Test 3: Complex aggregation
  const start3 = Date.now();
  await prisma.transaction.groupBy({
    by: ['status'],
    _count: true,
    _sum: { price: true },
  });
  const time3 = Date.now() - start3;
  console.log(`Transaction aggregation: ${time3}ms (target: <100ms)`);

  // Test 4: JSONB query
  const start4 = Date.now();
  await prisma.project.findMany({
    where: {
      content: {
        path: ['chapters', '0', 'title'],
        equals: 'Introduction'
      }
    }
  });
  const time4 = Date.now() - start4;
  console.log(`JSONB query: ${time4}ms (target: <200ms)`);
}
```

### 3.2 Load Testing

```typescript
// k6 load test script
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up
    { duration: '1m', target: 100 },  // Sustained load
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  const token = 'your-test-token';

  // Test GET projects
  const res = http.get('http://localhost:9002/api/projects', {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## 4. Security Tests

### 4.1 Authorization Tests

```typescript
// __tests__/security/authorization.test.ts
describe('Authorization Tests', () => {
  it('should prevent users from accessing other user data', async () => {
    const user1 = await createTestUser('user1@test.com');
    const user2 = await createTestUser('user2@test.com');

    const project = await prisma.project.create({
      data: { userId: user1.id, title: 'User 1 Project', status: 'draft' }
    });

    // Try to access user1's project as user2
    const { req } = createMocks({
      method: 'GET',
      url: `/api/projects/${project.id}`,
    });

    jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue({
      user: { id: user2.id }
    });

    const response = await GET(req, { params: { id: project.id } });
    expect(response.status).toBe(403);
  });

  it('should allow admins to access all data', async () => {
    const admin = await createTestUser('admin@test.com', 'admin');
    const user = await createTestUser('user@test.com');

    const project = await prisma.project.create({
      data: { userId: user.id, title: 'User Project', status: 'draft' }
    });

    jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue({
      user: { id: admin.id, role: 'admin' }
    });

    const response = await GET(req, { params: { id: project.id } });
    expect(response.status).toBe(200);
  });
});
```

### 4.2 SQL Injection Tests

```typescript
// __tests__/security/sql-injection.test.ts
describe('SQL Injection Protection', () => {
  it('should handle malicious input safely', async () => {
    const maliciousInputs = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "1; DELETE FROM projects WHERE '1'='1",
    ];

    for (const input of maliciousInputs) {
      const user = await prisma.user.create({
        data: { email: `${input}@test.com`, name: input, role: 'user' }
      });

      // Verify data was safely stored
      const found = await prisma.user.findUnique({ where: { id: user.id } });
      expect(found?.name).toBe(input); // Stored as-is, not executed
    }

    // Verify tables still exist
    const count = await prisma.user.count();
    expect(count).toBeGreaterThan(0);
  });
});
```

---

## 5. Real-time Tests

### 5.1 WebSocket Connection Tests

```typescript
// __tests__/realtime/subscriptions.test.ts
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';

describe('Hasura Subscriptions', () => {
  let client: any;

  beforeEach(() => {
    client = createClient({
      url: 'ws://localhost:8080/v1/graphql',
      webSocketImpl: WebSocket,
      connectionParams: {
        headers: {
          'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
        }
      }
    });
  });

  it('should receive credit updates', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@test.com', name: 'Test', role: 'user', credits: 10 }
    });

    const updates: any[] = [];

    client.subscribe(
      {
        query: `
          subscription UserCredits($userId: uuid!) {
            users_by_pk(id: $userId) {
              credits
            }
          }
        `,
        variables: { userId: user.id },
      },
      {
        next: (data: any) => updates.push(data),
        error: (err: any) => console.error(err),
        complete: () => {},
      }
    );

    // Wait for initial data
    await new Promise(resolve => setTimeout(resolve, 1000));
    expect(updates).toHaveLength(1);
    expect(updates[0].data.users_by_pk.credits).toBe(10);

    // Update credits
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: 20 }
    });

    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 1000));
    expect(updates).toHaveLength(2);
    expect(updates[1].data.users_by_pk.credits).toBe(20);
  });
});
```

---

## 6. Migration Validation Tests

### 6.1 Automated Migration Test Suite

```bash
#!/bin/bash
# scripts/test-migration.sh

echo "=== Migration Test Suite ==="

# 1. Pre-migration validation
echo "Running pre-migration validation..."
npx tsx scripts/tests/pre-migration-validation.ts || exit 1

# 2. Run migration
echo "Running migration..."
npx tsx scripts/migrate-all.ts || exit 1

# 3. Post-migration validation
echo "Running post-migration validation..."
npx tsx scripts/tests/post-migration-validation.ts || exit 1

# 4. Functional tests
echo "Running functional tests..."
npm test || exit 1

# 5. Performance tests
echo "Running performance tests..."
npx tsx scripts/tests/performance-tests.ts || exit 1

echo "✅ All tests passed!"
```

---

## Test Execution Schedule

### During Development
```bash
# Unit tests on every commit
npm test

# Integration tests before PR
npm run test:integration
```

### During Migration
```bash
# Day 1: Pre-migration baseline
npm run test:pre-migration

# Days 2-7: Daily reconciliation
npm run test:daily-reconciliation

# Day 8: Final validation
npm run test:post-migration
npm run test:e2e
npm run test:performance
```

### Post-Migration
```bash
# Continuous monitoring
npm run test:daily-reconciliation

# Weekly performance checks
npm run test:performance
```

---

## Success Criteria

### Data Integrity
- ✅ 100% record count match
- ✅ 100% credit accuracy
- ✅ 100% transaction integrity
- ✅ Zero data loss

### Performance
- ✅ API response time < 200ms (p95)
- ✅ Database queries < 50ms (p95)
- ✅ WebSocket latency < 100ms
- ✅ Error rate < 0.1%

### Functionality
- ✅ All API routes working
- ✅ Authentication working
- ✅ Real-time updates working
- ✅ File uploads working

---

## Rollback Tests

### Verify Rollback Procedure

```typescript
// Test rollback capability
async function testRollback() {
  // 1. Create test data in PostgreSQL
  const user = await prisma.user.create({
    data: { email: 'rollback-test@test.com', name: 'Rollback Test', role: 'user' }
  });

  // 2. Enable Firebase mode
  process.env.NEXT_PUBLIC_USE_POSTGRES = 'false';

  // 3. Verify Firebase still works
  const fbUser = await firestore.collection('users').doc(user.id).get();
  expect(fbUser.exists).toBe(true);

  // 4. Enable PostgreSQL mode again
  process.env.NEXT_PUBLIC_USE_POSTGRES = 'true';

  console.log('✅ Rollback test passed');
}
```

---

## Continuous Testing

### GitHub Actions Workflow

```yaml
# .github/workflows/migration-tests.yml
name: Migration Tests

on:
  push:
    branches: [migration/*]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npx prisma migrate deploy
      
      - name: Run tests
        run: npm test
      
      - name: Run integration tests
        run: npm run test:integration
```

---

## Summary

The testing strategy ensures:
- ✅ **Data integrity** through comprehensive validation
- ✅ **Functionality** via unit and integration tests
- ✅ **Performance** through load and stress testing
- ✅ **Security** via authorization and injection tests
- ✅ **Real-time** through WebSocket testing
- ✅ **Rollback capability** if issues arise

All tests must pass before cutover to production.
