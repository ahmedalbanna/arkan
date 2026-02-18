# Firebase Auth Migration Audit Report

## Executive Summary
**Status**: Migration Incomplete - Several critical files still use Firebase Auth methods
**Files with Issues**: 5 critical issues found
**Risk Level**: HIGH

---

## Critical Issues Found

### 1. ❌ src/app/profile/ChangePasswordForm.tsx (CRITICAL)
**Status**: Uses Firebase Auth methods without migration
**Issues**:
- Line 6: Imports Firebase Auth functions (`updatePassword`, `EmailAuthProvider`, `reauthenticateWithCredential`)
- Line 23: Uses `useSession()` (NextAuth) but never extracts firebaseUser
- Line 33: References undefined `firebaseUser` variable
- Line 36-38: Uses Firebase Auth methods directly
- Line 59: References `firebaseUser.providerData` (Firebase-specific)

**Fix Required**: Migrate to NextAuth API for password changes

---

### 2. ❌ src/hooks/auth/use-auth-mutations.ts (CRITICAL)
**Status**: Mixed Firebase and NextAuth - uses getIdToken()
**Issues**:
- Line 40: `handleFirstSignIn()` function uses Firebase `user.getIdToken()`
- Line 43: `const token = await user.getIdToken();` (Firebase call)
- Line 73: `handleFirstSignIn()` still called with Firebase user object
- Line 106: `await userCredential.user.getIdToken();` in signup flow (Firebase)

**Fix Required**: Replace getIdToken() calls with NextAuth session tokens

---

### 3. ❌ src/app/admin/settings/page.tsx (CRITICAL)
**Status**: Uses old getAuthenticatedToken function
**Issues**:
- Line 108: `const token = await getAuthenticatedToken(firebaseUser);`
- References undefined `firebaseUser` variable
- Should use `session` from NextAuth instead

**Fix Required**: Use NextAuth session directly

---

### 4. ⚠️ src/components/admin/users/UserTableRow.tsx (MAJOR)
**Status**: Imports from wrong AuthContext
**Issues**:
- Line 9: `import { useAuth } from "@/context/AuthContext";` (OLD CONTEXT - DOESN'T EXIST)
- Line 26: Uses `firebaseUser` from wrong context
- Line 30-31: References `firebaseUser` but uses undefined `session`
- Should import from `@/context/NextAuthContext` instead

**Fix Required**: Fix import path and use correct context

---

### 5. ⚠️ src/context/NextAuthContext.tsx (CONFUSING API)
**Status**: Works but exports misleading `firebaseUser` interface
**Issues**:
- Line 11: `firebaseUser: { uid: string; email: string | null } | null;`
- Is a compatibility wrapper around NextAuth, not actual Firebase
- Consumers may be confused about whether they're using Firebase or NextAuth

**Note**: This file is actually WORKING correctly - it's a compatibility layer

---

## Migration Status Summary

### Files Correctly Migrated ✅
- Most components using `useAuth()` from `NextAuthContext` work correctly
- `NextAuthContext.tsx` properly maps NextAuth to Firebase-like interface
- Most hooks correctly use `useSession()` from NextAuth

### Files Still Using Firebase ❌
1. **ChangePasswordForm.tsx** - Firebase Auth imports & methods
2. **use-auth-mutations.ts** - getIdToken() calls
3. **admin/settings/page.tsx** - getAuthenticatedToken(firebaseUser)
4. **UserTableRow.tsx** - Wrong context import

---

## Impact Analysis

### High Priority (Breaks Functionality)
- ChangePasswordForm.tsx: Password change feature broken (firebaseUser undefined)
- UserTableRow.tsx: Wrong context import will crash component
- admin/settings/page.tsx: Settings save broken (firebaseUser undefined)

### Medium Priority (Works but Wrong Pattern)
- use-auth-mutations.ts: getIdToken() works with Firebase but blocks full migration

---

## Recommended Fix Order

1. **First**: Fix UserTableRow.tsx (import path) - simplest fix
2. **Second**: Fix admin/settings/page.tsx - use session from useAuth()
3. **Third**: Fix use-auth-mutations.ts - replace getIdToken() with session token
4. **Fourth**: Fix ChangePasswordForm.tsx - most complex, needs API endpoint for password change

---

## Code Pattern Changes Required

### Pattern 1: getIdToken() Replacement
```typescript
// OLD
const token = await firebaseUser.getIdToken();

// NEW
const { data: session } = useSession();
const token = session?.user?.id;
```

### Pattern 2: Firebase Password Change
```typescript
// OLD - Firebase
const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
await reauthenticateWithCredential(firebaseUser, credential);
await updatePassword(firebaseUser, newPassword);

// NEW - Need API endpoint
const response = await fetch('/api/auth/change-password', {
  method: 'POST',
  body: JSON.stringify({ currentPassword, newPassword }),
  headers: { 'Authorization': `Bearer ${session?.user?.id}` }
});
```

---

## Statistics

| Category | Count |
|----------|-------|
| Files with Firebase imports | 1 (ChangePasswordForm.tsx) |
| Files using getIdToken() | 2 (use-auth-mutations.ts) |
| Files with wrong context import | 1 (UserTableRow.tsx) |
| Files with undefined variable refs | 2 |
| Total files requiring fixes | 5 |

---

## Detailed File Analysis

### File 1: src/app/profile/ChangePasswordForm.tsx

**Current State**: Completely broken - mixes NextAuth (useSession) with Firebase Auth methods

**Problems**:
```typescript
// Line 6 - Still importing Firebase
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

// Line 23 - Uses NextAuth but doesn't extract firebaseUser
const { data: session } = useSession();

// Line 33 - References undefined firebaseUser
if (!firebaseUser || !firebaseUser.email) {

// Lines 36-38 - Uses Firebase methods
const credential = EmailAuthProvider.credential(firebaseUser.email, data.currentPassword);
await reauthenticateWithCredential(firebaseUser, credential);
await updatePassword(firebaseUser, data.newPassword);

// Line 59 - Tries to access Firebase-specific property
if (firebaseUser?.providerData.some(p => p.providerId !== 'password')) {
```

**Required Changes**:
1. Remove Firebase imports
2. Extract `firebaseUser` from `useAuth()` context
3. Create API endpoint `/api/auth/change-password` to handle password validation and update
4. Call API instead of Firebase methods directly
5. Handle password provider check differently (store in database)

---

### File 2: src/hooks/auth/use-auth-mutations.ts

**Current State**: Mixed Firebase and NextAuth - uses getIdToken()

**Problems**:
```typescript
// Line 40-60 - handleFirstSignIn uses Firebase getIdToken()
async function handleFirstSignIn(user: FirebaseUser) {
    const token = await user.getIdToken();  // Firebase call
    // ...
}

// Line 106 - useSignup still gets token from Firebase
const token = await userCredential.user.getIdToken();
```

**Required Changes**:
1. Replace getIdToken() with NextAuth session token
2. Update function signatures to accept NextAuth session instead of Firebase user
3. Verify profile creation flow works with NextAuth token

---

### File 3: src/app/admin/settings/page.tsx

**Current State**: Uses old getAuthenticatedToken(firebaseUser)

**Problems**:
```typescript
// Line 108
const token = await getAuthenticatedToken(firebaseUser);
// firebaseUser is undefined - should use session from useAuth()
```

**Required Changes**:
1. Use `const { firebaseUser } = useAuth();` instead of relying on undefined variable
2. Or better: use `const { data: session } = useSession();` directly

---

### File 4: src/components/admin/users/UserTableRow.tsx

**Current State**: Imports from wrong (non-existent) AuthContext

**Problems**:
```typescript
// Line 9 - Wrong import path - @/context/AuthContext doesn't exist
import { useAuth } from "@/context/AuthContext";

// Line 26 - Gets firebaseUser from wrong context
const { firebaseUser, userProfile: _adminProfile } = useAuth();

// Line 30-31 - Then tries to use undefined 'session'
const token = session?.user?.id;
```

**Required Changes**:
1. Change import to: `import { useAuth } from "@/context/NextAuthContext";`
2. Use `firebaseUser` from correct context
3. Remove reference to undefined `session` variable

---

## Testing Checklist

After fixes, verify:

- [ ] Password change form appears and submits correctly
- [ ] User table row renders without errors
- [ ] Admin settings page loads and saves configuration
- [ ] Sign up flow creates user profile correctly
- [ ] Login flow authenticates user correctly
- [ ] Logout clears session properly
- [ ] Password reset email sending works for admins
- [ ] No console errors about undefined variables
- [ ] Session persists across page reloads
- [ ] Profile dropdown shows correct user info
