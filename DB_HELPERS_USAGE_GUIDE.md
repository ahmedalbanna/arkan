# Firebase DB Helpers Usage Guide

## Overview

The `src/lib/firebase/db-helpers.ts` module provides a centralized, type-safe abstraction layer for all Firestore operations in the Arkan application. This eliminates code duplication, improves maintainability, and ensures consistent error handling across the application.

## Architecture

```
API Routes
    ↓
Services (projectService.ts, userService.ts, etc.)
    ↓
DB Helpers (db-helpers.ts) ← Generic & collection-specific helpers
    ↓
Firebase Admin SDK (adminDb from server-init.ts)
    ↓
Firestore
```

## Key Benefits

✅ **DRY Principle** - Eliminates repeated Firestore query patterns
✅ **Type Safety** - Full TypeScript support with proper return types
✅ **Error Handling** - Consistent, centralized error management
✅ **Maintainability** - Single source of truth for DB operations
✅ **Extensibility** - Easy to add new collections and operations
✅ **Backward Compatible** - Existing services/routes continue to work unchanged

## Generic Helpers

These helpers work with any Firestore collection:

### `getDoc<T>(collection, docId)`
Fetch a single document by ID.

```typescript
import { getDoc } from '@/lib/firebase/db-helpers';

// Get a user
const user = await getDoc<UserProfile>('users', userId);
```

### `listDocs<T>(collection, options?)`
Query multiple documents with optional filtering, ordering, and limiting.

```typescript
import { listDocs, type QueryOptions } from '@/lib/firebase/db-helpers';

// List all projects
const projects = await listDocs<ProjectProperties>('projects');

// List with filtering and ordering
const userProjects = await listDocs<ProjectProperties>('projects', {
  filters: [{ field: 'meta.author', operator: '==', value: userId }],
  orderBy: { field: 'meta.updated', direction: 'desc' },
  limit: 20,
});
```

### `createDoc<T>(collection, data)`
Create a new document with auto-generated ID.

```typescript
import { createDoc } from '@/lib/firebase/db-helpers';

const newProject = await createDoc<ProjectProperties>('projects', {
  title: 'My Project',
  // ... other fields
});
```

### `updateDoc<T>(collection, docId, data)`
Update an existing document (merge strategy - non-destructive).

```typescript
import { updateDoc } from '@/lib/firebase/db-helpers';

const updated = await updateDoc<UserProfile>('users', userId, {
  bio: 'Updated bio',
});
```

### `deleteDoc(collection, docId)`
Delete a document by ID.

```typescript
import { deleteDoc } from '@/lib/firebase/db-helpers';

await deleteDoc('projects', projectId);
```

### `paginateQuery<T>(collection, limit, startAfterId?, options?)`
Implement cursor-based pagination through large collections.

```typescript
import { paginateQuery } from '@/lib/firebase/db-helpers';

const result = await paginateQuery<UserProfile>(
  'users',
  10, // items per page
  lastVisibleId, // for next page
  { orderBy: { field: 'createdAt', direction: 'desc' } }
);

console.log(result.items); // Array of items
console.log(result.hasNextPage); // boolean
console.log(result.lastVisibleId); // for fetching next page
```

### `batchWrite<T>(collection, operations)`
Batch create or update multiple documents atomically.

```typescript
import { batchWrite } from '@/lib/firebase/db-helpers';

await batchWrite('projects', [
  { data: project1 },
  { docId: 'custom-id', data: project2 },
  // ...
]);
```

### `runTransaction<T>(operation)`
Execute atomic multi-document operations with automatic retry.

```typescript
import { runTransaction } from '@/lib/firebase/db-helpers';

const result = await runTransaction(async (transaction) => {
  // All operations succeed or all fail
  const user = await transaction.get(userRef);
  transaction.update(userRef, { credits: newCredits });
  return newCredits;
});
```

## Collection-Specific Helpers

### Users Collection

```typescript
import {
  getUserHelper,
  listUsersHelper,
  createUserDocHelper,
  updateUserHelper,
  deleteUserDocHelper,
  getUserCreditsHelper,
  deductUserCreditsHelper,
  addUserCreditsHelper,
} from '@/lib/firebase/db-helpers';

// Get user profile
const user = await getUserHelper(userId);

// List users with pagination
const { items, hasNextPage, lastVisibleId } = await listUsersHelper(
  limit,
  startAfterId
);

// Create user document (after auth creation)
const newUser = await createUserDocHelper(userId, userProfileData);

// Update user profile
const updated = await updateUserHelper(userId, partialData);

// Delete user document
await deleteUserDocHelper(userId);

// Get credits with daily refresh logic
const { credits, updated } = await getUserCreditsHelper(userId);

// Deduct credits (with daily refresh)
const newBalance = await deductUserCreditsHelper(userId, creditsToDeduct);

// Add credits
await addUserCreditsHelper(userId, creditsToAdd);
```

### Projects Collection

```typescript
import {
  getProjectHelper,
  listProjectsByAuthorHelper,
  saveProjectHelper,
  deleteProjectHelper,
} from '@/lib/firebase/db-helpers';

// Get project by ID
const project = await getProjectHelper(projectId);

// List projects by author
const projects = await listProjectsByAuthorHelper(userId);

// Save project (create or update)
const saved = await saveProjectHelper(projectData);

// Delete project
await deleteProjectHelper(projectId);
```

### Sections Collection

```typescript
import {
  getSectionHelper,
  listSectionsByProjectHelper,
  saveSectionHelper,
  deleteSectionHelper,
} from '@/lib/firebase/db-helpers';

// Get section by ID
const section = await getSectionHelper(sectionId);

// List sections by project
const sections = await listSectionsByProjectHelper(projectId);

// Save section (create or update)
const saved = await saveSectionHelper(sectionData);

// Delete section
await deleteSectionHelper(sectionId);
```

### Templates Collection

```typescript
import {
  getTemplateHelper,
  listTemplatesHelper,
  saveTemplateHelper,
  deleteTemplateHelper,
} from '@/lib/firebase/db-helpers';

// Get template by ID
const template = await getTemplateHelper(templateId);

// List templates (optionally by type)
const templates = await listTemplatesHelper('docx');

// Save template (create or update)
const saved = await saveTemplateHelper(templateData);

// Delete template
await deleteTemplateHelper(templateId);
```

### Transactions Collection

```typescript
import {
  getTransactionHelper,
  listUserTransactionsHelper,
  createTransactionHelper,
} from '@/lib/firebase/db-helpers';

// Get transaction by ID
const transaction = await getTransactionHelper(transactionId);

// List user transactions
const transactions = await listUserTransactionsHelper(userId);

// Create new transaction
const created = await createTransactionHelper(transactionData);
```

### Notifications Collection

```typescript
import {
  getNotificationHelper,
  listUserNotificationsHelper,
  createNotificationHelper,
  markNotificationAsReadHelper,
} from '@/lib/firebase/db-helpers';

// Get notification by ID
const notification = await getNotificationHelper(notificationId);

// List user notifications
const notifications = await listUserNotificationsHelper(userId);

// Create notification
const created = await createNotificationHelper(notificationData);

// Mark as read
await markNotificationAsReadHelper(notificationId);
```

### Agents Collection

```typescript
import {
  getAgentHelper,
  listAgentsHelper,
  saveAgentHelper,
  deleteAgentHelper,
} from '@/lib/firebase/db-helpers';

// Get agent by ID
const agent = await getAgentHelper(agentId);

// List all agents
const agents = await listAgentsHelper();

// Save agent (create or update)
const saved = await saveAgentHelper(agentData);

// Delete agent
await deleteAgentHelper(agentId);
```

## Error Handling

All helpers include automatic error logging. For custom error handling:

```typescript
import { getProjectHelper } from '@/lib/firebase/db-helpers';

try {
  const project = await getProjectHelper(projectId);
  if (!project) {
    // Handle not found
  }
} catch (error) {
  // Error is logged by the helper
  // Additional handling as needed
}
```

## Query Filters

The `QueryFilter` type supports all Firestore operators:

```typescript
interface QueryFilter {
  field: string;
  operator: '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in';
  value: any;
}
```

Example:

```typescript
const filters: QueryFilter[] = [
  { field: 'meta.author', operator: '==', value: userId },
  { field: 'meta.updated', operator: '>', value: cutoffDate },
  { field: 'tags', operator: 'array-contains', value: 'featured' },
];
```

## Ordering & Pagination

```typescript
interface QueryOptions {
  filters?: QueryFilter[];
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
}
```

## Best Practices

### 1. Use Collection-Specific Helpers in Services
Services should call collection-specific helpers, not generic ones:

```typescript
// ✅ Good - in userService.ts
import { getUserHelper, updateUserHelper } from '@/lib/firebase/db-helpers';

export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  return updateUserHelper(userId, data);
}

// ❌ Avoid - calling generic helpers directly from services
import { updateDoc } from '@/lib/firebase/db-helpers';
export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  return updateDoc('users', userId, data);
}
```

### 2. Keep Services as the API Layer
API routes should call services, not db-helpers directly:

```typescript
// ✅ Good - in API route
import { updateUserApi } from '@/services/userService';
export const PUT = withAuth(async ({ request, params }) => {
  const data = await request.json();
  return createApiResponse(await updateUserApi(params.id, data), 200);
});

// ❌ Avoid - calling db-helpers from API routes
import { updateUserHelper } from '@/lib/firebase/db-helpers';
```

### 3. Handle Timestamps Consistently
DB helpers automatically add/update `updatedAt` timestamps:

```typescript
// ✅ DB helper automatically adds updatedAt
await updateUserHelper(userId, { bio: 'New bio' });

// ✅ DB helper automatically adds created/updated timestamps
await createUserDocHelper(userId, userData);
```

### 4. Use Transactions for Multi-Document Operations
For operations requiring atomicity:

```typescript
await runTransaction(async (transaction) => {
  // All operations succeed or all fail
  const user = await transaction.get(userRef);
  transaction.update(userRef, { credits: newBalance });
  transaction.update(logRef, { timestamp: now });
});
```

## Migration Path

Existing code is already refactored. To add new features:

1. **Add new helper** in `db-helpers.ts` if needed
2. **Call helper from service** layer
3. **Call service from API route**

Example - adding a new "projects by status" query:

```typescript
// In db-helpers.ts
export async function listProjectsByStatusHelper(status: string): Promise<ProjectProperties[]> {
  return listDocs<ProjectProperties>('projects', {
    filters: [{ field: 'status', operator: '==', value: status }],
    orderBy: { field: 'createdAt', direction: 'desc' },
  });
}

// In projectService.ts
export async function getProjectsByStatus(status: string): Promise<ProjectProperties[]> {
  return listProjectsByStatusHelper(status);
}

// In API route
export const GET = withAuth(async ({ searchParams }) => {
  const status = searchParams.get('status');
  const projects = await getProjectsByStatus(status);
  return createApiResponse(projects, 200);
});
```

## Performance Considerations

### Indexing
Firestore requires indexes for complex queries. The db-helpers automatically support indexed queries:

```typescript
// This query requires a composite index for (meta.author, meta.updated)
await listDocs<ProjectProperties>('projects', {
  filters: [{ field: 'meta.author', operator: '==', value: userId }],
  orderBy: { field: 'meta.updated', direction: 'desc' },
});
```

Firestore will suggest creating indexes when needed.

### Pagination for Large Results
Use `paginateQuery` for collections with many documents:

```typescript
// ✅ Good - paginated
const page1 = await paginateQuery('users', 20);
const page2 = await paginateQuery('users', 20, page1.lastVisibleId);

// ❌ Avoid - fetching all at once
const allUsers = await listDocs('users'); // Don't do this with large collections
```

## Summary

The db-helpers layer provides:

- **Centralized** Firestore operations
- **Type-safe** queries with full TypeScript support
- **Reusable** patterns for common operations
- **Consistent** error handling and logging
- **Extensible** for new collections and features
- **Tested** patterns following Firebase best practices

By using db-helpers, the codebase maintains clean separation of concerns while reducing code duplication and improving long-term maintainability.
