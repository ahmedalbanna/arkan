# Phase 6: API Routes Audit & Modernization - Progress Report

**Date:** January 26, 2026  
**Status:** ⏳ In Progress (Partial Completion)

## Overview

Phase 6 involves auditing and modernizing all API routes in `src/app/api/**/*.ts` to use db-helpers instead of direct adminDb calls and ensuring consistent async/await patterns.

## Completed Refactorings (This Session)

### ✅ Routes Refactored (3/~30+ routes)

1. **`src/app/api/admin/sections/route.ts`**
   - **GET:** Now uses `listDocs()` instead of `adminDb.collection().orderBy().get()`
   - **POST:** Now uses `saveSectionHelper()` instead of direct doc.set()
   - **Impact:** 10 lines reduced to 6 lines

2. **`src/app/api/agent-categories/route.ts`**
   - **GET:** Now uses `listDocs()` with proper ordering
   - **Impact:** Code simplified and type-safe

3. **`src/app/api/notifications/route.ts`**
   - **GET:** Now uses `listDocs()` with multiple filters
   - **Type Safety:** Added proper Promise<NextResponse> return type
   - **Impact:** Cleaner filter syntax, better error handling

## Remaining Work (Priority Order)

### High Priority (Most Used)

#### 1. Admin Dashboard Stats (`src/app/api/admin/dashboard-stats/route.ts`)
- 7 adminDb calls
- Should use db-helpers for user, project, transaction queries
- Impacts: Admin dashboard performance

#### 2. Admin Logs (`src/app/api/admin/logs/route.ts`)
- Pagination with cursor-based navigation
- Should migrate to `paginateQuery()` which has fixed cursor bug
- Benefits: Correct pagination, cleaner code

#### 3. Feature Management (`src/app/api/features/route.ts`)
- 3 adminDb calls
- Straightforward migration to db-helpers

#### 4. Settings API (`src/app/api/admin/settings/route.ts`)
- 3 adminDb calls
- CRUD operations on settings collection

### Medium Priority (Template Management)

#### 5. DOCX Templates
- `src/app/api/templates/docx/route.ts` - 3 calls
- `src/app/api/templates/docx/[key]/route.ts` - 3 calls
- `src/app/api/admin/templates/report/route.ts` - 4 calls
- `src/app/api/admin/templates/report/[id]/route.ts` - 4 calls

#### 6. PPTX Templates
- `src/app/api/templates/pptx/route.ts` - 3 calls
- `src/app/api/templates/pptx/[key]/route.ts` - 3 calls
- `src/app/api/admin/templates/presentation/[id]/route.ts` - 4 calls

### Lower Priority (Already Have Service Layer)

#### 7. Agents (`src/app/api/agents/route.ts`, `[id]/route.ts`)
- Already using service layer (apiService)
- Minimal direct Firestore calls

#### 8. Users Auth (`src/app/api/auth/signup/route.ts`)
- Already using userService helpers

## Implementation Strategy

### Phase 6A: Critical Routes (High Impact)
```
Priority: Dashboard Stats → Logs → Features → Settings
Effort: ~3-4 routes, ~30 lines of changes
Impact: Admin functionality, pagination fix
Time: ~2-3 iterations
```

### Phase 6B: Template Routes (Medium Priority)
```
Priority: DOCX Templates → PPTX Templates
Effort: ~5-6 routes, ~50 lines of changes
Impact: Template management consistency
Time: ~3-4 iterations
```

### Phase 6C: Remaining Routes (Lower Priority)
```
Priority: Agents → Auth → Other routes
Effort: ~10+ routes, variable changes
Impact: Code consistency
Time: ~4-5 iterations
```

## Current Statistics

| Category | Count | Status |
|----------|-------|--------|
| Total Route Files | ~30+ | |
| Total adminDb Calls | 88 | 3 refactored (~3%) |
| Routes Refactored | 3 | ✅ Complete |
| Routes Pending | 27+ | ⏳ Pending |

## Key Findings from Audit

### Patterns Identified

1. **Query Patterns (Most Common)**
   - Simple list queries → Use `listDocs()`
   - Paginated queries → Use `paginateQuery()`
   - Single doc fetches → Use `getDoc()`

2. **Write Patterns**
   - Create operations → Use collection-specific helpers
   - Update operations → Use `updateDoc()` or helpers
   - Delete operations → Use `deleteDoc()` or helpers

3. **Error Handling**
   - Most routes already use `handleApiError()` wrapper
   - Consistent with db-helpers error patterns

### Type Safety Issues Found

- Some routes lack proper return type annotations
- Parameter validation could be more consistent
- Error types not always specific

## Refactoring Template

All refactorings follow this pattern:

```typescript
// BEFORE
import { adminDb } from '@/lib/firebase/server-init';

export const GET = withAuth(async () => {
  try {
    const snapshot = await adminDb.collection('items')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return createApiResponse(items, 200);
  } catch (error) {
    return handleApiError(error);
  }
});

// AFTER
import { listDocs } from '@/lib/firebase/db-helpers';

export const GET = withAuth(async () => {
  try {
    const items = await listDocs('items', {
      filters: [{ field: 'status', operator: '==', value: 'active' }],
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit: 10,
    });
    return createApiResponse(items, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
```

## Benefits of Completing Phase 6

### Code Quality
- ✅ 50%+ reduction in query building code
- ✅ Consistent patterns across all routes
- ✅ Better type safety
- ✅ Centralized error handling

### Maintenance
- ✅ Changes to db-helpers fix all routes automatically
- ✅ Pagination bug fixes apply everywhere
- ✅ Validation changes propagate consistently

### Performance
- ✅ All routes benefit from db-helpers optimizations
- ✅ Pagination cursor bug fix applies to all routes
- ✅ Proper indexing hints from db-helpers

### Security
- ✅ Validation enforcement on all writes
- ✅ Consistent credential handling
- ✅ Centralized error response formatting (no info leaks)

## Recommended Next Steps

### Immediate (Next Session)
1. Refactor 3-4 high-priority routes (Dashboard Stats, Logs, Features, Settings)
2. Add type safety improvements
3. Verify all routes compile without errors

### Follow-up (Session After)
1. Refactor template management routes (DOCX/PPTX)
2. Add integration tests for refactored routes
3. Document any edge cases

### Final Phase
1. Refactor remaining routes
2. Comprehensive integration testing
3. Performance verification

## Blockers/Notes

### Potential Issues to Watch

1. **Nested Collections:** Some routes may use nested Firestore collections
   - May require new db-helpers or custom handling
   - Example: `templates/docx/styles` nested structure

2. **Dynamic Query Building:** Some admin routes build complex queries
   - May need additional filter operators in db-helpers
   - Current filters: `<`, `<=`, `==`, `!=`, `>=`, `>`, `array-contains`, `in`

3. **Custom Collection Handling:** Verify all collections match db-helpers expectations
   - Most match standard pattern
   - May need custom handlers for special cases

## Conclusion

### Phase 6 Status: ⏳ **PARTIALLY COMPLETE**

**Completed:**
- ✅ 3 critical routes refactored
- ✅ Audit completed (identified all 88 adminDb calls)
- ✅ Refactoring template established
- ✅ Priority ranking determined

**Remaining:**
- ⏳ ~27+ routes need refactoring
- ⏳ Type safety improvements across all routes
- ⏳ Integration testing

**Estimated Work:** 6-10 iterations to complete all routes

### Recommendation

Given the scope (88 adminDb calls across 30+ files), Phase 6 is best completed in multiple sessions:

1. **Session 1 (Today):** 3 critical routes ✅ Done
2. **Session 2:** 3-4 high-priority admin routes (~15 calls)
3. **Session 3:** Template management routes (~20 calls)
4. **Session 4:** Remaining routes + testing (~50+ calls)

This incremental approach allows for:
- Better code review and validation
- Catching edge cases early
- Proper testing after each batch
- Documentation of patterns learned
