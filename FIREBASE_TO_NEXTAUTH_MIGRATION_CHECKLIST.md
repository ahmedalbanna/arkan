# Firebase Auth to NextAuth Migration - Implementation Checklist

**Quick Links**:
- 📊 Full Audit: `FIREBASE_TO_NEXTAUTH_MIGRATION_AUDIT.md`
- 🔍 Code Patterns: `FIREBASE_TO_NEXTAUTH_MIGRATION_PATTERNS.md`
- ✅ This Document: Implementation Checklist & Action Items

---

## Pre-Migration: Answer Critical Questions

Before starting any code changes, answer these blocking questions:

### Question 1: NextAuth Session Token Field Name ❓
**Critical for**: All token extraction throughout the codebase

```typescript
// Check your NextAuth configuration file:
// - pages/api/auth/[...nextauth].ts  OR
// - app/api/auth/[...nextauth]/route.ts

// Look for jwt callback:
callbacks: {
  async jwt({ token, user }) {
    token.accessToken = ???;  // ← What's the field name?
    return token;
  },
  async session({ session, token }) {
    session.user.??? = token.accessToken;  // ← How is it exposed?
    return session;
  },
}
```

**Action Required**: 
- [ ] Find NextAuth config file
- [ ] Identify exact token field name in session
- [ ] Document the field name: `session.user.________`
- [ ] Verify token is being populated correctly

### Question 2: Dual Provider Strategy 🤔
**Impact**: Root component provider stack

**Option A: Keep Both Providers** (Conservative approach)
```tsx
<SessionProvider>
  <NextAuthProvider>
    <AuthProvider>  {/* Keep legacy during migration */}
      {children}
    </AuthProvider>
  </NextAuthProvider>
</SessionProvider>
```
- ✅ Backwards compatible
- ✅ Less risky
- ❌ Double processing
- ❌ More confusing

**Option B: Remove AuthProvider** (Clean approach)
```tsx
<SessionProvider>
  <NextAuthProvider>  {/* NextAuthProvider replaces AuthProvider */}
    {children}
  </NextAuthProvider>
</SessionProvider>
```
- ✅ Cleaner code
- ✅ Single auth source of truth
- ❌ Requires all migrations to be complete
- ❌ Higher risk if not all files are ready

**Action Required**:
- [ ] Decide: Dual (A) or Single (B) provider
- [ ] Document decision
- [ ] Plan removal timeline if choosing A

### Question 3: Phone Auth Migration Path 📱
**Impact**: Authentication flows, user sign-up

**Option A: Keep Firebase for Phone** (Hybrid)
```tsx
// Keep Firebase phone auth, create NextAuth session on success
const { user } = await verifyPhoneOtp(otp);  // Firebase
const session = await signIn('credentials', {    // NextAuth
  email: user.email,
  password: generatedToken,
});
```
- ✅ Minimal changes to phone flow
- ✅ No new SMS provider setup
- ❌ Keeps Firebase dependency partially

**Option B: Remove Phone Auth** (Delete feature)
```tsx
// Stop offering phone auth
// Direct users to email/social login only
```
- ✅ Simplifies migration
- ❌ Removes user feature
- ❌ May upset existing users

**Option C: Implement Custom Provider** (Complex)
```tsx
// Create custom NextAuth provider for phone
// Requires backend SMS service integration
```
- ✅ Full NextAuth integration
- ❌ Complex implementation
- ❌ Requires SMS service setup

**Action Required**:
- [ ] Decide: Keep Firebase (A), Remove (B), or Custom (C)
- [ ] Document decision
- [ ] If choosing C: Plan SMS service setup

### Question 4: ID Field Name Verification 🆔
**Impact**: Profile routing, user identification

**Current pattern**:
```tsx
<Link href={`/profile/${firebaseUser?.uid}`}>  // Uses: uid
```

**NextAuth equivalent**:
```tsx
<Link href={`/profile/${session?.user?.id}`}>  // Uses: id (or uid?)
```

**Action Required**:
- [ ] Check NextAuth session.user schema
- [ ] Verify field name (id vs uid vs something else)
- [ ] Test profile route still works
- [ ] Document the field name: `session.user.________`

---

## Pre-Flight Checklist (Before Any Code Changes)

- [ ] All 4 critical questions answered above
- [ ] NextAuth configuration reviewed and documented
- [ ] Token field name identified and tested
- [ ] Provider strategy decided
- [ ] Phone auth decision made
- [ ] Backup created (git commit on main branch)
- [ ] Feature branch created for migration work
- [ ] Team informed of migration plan

---

## Phase 1: Infrastructure Updates (DO FIRST)

### 1.1 Update getAuthenticatedToken Helper
**File**: `src/lib/utils/authUtils.ts`

**Current**:
```typescript
export const getAuthenticatedToken = async (firebaseUser: FirebaseUser | null): Promise<string> => {
  if (!firebaseUser) {
    throw new Error("User not authenticated");
  }
  return await firebaseUser.getIdToken();
};
```

**Update to**:
```typescript
// Keep Firebase support for backwards compatibility initially
export const getAuthenticatedToken = async (
  firebaseUserOrSession: FirebaseUser | any | null
): Promise<string> => {
  if (!firebaseUserOrSession) {
    throw new Error("User not authenticated");
  }
  
  // Support Firebase (has getIdToken method)
  if ('getIdToken' in firebaseUserOrSession) {
    return await firebaseUserOrSession.getIdToken();
  }
  
  // Support NextAuth Session with accessToken
  if (firebaseUserOrSession?.user?.accessToken) {
    return firebaseUserOrSession.user.accessToken;
  }
  
  // Support direct accessToken string
  if (typeof firebaseUserOrSession === 'string') {
    return firebaseUserOrSession;
  }
  
  throw new Error("No valid authentication token found");
};

// Add new NextAuth-specific helper
export const getNextAuthToken = async (session: any | null): Promise<string> => {
  if (!session?.user?.accessToken) {
    throw new Error("User not authenticated");
  }
  return session.user.accessToken;
};
```

**Checklist**:
- [ ] Updated function signature
- [ ] Added Firebase backwards compatibility
- [ ] Added NextAuth path
- [ ] Added error handling for missing token
- [ ] Tested with both Firebase and NextAuth
- [ ] Commit with message: "feat: update getAuthenticatedToken for NextAuth support"

### 1.2 Update API Service Layer
**File**: `src/services/api/apiService.ts`

**Current signature**:
```typescript
interface ApiServiceOptions<T> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: T;
  token?: string;
  firebaseUser?: FirebaseUser | null;  // ← Firebase specific
  headers?: Record<string, string>;
  isFormData?: boolean;
}
```

**Update to support NextAuth**:
```typescript
interface ApiServiceOptions<T> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: T;
  token?: string;
  firebaseUser?: FirebaseUser | null;  // ← Keep for backwards compat
  session?: any | null;  // ← Add NextAuth support
  headers?: Record<string, string>;
  isFormData?: boolean;
}

export async function apiService<TRequest = any, TResponse = any>(
  options: ApiServiceOptions<TRequest>
): Promise<TResponse> {
  const {
    endpoint,
    method = 'GET',
    data,
    token: directToken,
    firebaseUser,
    session,
    headers = {},
    isFormData = false,
  } = options;

  let authToken = directToken;

  // Try NextAuth session first
  if (!authToken && session?.user?.accessToken) {
    authToken = session.user.accessToken;
  }

  // Fall back to Firebase
  if (!authToken && firebaseUser) {
    authToken = await getAuthenticatedToken(firebaseUser);
  }

  const config: RequestInit = {
    method,
    headers: { ...headers },
  };

  if (authToken) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${authToken}`,
    };
  }

  // Rest of function remains the same...
  if (data) {
    if (isFormData) {
      config.body = data as unknown as FormData;
    } else {
      (config.headers as Record<string, string>)['Content-Type'] = 'application/json';
      config.body = JSON.stringify(data);
    }
  }

  const response = await fetch(endpoint, config);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText || 'An unknown error occurred.' };
    }
    throw new Error(errorData.message);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return {} as TResponse;
}
```

**Checklist**:
- [ ] Added session parameter support
- [ ] Updated token extraction logic
- [ ] Prioritized NextAuth over Firebase (switch order in production)
- [ ] Maintained backwards compatibility
- [ ] Tested with both auth methods
- [ ] Commit with message: "feat: add NextAuth support to apiService"

### 1.3 Decision: Provider Stack Update (Phase 1 or Phase 3?)
**File**: `src/components/shared/RootProviders.tsx`

**Option A: Keep for now** (do in Phase 3)
```tsx
// No changes in Phase 1
// Keep both providers during migration
```

**Option B: Update now** (do in Phase 1)
```tsx
// Remove AuthProvider, keep NextAuthProvider only
export function RootProviders({ children, fontClassName }: RootProvidersProps) {
  return (
    <ThemeProvider ...>
      <QueryProvider>
        <SessionProvider>
          <LocalizationProvider>
            <NextAuthProvider>  {/* ← Only NextAuthProvider now */}
              <FirebaseMessagingProvider>
                <LanguageDirectionManager>
                  <div className={fontClassName}>
                    {children}
                    <Toaster />
                  </div>
                </LanguageDirectionManager>
              </FirebaseMessagingProvider>
            </NextAuthProvider>
          </LocalizationProvider>
        </SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
```

**Recommendation**: Option A (keep for now, remove in Phase 3 after all migrations)

**Checklist**:
- [ ] Decision documented: Keep both / Remove legacy provider
- [ ] No changes made to RootProviders.tsx yet (save for Phase 3)

---

## Phase 2: Green/Yellow Risk Files (Safe Migrations)

### 2.1 Simple Component Refactoring (🟢 GREEN)
**No code changes needed** - Already works with NextAuth!

These components only use `useAuth() → userProfile` which NextAuthProvider supplies:

```
✅ src/components/shared/Header.tsx
✅ src/components/shared/UserProfileDropdown.tsx
✅ src/components/shared/MobileNav.tsx
```

**Checklist**:
- [ ] Verify components still render correctly
- [ ] Run tests for these components
- [ ] No code changes required - document as "already compatible"

### 2.2 Data Hooks Batch 1 (🟢 GREEN)
**Files** (use only `userProfile`, no token):
```
src/hooks/data/use-users.ts
src/hooks/data/use-docx-templates.ts
src/hooks/data/use-pptx-templates.ts
src/hooks/data/use-templates.ts
src/hooks/data/use-sections.ts
```

**Pattern**: Replace `getAuthenticatedToken(firebaseUser)` with `getAuthenticatedToken(session)`

**Example conversion**:
```typescript
// BEFORE
const { firebaseUser } = useAuth();
const token = await getAuthenticatedToken(firebaseUser);

// AFTER
const { data: session } = useSession();
const token = await getAuthenticatedToken(session);
```

**File-by-file**:

#### File: src/hooks/data/use-users.ts
- [ ] Change `import { useAuth }` to `import { useSession }`
- [ ] Replace `const { firebaseUser } = useAuth()` with `const { data: session } = useSession()`
- [ ] Update queryKey: `userKeys.profile(firebaseUser?.uid)` → `userKeys.profile(session?.user?.id)`
- [ ] Update queryFn token extraction: `getAuthenticatedToken(firebaseUser)` → `getAuthenticatedToken(session)`
- [ ] Update enabled condition: `!!firebaseUser` → `!!session?.user?.accessToken`
- [ ] Test the hook works correctly
- [ ] Commit: "refactor: migrate use-users hook to NextAuth"

#### File: src/hooks/data/use-docx-templates.ts
- [ ] Same steps as use-users.ts
- [ ] Commit: "refactor: migrate use-docx-templates hook to NextAuth"

#### File: src/hooks/data/use-pptx-templates.ts
- [ ] Same steps as use-users.ts
- [ ] Commit: "refactor: migrate use-pptx-templates hook to NextAuth"

#### File: src/hooks/data/use-templates.ts
- [ ] Same steps as use-users.ts
- [ ] Commit: "refactor: migrate use-templates hook to NextAuth"

#### File: src/hooks/data/use-sections.ts
- [ ] Same steps as use-users.ts
- [ ] Commit: "refactor: migrate use-sections hook to NextAuth"

### 2.3 Data Hooks Batch 2 (🟡 YELLOW - Direct getIdToken calls)
**Files** (replace direct `getIdToken()` calls):
```
src/hooks/data/use-payment.ts
src/hooks/data/use-features.ts
src/hooks/data/use-analytics.ts
src/hooks/data/use-transactions.ts
src/hooks/data/use-agent-categories.ts
```

**Pattern**: Replace `firebaseUser.getIdToken()` with `session.user.accessToken`

**Example**:
```typescript
// BEFORE
const { firebaseUser } = useAuth();
const token = await firebaseUser.getIdToken();

// AFTER
const { data: session } = useSession();
const token = session?.user?.accessToken;
if (!token) throw new Error("Not authenticated");
```

**File-by-file**: Same process as Batch 1, but:
- [ ] Search for `firebaseUser.getIdToken()` pattern
- [ ] Replace with: `session.user.accessToken` (with null check)
- [ ] Test thoroughly - these handle payments/sensitive operations
- [ ] Commit: "refactor: migrate [hook-name] to NextAuth"

---

## Phase 3: Yellow/Red Risk Files (Requires Review)

### 3.1 Admin Pages (🟡 YELLOW)
**Files**:
```
src/app/admin/layout.tsx
src/app/admin/manage-agents/page.tsx
src/app/admin/manage-users/[id]/edit/page.tsx
src/app/admin/settings/page.tsx
```

**Critical Issue**: Uses `firebaseUser?.uid` for routing

**File: src/app/admin/layout.tsx** (Line 173)
```typescript
// BEFORE
<Link href={`/profile/${firebaseUser?.uid}`}>Profile</Link>

// AFTER
<Link href={`/profile/${session?.user?.id}`}>Profile</Link>
```

**Full migration**:
- [ ] Add import: `import { useSession } from 'next-auth/react'`
- [ ] Remove/comment out: `import { useAuth } from '@/context/AuthContext'`
- [ ] Replace: `const { userProfile, isLoading: isAuthLoading, firebaseUser } = useAuth()`
- [ ] With:
  ```typescript
  const { data: session, status } = useSession();
  const userProfile = session?.user?.profile;  // May need adjustment
  const isAuthLoading = status === 'loading';
  ```
- [ ] Update profile link: `firebaseUser?.uid` → `session?.user?.id`
- [ ] Test admin layout still works
- [ ] Commit: "refactor: migrate admin layout to NextAuth"

### 3.2 Profile Pages (🟡 YELLOW)
**Files**:
```
src/app/profile/page.tsx (Line 40, 50)
src/app/profile/[id]/page.tsx
src/app/profile/ChangePasswordForm.tsx
src/app/profile/ApiTokenView.tsx
```

**Critical Issue**: Uses `firebaseUser` for authentication check

**File: src/app/profile/page.tsx**
```typescript
// BEFORE
const { userProfile, firebaseUser, isLoading } = useAuth();
if (!userProfile || !firebaseUser) {
  notFound();
}

// AFTER
const { data: session, status } = useSession();
const { data: userProfile } = useQuery({...});  // Or from context
const isLoading = status === 'loading';
if (!userProfile || !session?.user) {
  notFound();
}
```

**Checklist for each file**:
- [ ] Replace useAuth with useSession
- [ ] Update authentication checks
- [ ] Update user ID references (uid → id)
- [ ] Test page still renders correctly
- [ ] Commit: "refactor: migrate profile page to NextAuth"

### 3.3 Writing Tools Hooks (🟡 YELLOW)
**Files** (12 total):
```
src/hooks/writing-tools/use-writing-tool.ts (Line 20)
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

**Critical**: `use-writing-tool.ts` is imported by all writing tool components

**File: src/hooks/writing-tools/use-writing-tool.ts** (Line 20)
```typescript
// BEFORE
const { firebaseUser, refetchUser } = useAuth();

// AFTER
const { data: session } = useSession();
const { refetchUser } = useAuth();  // Keep this from context for now

// Update mutationFn:
mutationFn: async (data: TVariables) => {
  return apiService({
    endpoint,
    method: 'POST',
    data: { ...data, flow: toolName },
    session,  // ← Pass session instead of firebaseUser
  });
},
```

**Checklist**:
- [ ] Update use-writing-tool.ts to accept session
- [ ] Update all 12 writing tool logic hooks
- [ ] Test writing tool operations still work
- [ ] Commit: "refactor: migrate writing-tools hooks to NextAuth"

### 3.4 Complex Auth Hooks (🔴 RED)
**File**: `src/hooks/auth/use-auth-mutations.ts`

**Issues**:
1. Line 45, 201: Direct `getIdToken()` calls
2. Phone auth with Firebase-specific logic
3. Multiple authentication methods

**Approach**:
- [ ] Replace direct `getIdToken()` with token from session
- [ ] For phone auth: Keep Firebase OR implement custom NextAuth provider
- [ ] Test all auth flows: email, Google, phone (if keeping)
- [ ] Commit: "refactor: migrate useAuthMutations to NextAuth"

**Specific changes needed**:
```typescript
// Line 45 - in handleFirstSignIn
const token = await user.getIdToken();
// BECOMES: Pass token directly from caller

// Line 201 - in useSendPasswordReset
const token = await firebaseUser.getIdToken();
// BECOMES: const token = session?.user?.accessToken;
```

---

## Phase 4: Final Cleanup (Remove Legacy)

### 4.1 Remove AuthProvider (If choosing single provider)
**File**: `src/components/shared/RootProviders.tsx`

- [ ] Remove: `import { AuthProvider } from '@/context/AuthContext'`
- [ ] Remove: `<AuthProvider>` wrapper
- [ ] Keep: `<NextAuthProvider>`
- [ ] Update comment: Document that NextAuthProvider provides both context

### 4.2 Deprecate Old AuthContext
**File**: `src/context/AuthContext.tsx`

- [ ] Add deprecation notice at top of file
- [ ] Document: "This file is deprecated. Use NextAuthContext instead."
- [ ] Do NOT delete yet (some components may still use it)
- [ ] Plan removal in next version

### 4.3 Optional: Rename NextAuthProvider
**File**: `src/context/NextAuthContext.tsx`

Consider renaming for clarity:
```typescript
// Current
export const NextAuthProvider = ...
export const useAuth = ...

// Could rename to
export const AuthProvider = ...  // Since it's now the primary provider
export const useAuth = ...       // Remains the same
```

**Decision**: Rename or keep as-is? (Matters for consistency)

---

## Testing Checklist

### Unit Tests
- [ ] `getAuthenticatedToken()` works with NextAuth sessions
- [ ] `apiService()` handles NextAuth tokens correctly
- [ ] Individual hooks work with NextAuth

### Integration Tests
- [ ] Login flow works (email/Google)
- [ ] Profile page renders with session
- [ ] Admin pages check authorization correctly
- [ ] Payment hooks fetch data with session token
- [ ] Writing tools execute successfully
- [ ] Logout clears session properly

### E2E Tests
- [ ] Full user journey: Login → Profile → Builder → Tools → Logout
- [ ] Admin flow: Admin login → Manage users → Logout
- [ ] Payment flow: Purchase credits with session auth

### Browser Testing
- [ ] Light/dark theme persistence
- [ ] Mobile responsiveness
- [ ] Offline behavior (if applicable)
- [ ] Session persistence across page reloads

---

## Rollback Procedures

### Quick Rollback (If Issues Detected)
```bash
# If on feature branch
git reset --hard origin/main
git push origin -f

# Or revert specific commit
git revert <commit-hash>
git push
```

### Partial Rollback (Some files reverted)
```bash
# Revert individual file
git checkout origin/main -- src/path/to/file.tsx

# Revert specific commit's changes to a file
git show <commit-hash>:src/path/to/file.tsx > src/path/to/file.tsx
```

### Data/Session Concerns
- [ ] NextAuth JWT secrets saved securely
- [ ] User sessions can be cleared safely
- [ ] No user data loss during migration
- [ ] Hasura JWT configuration matches NextAuth secret

---

## Success Criteria

✅ **Migration Complete When**:

- [ ] All 74 files reviewed
- [ ] All files using NextAuth exclusively (no more Firebase Auth references except phone auth if needed)
- [ ] Tests passing: Unit, Integration, E2E
- [ ] No runtime errors in development
- [ ] User authentication workflows functional
- [ ] Admin access control working
- [ ] Payment operations working
- [ ] Writing tools functional
- [ ] Performance similar or improved
- [ ] Session management stable across navigations
- [ ] Logout properly clears all user data
- [ ] Profile/account operations work correctly

---

## Timeline Estimate

| Phase | Duration | Risk | Notes |
|-------|----------|------|-------|
| Pre-flight | 1 day | 🟢 Low | Answer questions, documentation |
| Phase 1 | 2-3 days | 🟢 Low | Infrastructure changes, tests |
| Phase 2 | 3-4 days | 🟡 Medium | Safe migrations, batch by category |
| Phase 3 | 5-7 days | 🟡 Medium | Complex files, careful review |
| Phase 4 | 1-2 days | 🟢 Low | Cleanup, final testing |
| **Total** | **12-18 days** | | ~2-3 weeks for full migration |

---

## Support & Troubleshooting

### Common Issues & Solutions

**Issue: "session is undefined"**
- Solution: Ensure `useSession()` is called within SessionProvider
- Check: Component has `'use client'` directive

**Issue: "No token in session"**
- Solution: Verify NextAuth JWT callback is setting token correctly
- Check: NextAuth configuration has jwt callback

**Issue: "Profile route redirects to login"**
- Solution: Verify user ID field name matches between NextAuth and route params
- Check: `session?.user?.id` is being populated

**Issue: "Hooks work but pages still use old auth"**
- Solution: Review pages in Phase 3 section
- Check: All page-level auth checks updated

---

## Notes & Decisions Log

### Decision 1: Provider Strategy
**Chosen**: [A - Dual] / [B - Single]  
**Reason**: ___________  
**Date**: ___________  

### Decision 2: Phone Auth
**Chosen**: [A - Keep Firebase] / [B - Remove] / [C - Custom]  
**Reason**: ___________  
**Date**: ___________  

### Decision 3: Token Field Name
**Field**: `session.user.___________`  
**Verified**: Yes / No  
**Date**: ___________  

### Decision 4: ID Field Name
**Field**: `session.user.___________`  
**Verified**: Yes / No  
**Date**: ___________  

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-17  
**Status**: Ready for Implementation  
**Next Step**: Answer pre-migration questions in section "Pre-Migration: Answer Critical Questions"
