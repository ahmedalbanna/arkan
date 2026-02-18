# Firebase Auth to NextAuth Migration Audit

**Date**: February 17, 2026  
**Status**: Analysis Complete  
**Scope**: Full codebase audit of Firebase Auth (AuthContext.tsx) to NextAuth (NextAuthContext.tsx) migration

---

## Executive Summary

This audit identifies **74 files** across the codebase that currently depend on Firebase Auth's `AuthContext.tsx` and need migration to NextAuth's `NextAuthContext.tsx`. The migration involves:

- **274 total references** to Firebase Auth patterns (`useAuth()`, `firebaseUser`, `getIdToken()`)
- **57 unique files** actively using `useAuth()` hook
- **Multiple dependency layers** requiring coordinated updates
- **Critical infrastructure** changes in token generation and API authentication

---

## Migration Scope by Category

### 1. Context & Provider Layer (2 files)
Files that define authentication context and providers:

| File | Status | Changes Required |
|------|--------|------------------|
| `src/context/AuthContext.tsx` | **Legacy** | ⚠️ Keep for backwards compatibility during transition OR fully migrate all consumers |
| `src/context/NextAuthContext.tsx` | **Current** | ✅ Already implemented; needs full adoption |

**Provider Stack** (`src/components/shared/RootProviders.tsx`):
- Currently nests BOTH providers: `SessionProvider` → `NextAuthProvider` → `AuthProvider`
- Decision needed: Keep dual providers or remove legacy AuthProvider

---

### 2. Core Hooks - Auth Management (4 files)
Hooks that handle authentication logic and mutations:

#### High Priority - Direct Auth Mutations
```
src/hooks/auth/use-auth-mutations.ts (16 patterns)
  - useLogin()
  - useSignup()
  - useLogout()
  - useForgotPassword()
  - useSendPasswordReset() ⚠️ USES firebaseUser.getIdToken()
  - usePhoneSignIn()
```

**Critical Issue**: `useSendPasswordReset()` directly calls `firebaseUser.getIdToken()` - needs NextAuth session token pattern

---

### 3. Data Hooks (9 files) - HIGHEST VOLUME
Hooks that fetch/mutate user data with authentication:

```
src/hooks/data/use-users.ts (5 firebaseUser references)
src/hooks/data/use-payment.ts (direct getIdToken call)
src/hooks/data/use-pptx-templates.ts (4 firebaseUser references)
src/hooks/data/use-docx-templates.ts (4 firebaseUser references)
src/hooks/data/use-features.ts (direct getIdToken call)
src/hooks/data/use-analytics.ts (5 firebaseUser references)
src/hooks/data/use-projects.ts (9 firebaseUser references)
src/hooks/data/use-agent-categories.ts (direct getIdToken call)
src/hooks/data/use-transactions.ts (11 firebaseUser references)
src/hooks/data/use-sections.ts (5 firebaseUser references)
src/hooks/data/use-templates.ts (6 firebaseUser references)
```

**Pattern**: All use `getAuthenticatedToken(firebaseUser)` helper
- Most calls: `const token = await getAuthenticatedToken(firebaseUser)`
- Direct calls: `const token = await firebaseUser.getIdToken()`

---

### 4. Writing Tools Hooks (12 files)
Hooks specific to AI writing tool operations:

```
src/hooks/writing-tools/use-writing-tool.ts (generic, uses firebaseUser)
src/hooks/writing-tools/use-summarizer-logic.ts
src/hooks/writing-tools/use-paraphraser-logic.ts
src/hooks/writing-tools/use-grammar-checker-logic.ts
src/hooks/writing-tools/use-fact-checker-logic.ts
src/hooks/writing-tools/use-plagiarism-checker-logic.ts
src/hooks/writing-tools/use-ai-detector-logic.ts
src/hooks/writing-tools/use-bias-checker-logic.ts
src/hooks/writing-tools/use-generate-toc-logic.ts
src/hooks/writing-tools/use-text-stylist-logic.ts
src/hooks/writing-tools/use-assignments-solver-logic.ts
src/hooks/writing-tools/use-ai-image-generator-logic.ts
```

---

### 5. Admin Hooks (2 files)
Admin-specific authentication and data management:

```
src/hooks/admin/use-admin-dashboard.ts
src/hooks/admin/use-user-management-console.ts
```

---

### 6. RAG & Report Hooks (3 files)
RAG and report generation features:

```
src/hooks/rag/use-rag-indexing.ts
src/hooks/rag/use-rag-retrieval.ts
src/hooks/report-mode/use-ai-actions.ts
```

---

### 7. Core Hooks (2 files)
General purpose hooks:

```
src/hooks/core/use-builder-page.ts
src/hooks/use-agent-store.ts
```

---

### 8. Pages (7 files)
Full pages using authentication:

#### Admin Pages
```
src/app/admin/layout.tsx (CRITICAL - uses firebaseUser.uid for profile link)
src/app/admin/manage-agents/page.tsx
src/app/admin/manage-users/[id]/edit/page.tsx
src/app/admin/settings/page.tsx
```

#### User Pages
```
src/app/profile/page.tsx (uses firebaseUser in notFound check)
src/app/profile/[id]/page.tsx
src/app/profile/ChangePasswordForm.tsx
src/app/profile/ApiTokenView.tsx
src/app/dashboard/page.tsx
src/app/writing-tools/lecture-generator/page.tsx
```

**Critical**: `src/app/admin/layout.tsx` line 173 uses `firebaseUser?.uid` for profile link:
```tsx
<DropdownMenuItem asChild>
  <Link href={`/profile/${firebaseUser?.uid}`}>Profile</Link>
</DropdownMenuItem>
```

---

### 9. Components (14 files)
Shared and feature-specific components:

#### Shared Components
```
src/components/shared/Header.tsx (ALREADY PARTIALLY MIGRATED - uses both useSession & useAuth)
src/components/shared/UserProfileDropdown.tsx (uses useAuth for userProfile)
src/components/shared/MobileNav.tsx
```

#### Admin Components
```
src/components/admin/EditUserForm.tsx
src/components/admin/GenerationLogViewer.tsx
src/components/admin/payments/FinancialReportExporter.tsx
src/components/admin/payments/GiftCreditsDialog.tsx
src/components/admin/users/GiftCreditsDialog.tsx
src/components/admin/users/UserTableRow.tsx
```

#### Feature Components
```
src/components/agent/AgentPlayground.tsx
src/components/api-docs/ApiTester.tsx
src/components/home/HomePageContent.tsx
src/components/pricing/PurchaseCreditsDialog.tsx
src/components/report-mode/file-manager/AnalystAgent.tsx
```

---

### 10. Service Layer (2 files)
Core service utilities:

```
src/services/api/apiService.ts (CRITICAL - Token extraction layer)
  - Accepts firebaseUser parameter
  - Calls getAuthenticatedToken(firebaseUser)
  - Needs to support NextAuth session tokens

src/lib/utils/authUtils.ts (CRITICAL - Token generation)
  - getAuthenticatedToken(): returns firebaseUser.getIdToken()
  - MUST be updated to work with NextAuth sessions
```

---

## Critical Dependencies & Integration Points

### 1. Token Generation Pipeline
**Current Flow** (Firebase):
```
Component → useAuth() → firebaseUser.getIdToken() → API call
```

**Required Flow** (NextAuth):
```
Component → useSession() → session.user.accessToken (or similar) → API call
```

**Blocking Issue**: 
- `src/lib/utils/authUtils.ts::getAuthenticatedToken()` uses `firebaseUser.getIdToken()`
- This is called from 20+ locations
- Need to replace with NextAuth token extraction

### 2. API Service Integration
**File**: `src/services/api/apiService.ts`

Current signature:
```typescript
interface ApiServiceOptions<T> {
  firebaseUser?: FirebaseUser | null;  // ← Remove
  token?: string;  // ← Use this path
}
```

Must support both signatures during transition:
- Legacy: Pass `firebaseUser` object
- New: Pass `token` string from NextAuth session

### 3. Header Component - Partial Migration
**File**: `src/components/shared/Header.tsx`

Already imports and uses BOTH:
```tsx
import { useAuth } from '@/context/AuthContext';  // Legacy
import { useSession } from 'next-auth/react';      // New
```

Uses `useSession()` for navigation filtering (line 44) but also calls `useAuth()` in AuthActions (line 61) for userProfile access.

---

## Detailed Pattern Analysis

### Pattern 1: Simple userProfile Access (Most Common)
**Found in**: Header.tsx, UserProfileDropdown.tsx, and many components
```tsx
const { userProfile } = useAuth();
```

**Migration Path**: 
- Keep using `useAuth()` → `userProfile` (works via NextAuthProvider)
- OR replace with direct session data access
- ✅ Lowest risk - NextAuthProvider already maps userProfile

### Pattern 2: firebaseUser Access for UID
**Found in**: admin/layout.tsx, profile pages, 8+ files
```tsx
const { firebaseUser } = useAuth();
// Used as: firebaseUser?.uid, firebaseUser?.email
```

**Migration Path**:
- Replace with NextAuth session: `session?.user?.id` (for UID)
- ✅ Clean 1:1 mapping
- ⚠️ Verify ID field name matches schema

### Pattern 3: Token Generation for API Calls
**Found in**: 20+ data hooks, use-payment.ts, use-features.ts
```tsx
const { firebaseUser } = useAuth();
const token = await getAuthenticatedToken(firebaseUser);
const data = await apiService({ endpoint, firebaseUser, method: 'POST', data });
```

**Migration Path**:
1. Update `getAuthenticatedToken()` to accept NextAuth session
2. OR update `apiService()` to accept session directly
3. Extract token from: `session.user.accessToken` or similar
4. 🔴 **CRITICAL**: Need to verify NextAuth JWT token strategy

### Pattern 4: Direct getIdToken() Calls
**Found in**: use-payment.ts, use-features.ts, use-auth-mutations.ts, 5 files
```tsx
const token = await firebaseUser.getIdToken();
```

**Migration Path**:
- Replace with session token extraction
- 🔴 **CRITICAL**: NextAuth JWT configuration needed
- May need middleware to inject token into session

---

## Migration Strategy Recommendations

### Phase 1: Identify Token Strategy (Required First)
- [ ] Determine NextAuth JWT token field name
- [ ] Verify JWT secret synchronization with Hasura
- [ ] Test token generation and validation with API layer
- [ ] Decide: Keep dual auth or full cutover?

### Phase 2: Update Infrastructure (Foundation)
1. **Update Token Generation**
   - Modify `src/lib/utils/authUtils.ts::getAuthenticatedToken()`
   - Support both `FirebaseUser` and `NextAuth Session`
   - Add deprecation warning for Firebase path

2. **Update API Service Layer**
   - Modify `src/services/api/apiService.ts`
   - Accept both `firebaseUser` and `token` parameters
   - Default to token extraction for NextAuth

3. **Update RootProviders**
   - Decide: Keep both providers or remove AuthProvider?
   - If keeping: Ensure both are properly synchronized

### Phase 3: Migrate by Category (Safe Execution)
**Recommended Order** (lowest risk first):

1. **Simple Components** (userProfile only)
   - Header.tsx, UserProfileDropdown.tsx
   - Risk: Minimal (already migrated partially)

2. **Data Hooks** (use `getAuthenticatedToken`)
   - 11 files in `src/hooks/data/`
   - Risk: Low (all follow same pattern)

3. **Writing Tools Hooks** (generic patterns)
   - 12 files in `src/hooks/writing-tools/`
   - Risk: Low

4. **Admin Pages & Components** (uid references)
   - 7 pages + 6 components
   - Risk: Medium (need to verify ID field handling)

5. **Complex Auth Hooks** (direct mutations)
   - use-auth-mutations.ts (multiple patterns)
   - Risk: Medium-High (phone auth, password reset)

---

## Files by Risk Level

### 🟢 GREEN - Direct Replacement Safe
```
src/components/shared/Header.tsx
src/components/shared/UserProfileDropdown.tsx
src/hooks/data/use-users.ts
src/hooks/data/use-docx-templates.ts
src/hooks/data/use-pptx-templates.ts
src/hooks/data/use-templates.ts
src/hooks/data/use-sections.ts
src/hooks/data/use-agent-categories.ts
```

### 🟡 YELLOW - Review Before Migration
```
src/app/admin/layout.tsx (firebaseUser.uid usage)
src/app/profile/page.tsx (firebaseUser check)
src/hooks/data/use-payment.ts (direct getIdToken call)
src/hooks/data/use-features.ts (direct getIdToken call)
src/hooks/data/use-analytics.ts (direct getIdToken call)
src/hooks/data/use-transactions.ts (direct getIdToken call)
src/hooks/data/use-projects.ts (complex offline logic)
src/components/admin/payments/FinancialReportExporter.tsx
```

### 🔴 RED - Requires Deep Analysis
```
src/lib/utils/authUtils.ts (core utility - BREAKING CHANGE)
src/services/api/apiService.ts (API service layer - BREAKING CHANGE)
src/hooks/auth/use-auth-mutations.ts (complex mutations, phone auth)
src/components/firebase/FirebaseMessagingProvider.tsx
src/app/admin/layout.tsx (uses firebaseUser for routing)
```

---

## Blocking Issues & Questions

### ❓ Question 1: What is the NextAuth JWT Token Field?
- Current: `firebaseUser.getIdToken()`
- NextAuth: `session.user.??` 
- Need to verify field name and availability in session

### ❓ Question 2: Keep Dual Providers or Full Migration?
- Current: Both `AuthProvider` and `NextAuthProvider` nested
- Options:
  - A) Keep both for safety (maintains backwards compatibility)
  - B) Remove `AuthProvider` completely (cleaner, but riskier)

### ❓ Question 3: How to Handle Phone Auth?
- Current: Firebase phone auth with `signInWithPhoneNumber()`
- NextAuth: No native phone auth provider
- Options:
  - A) Keep Firebase for phone auth only
  - B) Switch to different provider
  - C) Implement custom NextAuth provider

### ❓ Question 4: Admin Access Control
- Current: Check `firebaseUser` availability
- NextAuth: Check `session?.user` availability
- Need to verify ID field name for profile link generation

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total files to review | 74 |
| Files using `useAuth()` | 57 |
| Total `firebaseUser` references | 274 |
| Data hooks affected | 11 |
| Writing tool hooks affected | 12 |
| Pages affected | 10 |
| Components affected | 14 |
| Critical infrastructure files | 2 |
| Files with direct `getIdToken()` calls | 6 |

---

## Next Steps

1. **Answer Blocking Questions** (Section: Blocking Issues)
   - Determine NextAuth token field name
   - Decide on provider strategy
   - Clarify phone auth approach

2. **Create Migration Plan** based on answers
   - Timeline and phases
   - Risk mitigation strategies
   - Rollback procedures

3. **Update Infrastructure First** (Phase 2)
   - authUtils.ts
   - apiService.ts
   - RootProviders.tsx

4. **Execute Category Migrations** (Phase 3)
   - Start with green-risk files
   - Test thoroughly at each stage
   - Create feature branch for each category

5. **Testing & Validation**
   - Unit tests for token generation
   - Integration tests for API calls
   - E2E tests for critical flows (login, profile, admin)

---

## File Reference Guide

### Quick Lookup by Directory
```
Context & Providers:
  - src/context/AuthContext.tsx
  - src/context/NextAuthContext.tsx
  - src/components/shared/RootProviders.tsx

Services & Utilities:
  - src/services/api/apiService.ts
  - src/lib/utils/authUtils.ts

Hooks:
  - src/hooks/auth/* (4 files)
  - src/hooks/data/* (11 files)
  - src/hooks/writing-tools/* (12 files)
  - src/hooks/admin/* (2 files)
  - src/hooks/rag/* (2 files)

Pages:
  - src/app/admin/* (4 files)
  - src/app/profile/* (4 files)
  - src/app/dashboard/page.tsx
  - src/app/writing-tools/lecture-generator/page.tsx

Components:
  - src/components/shared/* (3 files)
  - src/components/admin/* (8 files)
  - src/components/agent/* (1 file)
  - src/components/api-docs/* (1 file)
  - src/components/home/* (1 file)
  - src/components/pricing/* (1 file)
  - src/components/report-mode/* (1 file)
```

---

**Audit Completed**: 2026-02-17  
**Prepared by**: Rovo Dev  
**Status**: Ready for Migration Planning
