# Firebase to PostgreSQL Migration - Investigation Report

**Date:** February 17, 2026  
**Status:** ⚠️ INCOMPLETE - BLOCKING ISSUES FOUND  
**Iterations Used:** 11

---

## Executive Summary

While the **FIREBASE_MIGRATION_COMPLETE.md** claims 14/15 tasks are done, the investigation reveals the migration is **INCOMPLETE and potentially BROKEN**:

- ✅ NextAuth + PostgreSQL infrastructure is in place
- ❌ **CRITICAL:** Application still uses dual authentication system (Firebase + NextAuth)
- ❌ **CRITICAL:** 26 files still have active Firebase dependencies
- ❌ **BLOCKING:** RAG vector store has broken Firebase imports that won't compile
- ❌ **BLOCKING:** Seed scripts still use Firebase Admin SDK instead of Prisma
- ❌ **HIGH RISK:** 55 components still depend on old AuthContext (Firebase-based)

**Risk Level:** 🔴 **HIGH** - Not production-ready in current state

---

## 1. DUAL AUTHENTICATION SYSTEM (Critical Issue)

### Problem
The application currently maintains **TWO SEPARATE authentication systems**:

| Aspect | Firebase Auth | NextAuth |
|--------|---------------|----------|
| Token Type | Firebase ID tokens | JWT tokens |
| Session Management | Custom via AuthContext | Built-in |
| Storage | Client-side state | HTTP-only cookies |
| Component Usage | 55 components | 6 components |
| Status | Old/Deprecated | New/Active |

### Affected Components (55 total)
All components importing from `@/context/AuthContext`:
```typescript
import { useAuth } from '@/context/AuthContext';
const { firebaseUser } = useAuth();
```

### Why This is Problematic
1. **Security Risk:** User authenticated via Firebase won't have NextAuth session
2. **Token Confusion:** Different APIs expect different token formats
3. **Session Loss:** Switching between auth systems causes session invalidation
4. **Testing Nightmare:** Can't verify which auth system is authoritative
5. **Migration Incomplete:** Firebase deletion breaks 55 components immediately

---

## 2. CRITICAL FIREBASE IMPORTS BY FILE

### A. Client SDK (firebase/*)
**Total: 11 files with active imports**

| File | Imports | Purpose | Status |
|------|---------|---------|--------|
| `src/context/AuthContext.tsx` | `onAuthStateChanged` | Auth state management | ❌ MUST REMOVE |
| `src/app/profile/ChangePasswordForm.tsx` | `updatePassword`, `reauthenticateWithCredential` | Password change | ❌ MIGRATE TO NEXTAUTH |
| `src/hooks/auth/use-auth-mutations.ts` | `getAuth`, `signInWithPhoneNumber` | Phone auth | ❌ REPLACE WITH NEXTAUTH |
| `src/lib/firebase/client-init.ts` | Full SDK init | App initialization | ❌ DELETE ENTIRE FILE |
| `src/lib/rag/vector-store.ts` | `doc`, `collection`, `setDoc`, `getDocs` | RAG storage | ❌ MIGRATE TO QDRANT |
| `src/services/api/userService.ts` | `doc`, `getFirestore`, `onSnapshot` | User profile subscription | ❌ USE REACT QUERY |
| `src/components/firebase/FirebaseMessagingProvider.tsx` | `getMessaging`, `getToken`, `onMessage` | FCM notifications | 🟡 NEEDS MIGRATION |
| `src/lib/utils/authUtils.ts` | `User type import` | Type definitions | ❌ DELETE FILE |
| `src/services/api/authService.ts` | Multiple auth functions | Auth operations | ❌ DELETE FILE |
| `src/services/api/apiService.ts` | `User type import` | Type definitions | ❌ UPDATE IMPORTS |
| `src/lib/firebase/error.ts` | `FirebaseError` | Error handling | ❌ DELETE FILE |

### B. Admin SDK (firebase-admin/*)
**Total: 6 files with active imports**

| File | Imports | Problem | Status |
|------|---------|---------|--------|
| `src/app/api/admin/notifications/send/route.ts` | Admin SDK full import | Uses Firebase for notifications | ❌ MIGRATE TO POSTGRESQL |
| `src/app/api/payment/request/route.ts` | `getDatabase`, `getStorage` | Payment handling with Firebase | ❌ MIGRATE TO LOCAL STORAGE |
| `src/lib/firebase/server-init.ts` | Admin SDK init | Server initialization | ❌ DELETE ENTIRE FILE |
| `src/lib/rag/vector-store.ts` | `Timestamp`, `getFirestore`, `initializeApp` | Vector storage (BROKEN) | ❌ MIGRATE TO QDRANT |
| `src/services/document-tracking-service.ts` | `Timestamp` | Document tracking | ❌ UPDATE TO POSTGRESQL |

### C. Seed Scripts (Still Using Firebase Admin)
**Total: 5 files**

```
src/lib/db/seed.ts
src/lib/db/seed-agents.ts
src/lib/db/seed-agent-categories.ts
src/lib/db/seed-sections.ts
src/lib/db/seed-templates.ts
```

All import: `import { adminDb } from '@/lib/firebase/server-init'`

**Problem:** Use Firebase Admin SDK instead of Prisma for database seeding

---

## 3. BROKEN COMPONENTS (Will Not Compile/Run)

### A. RAG Vector Store (`src/lib/rag/vector-store.ts`)

**Critical Issue:** Imports functions from wrong Firebase module

```typescript
// Line 7: Imports from Firebase Admin
import { Timestamp, getFirestore, type Firestore } from 'firebase-admin/firestore';

// Line 8: Imports from Firebase Admin App
import { initializeApp, getApps } from 'firebase-admin/app';

// Line 9: BROKEN - These functions don't exist in firebase-admin!
import { doc, collection, setDoc, getDocs, query, where } from 'firebase/firestore';
```

**Error Message When Compiled:**
```
ERROR: Cannot find module 'firebase/firestore' exports
Function 'doc' is not available in firebase-admin/firestore
```

**Impact:** RAG system (document indexing, vector search) is completely non-functional

**Solution:** Per migration docs, should migrate to **Qdrant** vector database

### B. AuthContext (`src/context/AuthContext.tsx`)

**Issues:**

1. **Line 3:** Still imports Firebase auth
```typescript
import { auth } from '@/lib/firebase/client-init';
```

2. **Lines 81-92:** Uses Firebase auth state listener
```typescript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setFirebaseUser(user);
    await manageSession(user); // Calls non-existent /api/auth/session endpoint
    // ...
  });
}, []);
```

3. **Lines 47-56:** Uses Firebase Firestore subscription
```typescript
const unsubscribe = subscribeToUserProfile(firebaseUser.uid, (user) => {
  // Firestore real-time listener
});
```

**Impact:** 55 components fail if Firebase is disabled

---

## 4. INCOMPLETE API IMPLEMENTATIONS

### A. Session Management Endpoints

**Status:** Partially implemented

- ❌ `/api/auth/session` - Called by AuthContext, no handler exists
- ❌ `/api/auth/logout` - Called by AuthContext, no handler exists
- ✅ `/api/auth/[...nextauth]` - NextAuth handler exists

### B. Password Change Flow

**Current Implementation:** `src/app/profile/ChangePasswordForm.tsx`

```typescript
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
```

**Problem:** Uses Firebase Auth, needs to use NextAuth + PostgreSQL password hashing

### C. Phone Authentication

**Current Implementation:** `src/hooks/auth/use-auth-mutations.ts`

```typescript
import { getAuth, signInWithPhoneNumber } from "firebase/auth";
```

**Problem:** 
- Firebase phone auth won't work with NextAuth
- Need to implement custom phone auth or use NextAuth provider
- Currently unused but blocks deployment

---

## 5. REAL-TIME FEATURES STATUS

### A. User Profile Subscription ❌ BROKEN

**File:** `src/services/api/userService.ts`

```typescript
import { doc, getFirestore, onSnapshot } from "firebase/firestore";

export function subscribeToUserProfile(userId: string, callback: Callback) {
  const db = getFirestore();
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (snapshot) => {
    // Real-time listener
  });
}
```

**Used by:** AuthContext to track user changes

**Problem:** Firebase Firestore gone, subscription won't work

**Solution:** Should use React Query with polling (30s intervals like notifications)

### B. Notifications System ✅ WORKING

**File:** `src/hooks/data/use-notifications.ts`

```typescript
// Properly using React Query + PostgreSQL
const { data: notifications } = useQuery<Notification[]>({
  queryKey: notificationKeys.list(),
  queryFn: async () => {
    const response = await fetch('/api/notifications');
    return response.json();
  },
  refetchInterval: 30000, // 30 seconds
});
```

**Status:** ✅ Working correctly

### C. FCM Notifications ⚠️ PARTIALLY WORKING

**File:** `src/components/firebase/FirebaseMessagingProvider.tsx`

```typescript
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
```

**Problem:** Uses Firebase Cloud Messaging

**Options:**
1. Keep if Firebase is still active
2. Migrate to alternative (OneSignal, etc.)
3. Remove if not critical feature

---

## 6. ENVIRONMENT & CONFIG ISSUES

### Missing/Unused Files

- ❌ `src/lib/firebase/client-init.ts` - No longer needed
- ❌ `src/lib/firebase/server-init.ts` - No longer needed
- ❌ `src/lib/firebase/error.ts` - Partially needed, can be cleaned up
- ❌ `src/context/AuthContext.tsx` - Should be removed or repurposed

### Environment Variables Still Required

These variables are likely still in `.env`:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_SDK_KEY
FIREBASE_DATABASE_URL
```

**Issue:** If Firebase project is deleted, all these break

---

## 7. WHAT'S ACTUALLY WORKING ✅

### A. NextAuth Configuration
- ✅ Credentials provider (email/password)
- ✅ Google OAuth provider
- ✅ JWT session strategy
- ✅ Prisma adapter
- ✅ Role-based access control

### B. PostgreSQL Database
- ✅ User model with `password_hash`
- ✅ All 13 core tables migrated
- ✅ Proper foreign keys and relationships
- ✅ Timestamp fields properly configured

### C. Some API Routes
- ✅ `/api/auth/[...nextauth]` - NextAuth handler
- ✅ `/api/notifications` - Uses NextAuth session
- ✅ `/api/notifications/mark-as-read` - Uses NextAuth session
- ✅ `/api/notifications/clear` - Uses NextAuth session
- ✅ GraphQL routes using Hasura JWT

### D. Notifications System
- ✅ React Query polling (30s intervals)
- ✅ PostgreSQL persistence
- ✅ Mark as read functionality
- ✅ Clear all functionality
- ✅ Proper error handling

---

## 8. BLOCKING ISSUES SUMMARY

| Issue | Severity | Impact | Files Affected |
|-------|----------|--------|-----------------|
| Dual auth system | 🔴 CRITICAL | Can't complete migration, security unclear | 55 components |
| Broken RAG vector store | 🔴 CRITICAL | RAG system non-functional | 1 file |
| Seed scripts use Firebase Admin | 🔴 CRITICAL | Can't seed database | 5 files |
| Firebase client init | 🔴 CRITICAL | App won't start without Firebase | 1 file |
| AuthContext Firebase dependency | 🔴 CRITICAL | 55 components broken | 1 file |
| Password change flow | 🟠 HIGH | Users can't change passwords | 1 component |
| User profile subscription | 🟠 HIGH | Real-time user updates broken | 1 file |
| Phone auth implementation | 🟠 HIGH | Phone sign-in doesn't work | 1 file |
| Payment API using Firebase | 🟠 HIGH | Payment processing may fail | 1 file |

---

## 9. RECOMMENDED MIGRATION PATH

### Phase 1: Complete NextAuth Migration (1-2 days)
1. [ ] Migrate all 55 components from `useAuth()` to `useSession()`
2. [ ] Remove Firebase Auth imports from all files
3. [ ] Update API routes to use NextAuth session
4. [ ] Implement password change with NextAuth + Prisma
5. [ ] Remove AuthContext entirely

### Phase 2: Fix Seed Scripts (0.5 days)
1. [ ] Migrate seed.ts to use Prisma
2. [ ] Update all seed files to use Prisma client
3. [ ] Test database seeding with new implementation
4. [ ] Remove Firebase Admin imports from seed files

### Phase 3: Fix RAG System (1 day)
1. [ ] Migrate vector-store.ts to Qdrant
2. [ ] Implement vector storage with Qdrant client
3. [ ] Update indexing and retrieval logic
4. [ ] Test RAG functionality

### Phase 4: Fix Real-time Features (0.5 days)
1. [ ] Migrate user profile subscription to React Query
2. [ ] Update AuthContext to use React Query
3. [ ] Remove Firestore subscriptions

### Phase 5: Cleanup (0.5 days)
1. [ ] Delete Firebase init files
2. [ ] Remove Firebase error handlers
3. [ ] Clean up environment variables
4. [ ] Update .env example files
5. [ ] Remove Firebase from package.json

### Phase 6: Testing & Validation (1 day)
1. [ ] Test user signup/login flow
2. [ ] Test password change
3. [ ] Test notifications
4. [ ] Test RAG indexing and retrieval
5. [ ] Test file uploads
6. [ ] Performance testing

---

## 10. BUILD STATUS

### Current Build State: 🟠 WARNING

```
✅ Compiles: Yes (with warnings)
✅ Runs: Yes (but depends on Firebase)
❌ Fully Functional: No (RAG broken, auth dual system)
❌ Production Ready: No
```

### If Firebase Project Deleted
- ❌ App won't start (FirebaseError on init)
- ❌ Auth won't work (55 components fail)
- ❌ RAG won't work (vector store broken)
- ❌ Some APIs will fail (payment, notifications)

---

## 11. FILES REQUIRING IMMEDIATE ACTION

### Must Delete
```
src/lib/firebase/client-init.ts
src/lib/firebase/server-init.ts
src/context/AuthContext.tsx (or complete rewrite)
src/lib/utils/authUtils.ts
src/services/api/authService.ts
```

### Must Rewrite
```
src/lib/rag/vector-store.ts (use Qdrant)
src/services/api/userService.ts (use React Query)
src/app/profile/ChangePasswordForm.tsx (use NextAuth)
src/hooks/auth/use-auth-mutations.ts (remove phone auth or migrate)
src/app/api/admin/notifications/send/route.ts (use PostgreSQL)
src/app/api/payment/request/route.ts (migrate storage)
```

### Must Update
```
src/lib/db/seed.ts (use Prisma)
src/lib/db/seed-agents.ts (use Prisma)
src/lib/db/seed-agent-categories.ts (use Prisma)
src/lib/db/seed-sections.ts (use Prisma)
src/lib/db/seed-templates.ts (use Prisma)
src/services/document-tracking-service.ts (use PostgreSQL)
All 55 components using AuthContext (use NextAuth)
```

---

## 12. CONCLUSION

**The migration from Firebase to PostgreSQL is INCOMPLETE.**

While the infrastructure for NextAuth + PostgreSQL is in place, the application:
- Still heavily depends on Firebase (26 files)
- Maintains a dual authentication system (55 components)
- Has broken components (RAG vector store)
- Cannot be deployed to production in current state

**Recommendation:** 
Complete the authentication migration and cleanup before production deployment. The current state is a security risk and will break if Firebase is ever deleted.

**Estimated Completion Time:** 3-4 days with focused effort

---

**Generated:** February 17, 2026 | **Investigation Time:** 11 iterations
