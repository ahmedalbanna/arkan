# Phase 6: Nested Collections & Template Routes - Implementation Plan

**Status:** 📋 Ready for Next Session  
**Estimated Effort:** 8-10 iterations  
**Current Progress:** 4/30+ routes refactored (High Priority ✅)

---

## 🎯 Objective

Extend db-helpers to support nested Firestore collections, then refactor all DOCX and PPTX template routes to use the new nested collection helpers.

---

## 📊 Current State Analysis

### Nested Collection Usage in Codebase

**Template Routes (7 total):**
```
templates/docx/styles/{key}          ← Collection path
templates/pptx/styles/{key}          ← Collection path
```

**Affected Files:**
1. `src/app/api/templates/docx/route.ts` - GET (list), POST (seed)
2. `src/app/api/templates/docx/[key]/route.ts` - PUT, DELETE
3. `src/app/api/templates/pptx/route.ts` - GET (list), POST (seed)
4. `src/app/api/templates/pptx/[key]/route.ts` - PUT, DELETE
5. `src/app/api/admin/templates/report/route.ts` - GET, POST
6. `src/app/api/admin/templates/report/[id]/route.ts` - PUT, DELETE
7. `src/app/api/admin/templates/presentation/[id]/route.ts` - PUT, DELETE

---

## 🔧 Implementation Plan

### Phase 6A: Extend db-helpers.ts

**Add nested collection helpers:**

```typescript
// New type for nested collection paths
export interface NestedCollectionPath {
  parentCollection: string;
  parentDocId: string;
  subcollection: string;
}

// Get single nested document
export async function getNestedDoc<T extends { id?: string }>(
  path: NestedCollectionPath,
  docId: string
): Promise<(T & { id: string }) | null> {
  const { parentCollection, parentDocId, subcollection } = path;
  try {
    const doc = await adminDb
      .collection(parentCollection)
      .doc(parentDocId)
      .collection(subcollection)
      .doc(docId)
      .get();
    
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T & { id: string };
  } catch (error) {
    console.error(`Error fetching nested document:`, error);
    throw error;
  }
}

// List nested documents
export async function listNestedDocs<T extends { id?: string }>(
  path: NestedCollectionPath,
  options?: QueryOptions
): Promise<(T & { id: string })[]> {
  const { parentCollection, parentDocId, subcollection } = path;
  try {
    let query = adminDb
      .collection(parentCollection)
      .doc(parentDocId)
      .collection(subcollection) as any;

    // Apply filters
    if (options?.filters) {
      for (const filter of options.filters) {
        query = query.where(filter.field, filter.operator, filter.value);
      }
    }

    // Apply ordering
    if (options?.orderBy) {
      query = query.orderBy(options.orderBy.field, options.orderBy.direction);
    }

    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as (T & { id: string })[];
  } catch (error) {
    console.error(`Error listing nested documents:`, error);
    throw error;
  }
}

// Create nested document
export async function createNestedDoc<T extends { id?: string }>(
  path: NestedCollectionPath,
  data: Omit<T, 'id'>
): Promise<T & { id: string }> {
  const { parentCollection, parentDocId, subcollection } = path;
  try {
    const docRef = adminDb
      .collection(parentCollection)
      .doc(parentDocId)
      .collection(subcollection)
      .doc();

    const dataToSave = {
      ...data,
      id: docRef.id,
    };

    await docRef.set(dataToSave);
    return dataToSave as T & { id: string };
  } catch (error) {
    console.error(`Error creating nested document:`, error);
    throw error;
  }
}

// Update nested document
export async function updateNestedDoc<T extends { id?: string }>(
  path: NestedCollectionPath,
  docId: string,
  data: Partial<Omit<T, 'id'>>
): Promise<T & { id: string }> {
  const { parentCollection, parentDocId, subcollection } = path;
  try {
    const ref = adminDb
      .collection(parentCollection)
      .doc(parentDocId)
      .collection(subcollection)
      .doc(docId);

    await ref.update(data);
    const updated = await getNestedDoc<T>(path, docId);
    if (!updated) throw new Error('Failed to retrieve updated document');
    return updated;
  } catch (error) {
    console.error(`Error updating nested document:`, error);
    throw error;
  }
}

// Delete nested document
export async function deleteNestedDoc(
  path: NestedCollectionPath,
  docId: string
): Promise<void> {
  const { parentCollection, parentDocId, subcollection } = path;
  try {
    await adminDb
      .collection(parentCollection)
      .doc(parentDocId)
      .collection(subcollection)
      .doc(docId)
      .delete();
  } catch (error) {
    console.error(`Error deleting nested document:`, error);
    throw error;
  }
}

// Batch write to nested collection
export async function batchWriteNested<T extends { id?: string }>(
  path: NestedCollectionPath,
  operations: Array<{ docId?: string; data: T }>
): Promise<void> {
  const { parentCollection, parentDocId, subcollection } = path;
  try {
    const batch = adminDb.batch();
    for (const op of operations) {
      const docId = op.docId || adminDb.collection(subcollection).doc().id;
      const docRef = adminDb
        .collection(parentCollection)
        .doc(parentDocId)
        .collection(subcollection)
        .doc(docId);
      batch.set(docRef, op.data, { merge: true });
    }
    await batch.commit();
  } catch (error) {
    console.error(`Error batch writing to nested collection:`, error);
    throw error;
  }
}
```

### Phase 6B: Refactor DOCX Template Routes

#### 1. `src/app/api/templates/docx/route.ts` (GET + POST)

**Before:**
```typescript
let stylesCollection = adminDb.collection('templates').doc('docx').collection('styles');
let snapshot = await stylesCollection.get();
// ... seed with batch.set()
```

**After:**
```typescript
import { listNestedDocs, batchWriteNested } from '@/lib/firebase/db-helpers';

const stylesPath = {
  parentCollection: 'templates',
  parentDocId: 'docx',
  subcollection: 'styles',
};

// GET - list all styles
const styles = await listNestedDocs(stylesPath);

// POST - seed if empty
if (styles.length === 0) {
  const operations = (Object.keys(defaultTemplates) as DocxTemplateKey[]).map(key => ({
    docId: key,
    data: {
      ...defaultTemplates[key],
      id: key,
      createdAt: new Date().toISOString(),
    },
  }));
  await batchWriteNested(stylesPath, operations);
}
```

#### 2. `src/app/api/templates/docx/[key]/route.ts` (PUT + DELETE)

**Before:**
```typescript
let templateRef = adminDb.collection('templates').doc('docx').collection('styles').doc(key);
await templateRef.update({ styles: validation.data.styles, ... });
await templateRef.delete();
```

**After:**
```typescript
import { updateNestedDoc, deleteNestedDoc, getNestedDoc } from '@/lib/firebase/db-helpers';

const stylesPath = {
  parentCollection: 'templates',
  parentDocId: 'docx',
  subcollection: 'styles',
};

// PUT
await updateNestedDoc(stylesPath, key, { 
  styles: validation.data.styles, 
  updatedAt: new Date().toISOString() 
});

// DELETE
await deleteNestedDoc(stylesPath, key);

// GET (for validation)
const template = await getNestedDoc(stylesPath, key);
```

### Phase 6C: Refactor PPTX Template Routes

Same pattern as DOCX:
- Change `parentDocId` from 'docx' to 'pptx'
- Use same helper functions
- 3 routes total

### Phase 6D: Refactor Admin Report Template Routes

Similar pattern but for:
- `src/app/api/admin/templates/report/route.ts`
- `src/app/api/admin/templates/report/[id]/route.ts`

### Phase 6E: Refactor Admin Presentation Template Routes

- `src/app/api/admin/templates/presentation/[id]/route.ts`

---

## ✅ Success Criteria

### Code Quality
- ✅ All nested collection operations use db-helpers
- ✅ No direct nested collection queries in API routes
- ✅ Consistent error handling
- ✅ Proper type safety

### Compilation
- ✅ All routes compile without errors
- ✅ No TypeScript issues in refactored routes
- ✅ Type inference works correctly

### Functionality
- ✅ GET endpoints return same data structure
- ✅ POST endpoints seed correctly
- ✅ PUT endpoints update correctly
- ✅ DELETE endpoints remove correctly
- ✅ Validation still works

### Testing
- ✅ Routes can be tested with mocked db-helpers
- ✅ Nested operations work like top-level
- ✅ Error handling consistent with other routes

---

## 📝 Implementation Notes

### Key Differences from Top-Level Helpers

1. **Path Structure:** Instead of just collection name, pass `NestedCollectionPath` object
2. **Same Operations:** All CRUD operations work identically to top-level
3. **Filtering:** Filters work the same way (field, operator, value)
4. **Type Safety:** Generic types work the same way

### Testing Nested Helpers

```typescript
// Example test
const path = {
  parentCollection: 'templates',
  parentDocId: 'docx',
  subcollection: 'styles',
};

const styles = await listNestedDocs(path);
expect(styles).toBeDefined();
expect(Array.isArray(styles)).toBe(true);
```

### Edge Cases to Handle

1. ✅ Parent document doesn't exist - handled by Firestore
2. ✅ Nested collection is empty - return []
3. ✅ Document doesn't exist on update - Firestore error
4. ✅ Document doesn't exist on delete - Firestore error

---

## 🚀 Session Plan for Next Agent

### Step 1: Extend db-helpers (2-3 iterations)
- Add `NestedCollectionPath` type
- Implement 6 nested collection helpers
- Test compilation
- No changes to existing helpers

### Step 2: Refactor DOCX Routes (2 iterations)
- `src/app/api/templates/docx/route.ts`
- `src/app/api/templates/docx/[key]/route.ts`
- Verify compile

### Step 3: Refactor PPTX Routes (2 iterations)
- `src/app/api/templates/pptx/route.ts`
- `src/app/api/templates/pptx/[key]/route.ts`
- Verify compile

### Step 4: Refactor Admin Template Routes (2 iterations)
- Report template routes
- Presentation template routes
- Verify compile

### Step 5: Verify & Document (1-2 iterations)
- Full typecheck
- Create completion summary
- Update progress tracking

**Total Estimated:** 8-10 iterations

---

## 📦 Deliverables

After next session, should have:

1. ✅ Extended db-helpers with nested collection support
2. ✅ 7 template routes refactored (20 adminDb calls eliminated)
3. ✅ All routes compile without errors
4. ✅ Completion documentation
5. ✅ 73/88 adminDb calls eliminated (83% progress)

---

## 🔄 Follow-up After This Session

**Phase 6 Remaining:**
- Lower Priority routes (20+ remaining routes, 50+ calls)
- Estimated: 4-5 additional iterations
- Routes: Agents, Auth, other misc routes

**Phase 7+:**
- Test coverage improvements
- Security audit
- Production readiness

---

## 📋 Reference Files

**Key Files to Modify:**
- `src/lib/firebase/db-helpers.ts` - Add nested collection helpers
- `src/app/api/templates/docx/route.ts` - Refactor GET/POST
- `src/app/api/templates/docx/[key]/route.ts` - Refactor PUT/DELETE
- `src/app/api/templates/pptx/route.ts` - Refactor GET/POST
- `src/app/api/templates/pptx/[key]/route.ts` - Refactor PUT/DELETE
- `src/app/api/admin/templates/report/route.ts` - Refactor
- `src/app/api/admin/templates/report/[id]/route.ts` - Refactor
- `src/app/api/admin/templates/presentation/[id]/route.ts` - Refactor

**Documentation Files:**
- `SESSION_HANDOFF_SUMMARY.md` - High-level session summary
- `PHASE_6_API_ROUTES_AUDIT_PROGRESS.md` - Detailed audit results
- `PHASE_6_HIGH_PRIORITY_COMPLETE.md` - High priority completion
- `PHASE_6_NESTED_COLLECTIONS_PLAN.md` - This file

---

## 🎓 Key Learnings for Next Agent

1. **Nested collections are common pattern** - Keep helpers generic
2. **Type safety is important** - Use generics consistently
3. **Batch operations need special handling** - Use separate batchWriteNested
4. **Error handling is consistent** - Same patterns as top-level
5. **No validation needed in helpers** - Done at route level

---

**Last Updated:** January 26, 2026  
**Created By:** Rovo Dev Agent  
**Session:** Phase 6 Continuation Planning
