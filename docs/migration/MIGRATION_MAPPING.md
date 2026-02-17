# Firebase to PostgreSQL Migration Mapping

## Overview
This document provides a comprehensive mapping of Firebase Firestore collections to PostgreSQL tables, including data type conversions, structural changes, and migration strategies for each entity.

---

## Collection to Table Mapping

| Firebase Collection | PostgreSQL Table | Migration Complexity | Notes |
|---------------------|------------------|---------------------|-------|
| `users` | `users` | **Medium** | Add password_hash, convert apiKeys to JSONB |
| N/A (Firebase Auth) | `accounts` | **High** | New table for NextAuth OAuth |
| N/A (Firebase Auth) | `sessions` | **High** | New table for NextAuth sessions |
| N/A | `verification_tokens` | **Low** | New table for email verification |
| `projects` | `projects` | **Medium** | Restructure to use JSONB for content |
| `transactions` | `transactions` | **High** | Critical financial data, strict validation |
| N/A | `credit_ledger` | **Medium** | New audit trail table |
| `agent_generations` | `agent_generations` | **Low** | Minor field name changes |
| `features` | `features` | **Low** | Direct mapping |
| `agents` | `agents` | **Low** | Add category relation |
| `agent_categories` | `agent_categories` | **Low** | Direct mapping |
| `sections` | `sections` | **Low** | Direct mapping |
| `templates/{type}/styles` | `templates` | **Medium** | Flatten nested structure |
| `settings/defaults` | `settings` | **Medium** | Convert single doc to multiple rows |
| `indexed_documents` | `indexed_documents` | **Low** | Minor field additions |
| `deviceTokens` | `device_tokens` | **Low** | Restructure as relational |
| N/A | `notifications` | **Low** | New table for notification history |

---

## Detailed Migration Mappings

### 1. users Collection → users Table

**Firebase Structure**:
```javascript
{
  id: "firebase-uid",
  email: "user@example.com",
  name: "John Doe",
  role: "user",
  credits: 100,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  bio: "...",
  profilePictureUrl: "...",
  hasCompletedOnboarding: true,
  apiKeys: {
    gemini: "key...",
    chatgpt: "key..."
  }
}
```

**PostgreSQL Structure**:
```sql
{
  id: uuid,
  email: varchar,
  email_verified: boolean,
  email_verified_at: timestamp,
  password_hash: varchar (NEW - for credential auth),
  name: varchar,
  role: enum('admin', 'user'),
  credits: integer,
  created_at: timestamp,
  updated_at: timestamp,
  last_login_at: timestamp (NEW),
  bio: text,
  profile_picture_url: text,
  has_completed_onboarding: boolean,
  api_keys: jsonb,
  deleted_at: timestamp (NEW - soft delete)
}
```

**Migration Steps**:
1. Export all user documents from Firestore
2. Generate UUIDs or use Firebase UID as UUID
3. Convert Firestore Timestamp to PostgreSQL timestamp
4. Migrate apiKeys object to JSONB
5. Set email_verified based on Firebase Auth emailVerified
6. Initialize password_hash as NULL (users will reset on first login)
7. Set deleted_at to NULL for all active users

**Data Transformation**:
```typescript
// Migration script pseudocode
function migrateUser(firestoreUser) {
  return {
    id: firestoreUser.id, // Or generate UUID
    email: firestoreUser.email,
    email_verified: false, // Will be set from Firebase Auth
    email_verified_at: null,
    password_hash: null, // Users need to set password
    name: firestoreUser.name,
    role: firestoreUser.role || 'user',
    credits: firestoreUser.credits || 0,
    bio: firestoreUser.bio || null,
    profile_picture_url: firestoreUser.profilePictureUrl || null,
    has_completed_onboarding: firestoreUser.hasCompletedOnboarding || false,
    api_keys: JSON.stringify(firestoreUser.apiKeys || {}),
    created_at: firestoreUser.createdAt.toDate(),
    updated_at: firestoreUser.updatedAt.toDate(),
    last_login_at: null,
    deleted_at: null
  };
}
```

**Critical Considerations**:
- **Credits**: Verify credit balance integrity before and after migration
- **API Keys**: Ensure encryption if storing sensitive keys
- **Email Verification**: Sync with Firebase Auth records

---

### 2. Firebase Auth → accounts + sessions Tables

**Firebase Auth User**:
```javascript
{
  uid: "firebase-uid",
  email: "user@example.com",
  emailVerified: true,
  providerData: [
    {
      providerId: "google.com",
      uid: "google-uid"
    }
  ]
}
```

**PostgreSQL accounts Table**:
```sql
{
  id: uuid,
  user_id: uuid (FK to users),
  type: 'oauth',
  provider: 'google',
  provider_account_id: 'google-uid',
  access_token: encrypted,
  refresh_token: encrypted,
  ...
}
```

**Migration Steps**:
1. Export Firebase Auth users via Admin SDK
2. For each user, create corresponding accounts records
3. Map provider data to NextAuth account structure
4. No sessions need migration (users will create new sessions on login)

**Data Transformation**:
```typescript
async function migrateFirebaseAuth(firebaseUid) {
  const authUser = await admin.auth().getUser(firebaseUid);
  
  // Update users table with email verification
  await prisma.user.update({
    where: { id: firebaseUid },
    data: {
      emailVerified: authUser.emailVerified,
      emailVerifiedAt: authUser.emailVerified ? new Date() : null
    }
  });
  
  // Create accounts for each provider
  for (const provider of authUser.providerData) {
    await prisma.account.create({
      data: {
        userId: firebaseUid,
        type: 'oauth',
        provider: provider.providerId.replace('.com', ''),
        providerAccountId: provider.uid,
        // Tokens will be refreshed on next login
      }
    });
  }
}
```

**Critical Considerations**:
- **Password Migration**: Firebase uses custom hashing - cannot migrate passwords directly
- **Solution**: Force password reset for credential users on first NextAuth login
- **OAuth Tokens**: Cannot migrate OAuth tokens - users will re-authenticate

---

### 3. projects Collection → projects Table

**Firebase Structure**:
```javascript
{
  id: "project-id",
  meta: {
    title: "My Project",
    description: "...",
    author: "user-id",
    projectType: "report",
    language: "en"
  },
  chapters: [
    {
      id: "ch-1",
      title: "Introduction",
      sections: [...],
      content: "..."
    }
  ],
  toc: {...},
  settings: {...},
  logoUrl: "...",
  coverPage: {...},
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**PostgreSQL Structure**:
```sql
{
  id: uuid,
  user_id: uuid (from meta.author),
  title: varchar (from meta.title),
  description: text (from meta.description),
  project_type: varchar (from meta.projectType),
  status: enum (NEW),
  content: jsonb (chapters, toc, etc.),
  meta: jsonb (other metadata),
  settings: jsonb,
  logo_url: text,
  cover_page_data: jsonb,
  created_at: timestamp,
  updated_at: timestamp,
  last_accessed_at: timestamp,
  deleted_at: timestamp
}
```

**Migration Steps**:
1. Extract structured fields (title, author, type) from nested meta
2. Consolidate chapters, TOC into single content JSONB
3. Determine initial status based on project state
4. Migrate remaining metadata to meta JSONB

**Data Transformation**:
```typescript
function migrateProject(firestoreProject) {
  const { meta, chapters, toc, settings, logoUrl, coverPage, ...rest } = firestoreProject;
  
  return {
    id: firestoreProject.id,
    user_id: meta.author,
    title: meta.title || 'Untitled Project',
    description: meta.description || null,
    project_type: meta.projectType || 'report',
    status: determineStatus(firestoreProject), // Custom logic
    content: {
      chapters: chapters || [],
      toc: toc || {},
      // Any other dynamic content
    },
    meta: {
      language: meta.language || 'en',
      wordCount: meta.wordCount || 0,
      // Other metadata
    },
    settings: settings || {},
    logo_url: logoUrl || null,
    cover_page_data: coverPage || null,
    created_at: firestoreProject.createdAt?.toDate() || new Date(),
    updated_at: firestoreProject.updatedAt?.toDate() || new Date(),
    last_accessed_at: null,
    deleted_at: null
  };
}

function determineStatus(project) {
  // Logic to determine status
  if (project.completed) return 'completed';
  if (project.chapters?.length > 0) return 'in_progress';
  return 'draft';
}
```

**Critical Considerations**:
- **Content Structure**: Preserve exact structure in JSONB for backward compatibility
- **User References**: Ensure all author IDs exist in users table
- **JSONB Indexing**: Create GIN indexes for efficient querying

---

### 4. transactions Collection → transactions Table

**Firebase Structure**:
```javascript
{
  id: "trans-id",
  userId: "user-id",
  planId: "plan-100",
  planName: "100 Credits",
  credits: 100,
  price: 10.00,
  userName: "John Doe",
  userEmail: "john@example.com",
  status: "pending", // or "verified", "rejected"
  proofUrl: "storage://...",
  createdAt: Timestamp,
  adminNotes: "...",
  verifiedAt: Timestamp,
  verifiedBy: "admin-id"
}
```

**PostgreSQL Structure**:
```sql
{
  id: uuid,
  user_id: uuid,
  plan_id: varchar,
  plan_name: varchar,
  credits: integer,
  price: decimal(10,2),
  currency: varchar (NEW - default 'USD'),
  user_name: varchar,
  user_email: varchar,
  status: enum,
  proof_url: text,
  admin_notes: text,
  verified_at: timestamp,
  verified_by: uuid,
  created_at: timestamp,
  updated_at: timestamp
}
```

**Migration Steps**:
1. **CRITICAL**: Verify total credits match before migration
2. Export all transactions with status verification
3. Convert price to DECIMAL for precision
4. Validate all foreign keys (userId, verifiedBy)
5. **CRITICAL**: Verify total credits match after migration

**Data Transformation**:
```typescript
async function migrateTransactions() {
  const transactions = await getAllFirestoreTransactions();
  
  // Pre-migration validation
  const creditCheck = {
    firestore: calculateTotalCredits(transactions),
    postgres: 0
  };
  
  for (const trans of transactions) {
    const migrated = {
      id: trans.id,
      user_id: trans.userId,
      plan_id: trans.planId,
      plan_name: trans.planName,
      credits: trans.credits,
      price: trans.price.toFixed(2), // Ensure 2 decimal places
      currency: 'USD',
      user_name: trans.userName,
      user_email: trans.userEmail,
      status: trans.status,
      proof_url: trans.proofUrl,
      admin_notes: trans.adminNotes || null,
      verified_at: trans.verifiedAt?.toDate() || null,
      verified_by: trans.verifiedBy || null,
      created_at: trans.createdAt.toDate(),
      updated_at: new Date()
    };
    
    await prisma.transaction.create({ data: migrated });
  }
  
  // Post-migration validation
  creditCheck.postgres = await calculatePostgresCredits();
  
  if (creditCheck.firestore !== creditCheck.postgres) {
    throw new Error('Credit totals do not match!');
  }
}
```

**Critical Considerations**:
- **Data Integrity**: This is financial data - any loss is unacceptable
- **Validation**: Run multiple validation checks before and after
- **Atomic Migration**: Use database transactions
- **Rollback Plan**: Keep Firestore data until fully validated

---

### 5. agent_generations Collection → agent_generations Table

**Firebase Structure**:
```javascript
{
  id: "gen-id",
  userId: "user-id",
  agentId: "agent-key",
  agentName: "Grammar Checker",
  flowName: "grammar-checker",
  inputData: {...},
  outputData: {...},
  status: "completed",
  tokensUsed: 1500,
  executionTimeMs: 3200,
  creditsConsumed: 1,
  modelName: "gemini-2.0-flash",
  createdAt: Timestamp,
  completedAt: Timestamp
}
```

**PostgreSQL Structure**: Nearly identical, minor field name changes

**Migration Steps**:
1. Direct mapping for most fields
2. Convert timestamps
3. Ensure JSONB for input/output data

**Data Transformation**:
```typescript
function migrateGeneration(gen) {
  return {
    id: gen.id,
    user_id: gen.userId,
    agent_id: gen.agentId,
    agent_name: gen.agentName || null,
    flow_name: gen.flowName,
    input_data: gen.inputData || null,
    output_data: gen.outputData || null,
    status: gen.status || 'completed',
    error_message: gen.errorMessage || null,
    tokens_used: gen.tokensUsed || null,
    execution_time_ms: gen.executionTimeMs || null,
    credits_consumed: gen.creditsConsumed || 0,
    model_name: gen.modelName || null,
    created_at: gen.createdAt.toDate(),
    completed_at: gen.completedAt?.toDate() || null
  };
}
```

---

### 6. Configuration Collections → Configuration Tables

#### features Collection
**Direct mapping** - minimal changes

#### agents Collection
**Change**: Add categoryId relation
```typescript
function migrateAgent(agent) {
  return {
    ...agent,
    category_id: await getCategoryId(agent.category), // Lookup
    config: agent.config || {}
  };
}
```

#### sections Collection
**Direct mapping** - minimal changes

#### templates Subcollections → Single templates Table

**Firebase Structure** (nested):
```
templates/
  ├── docx/
  │   └── styles/
  │       ├── style1
  │       └── style2
  ├── pptx/
  │   └── styles/
  │       ├── template1
  │       └── template2
```

**PostgreSQL Structure** (flat):
```sql
-- All templates in one table
templates (id, type, key, name, config, ...)
```

**Migration**:
```typescript
async function migrateTemplates() {
  const types = ['docx', 'pptx', 'report_style'];
  
  for (const type of types) {
    const templates = await firestore
      .collection('templates')
      .doc(type)
      .collection('styles')
      .get();
    
    for (const doc of templates.docs) {
      await prisma.template.create({
        data: {
          type: type,
          key: doc.id,
          name: doc.data().name,
          config: doc.data().config || {},
          // ... other fields
        }
      });
    }
  }
}
```

---

### 7. settings/defaults Document → settings Table

**Firebase Structure** (single document):
```javascript
{
  bankAccounts: [...],
  defaultCredits: 10,
  systemEmail: "...",
  // ... other settings
}
```

**PostgreSQL Structure** (multiple rows):
```sql
-- Each setting as a row
{ key: 'bank_accounts', value: [...], category: 'payment' }
{ key: 'default_credits', value: 10, category: 'credits' }
{ key: 'system_email', value: '...', category: 'general' }
```

**Migration**:
```typescript
async function migrateSettings(settingsDoc) {
  const settings = [
    { key: 'bank_accounts', value: settingsDoc.bankAccounts, category: 'payment', isPublic: true },
    { key: 'default_credits', value: settingsDoc.defaultCredits, category: 'credits', isPublic: false },
    // ... decompose into individual settings
  ];
  
  for (const setting of settings) {
    await prisma.setting.create({ data: setting });
  }
}
```

---

### 8. deviceTokens Collection → device_tokens Table

**Firebase Structure** (document per user):
```javascript
// Document ID = userId
{
  tokens: [
    "fcm-token-1",
    "fcm-token-2"
  ]
}
```

**PostgreSQL Structure** (row per token):
```sql
{ id: uuid, user_id: uuid, token: 'fcm-token-1', ... }
{ id: uuid, user_id: uuid, token: 'fcm-token-2', ... }
```

**Migration**:
```typescript
async function migrateDeviceTokens() {
  const tokenDocs = await firestore.collection('deviceTokens').get();
  
  for (const doc of tokenDocs.docs) {
    const userId = doc.id;
    const tokens = doc.data().tokens || [];
    
    for (const token of tokens) {
      await prisma.deviceToken.create({
        data: {
          user_id: userId,
          token: token,
          is_active: true,
          created_at: new Date()
        }
      });
    }
  }
}
```

---

## New Tables (Not in Firebase)

### 1. credit_ledger
**Purpose**: Immutable audit trail for all credit changes

**Population**:
```typescript
// Backfill from verified transactions
async function backfillCreditLedger() {
  const transactions = await prisma.transaction.findMany({
    where: { status: 'verified' },
    orderBy: { verifiedAt: 'asc' }
  });
  
  for (const trans of transactions) {
    // Get user's credit balance at that time
    await prisma.creditLedger.create({
      data: {
        user_id: trans.userId,
        amount: trans.credits,
        balance_before: await getBalanceBeforeTransaction(trans),
        balance_after: await getBalanceAfterTransaction(trans),
        transaction_type: 'purchase',
        reference_id: trans.id,
        reference_type: 'transaction',
        description: `Credit purchase: ${trans.planName}`,
        performed_by: trans.verifiedBy,
        created_at: trans.verifiedAt
      }
    });
  }
}
```

### 2. notifications
**Purpose**: Notification history (currently not persisted in Firebase)

**Population**: Start fresh - no migration needed

---

## Migration Validation Checklist

### Pre-Migration
- [ ] Backup complete Firestore database
- [ ] Export all collections to JSON
- [ ] Document current user count
- [ ] Document total credits in system
- [ ] Document total transaction count
- [ ] Verify Firebase Auth user count matches Firestore users

### Post-Migration
- [ ] User count matches (Firestore = PostgreSQL)
- [ ] Total credits matches exactly
- [ ] All transactions migrated (count matches)
- [ ] All projects migrated
- [ ] Spot-check: 10 random users have correct data
- [ ] Spot-check: All verified transactions have correct credits
- [ ] Foreign key integrity (no orphaned records)
- [ ] Test critical queries (user login, project load, credit check)

### Financial Validation (CRITICAL)
```sql
-- Verify total credits
SELECT SUM(credits) FROM users;
-- Must match Firestore total

-- Verify transaction totals
SELECT 
  status, 
  COUNT(*), 
  SUM(credits), 
  SUM(price) 
FROM transactions 
GROUP BY status;
-- Must match Firestore aggregates

-- Verify credit ledger balance
SELECT 
  user_id, 
  MAX(balance_after) as final_balance 
FROM credit_ledger 
GROUP BY user_id;
-- Must match users.credits
```

---

## Migration Script Template

```typescript
// Complete migration orchestrator
async function runMigration() {
  const report = {
    startTime: new Date(),
    collections: {}
  };
  
  try {
    // 1. Migrate users (foundational)
    console.log('Migrating users...');
    report.collections.users = await migrateUsers();
    
    // 2. Migrate Firebase Auth to accounts
    console.log('Migrating authentication...');
    report.collections.accounts = await migrateAuth();
    
    // 3. Migrate projects
    console.log('Migrating projects...');
    report.collections.projects = await migrateProjects();
    
    // 4. Migrate transactions (CRITICAL)
    console.log('Migrating transactions...');
    report.collections.transactions = await migrateTransactions();
    await validateFinancialIntegrity();
    
    // 5. Backfill credit ledger
    console.log('Creating credit ledger...');
    report.collections.creditLedger = await backfillCreditLedger();
    
    // 6. Migrate generation logs
    console.log('Migrating agent generations...');
    report.collections.generations = await migrateGenerations();
    
    // 7. Migrate configuration
    console.log('Migrating configuration...');
    report.collections.config = await migrateConfiguration();
    
    // 8. Migrate device tokens
    console.log('Migrating device tokens...');
    report.collections.deviceTokens = await migrateDeviceTokens();
    
    // 9. Validate everything
    console.log('Running validation...');
    await runFullValidation();
    
    report.endTime = new Date();
    report.status = 'SUCCESS';
    
  } catch (error) {
    report.status = 'FAILED';
    report.error = error.message;
    
    // Rollback if possible
    await rollbackMigration();
    
    throw error;
  }
  
  return report;
}
```

---

## Rollback Strategy

If migration fails:
1. **DO NOT DELETE FIRESTORE DATA** until validation is 100% complete
2. Drop all PostgreSQL tables
3. Re-run migration after fixing issues
4. Keep both systems running in parallel for 1-2 weeks
5. Only decommission Firestore after confirmed success

---

## Timeline Estimation

| Phase | Estimated Time | Complexity |
|-------|---------------|------------|
| Users migration | 2-4 hours | Medium |
| Auth migration | 4-6 hours | High |
| Projects migration | 3-5 hours | Medium |
| Transactions migration | 6-8 hours | High (critical) |
| Configuration migration | 2-3 hours | Low |
| Validation | 4-6 hours | High |
| **Total** | **21-32 hours** | |

**Recommended**: Allocate 1 week for complete migration with buffer time.
