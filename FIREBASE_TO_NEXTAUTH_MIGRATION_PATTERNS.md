# Firebase Auth to NextAuth Migration - Code Patterns & Examples

**Reference Document**: Companion to `FIREBASE_TO_NEXTAUTH_MIGRATION_AUDIT.md`

---

## Table of Contents
1. [Pattern 1: Simple userProfile Access](#pattern-1-simple-userprofile-access)
2. [Pattern 2: firebaseUser UID/Email Access](#pattern-2-firebaseuser-uidemail-access)
3. [Pattern 3: Token Generation via Helper](#pattern-3-token-generation-via-helper)
4. [Pattern 4: Direct getIdToken() Calls](#pattern-4-direct-getidtoken-calls)
5. [Pattern 5: Complex Hook Patterns](#pattern-5-complex-hook-patterns)
6. [Migration Examples](#migration-examples)

---

## Pattern 1: Simple userProfile Access

### Current Code (Firebase)
```tsx
// src/components/shared/Header.tsx (Line 111)
const { userProfile } = useAuth();
const hasNoCredits = userProfile?.credits === 0;
```

```tsx
// src/components/shared/UserProfileDropdown.tsx (Line 23)
const { userProfile } = useAuth();
if (!userProfile) return null;
const isAdmin = userProfile.role === 'admin';
```

### Why This Works with NextAuth
The `NextAuthProvider` (src/context/NextAuthContext.tsx) already:
1. Fetches userProfile via React Query
2. Stores in `setUserProfile()` from builder store
3. Exposes via same `useAuth()` hook

**Migration**: ✅ **NO CHANGES NEEDED**
- Can continue using `useAuth()` → `userProfile`
- NextAuthProvider handles the data fetching
- Backwards compatible through dual provider setup

---

## Pattern 2: firebaseUser UID/Email Access

### Current Code (Firebase)
```tsx
// src/app/admin/layout.tsx (Line 114)
const { userProfile, isLoading: isAuthLoading, firebaseUser } = useAuth();
```

```tsx
// src/app/admin/layout.tsx (Line 173)
<Link href={`/profile/${firebaseUser?.uid}`}>Profile</Link>
```

```tsx
// src/app/profile/page.tsx (Line 40)
const { userProfile, firebaseUser, isLoading } = useAuth();
if (!userProfile || !firebaseUser) {
  notFound();
}
```

```tsx
// src/app/profile/[id]/page.tsx
// Uses firebaseUser.uid from context
```

### NextAuth Equivalent
```tsx
// Option A: Use session directly (RECOMMENDED)
const { data: session } = useSession();
const userId = session?.user?.id;  // ← Check exact field name
const userEmail = session?.user?.email;

// Option B: Keep using useAuth() but with updated implementation
const { firebaseUser } = useAuth();  // Returns { uid, email } from NextAuthProvider
```

### NextAuthProvider Implementation
```tsx
// src/context/NextAuthContext.tsx (Lines 25-28)
const firebaseUser = session?.user ? {
  uid: session.user.id,
  email: session.user.email,
} : null;
```

**Migration**: 🟡 **REVIEW NEEDED**
1. Verify `session.user.id` is the correct field name
2. If field name differs, update NextAuthProvider mapping
3. Files affected: 8 files that reference `firebaseUser.uid`

**Files to Review**:
- src/app/admin/layout.tsx (line 173)
- src/app/profile/page.tsx (line 50)
- src/app/profile/[id]/page.tsx
- src/components/admin/users/UserTableRow.tsx
- src/components/admin/payments/GiftCreditsDialog.tsx
- src/components/admin/payments/FinancialReportExporter.tsx

---

## Pattern 3: Token Generation via Helper

### Current Code (Firebase)
```tsx
// src/lib/utils/authUtils.ts
export const getAuthenticatedToken = async (firebaseUser: FirebaseUser | null): Promise<string> => {
  if (!firebaseUser) {
    throw new Error("User not authenticated");
  }
  return await firebaseUser.getIdToken();
};
```

### Usage Pattern (20+ occurrences)
```tsx
// src/hooks/data/use-users.ts
const { firebaseUser } = useAuth();
const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    if (!firebaseUser) return null;
    const token = await getAuthenticatedToken(firebaseUser);  // ← Helper call
    const users = await fetchUsersApi(token);
    return users;
  },
  enabled: !!firebaseUser,
});
```

```tsx
// src/hooks/data/use-payment.ts
const { firebaseUser } = useAuth();
const mutation = useMutation({
  mutationFn: async (data) => {
    if (!firebaseUser) throw new Error("User not authenticated");
    const token = await firebaseUser.getIdToken();  // ← Direct call
    return paymentApi(token, data);
  },
});
```

### NextAuth Equivalent
```tsx
// Option 1: Update getAuthenticatedToken() to support NextAuth
export const getAuthenticatedToken = async (
  firebaseUserOrSession: FirebaseUser | Session | null
): Promise<string> => {
  if (!firebaseUserOrSession) {
    throw new Error("User not authenticated");
  }
  
  // Check if it's a FirebaseUser (has getIdToken method)
  if ('getIdToken' in firebaseUserOrSession) {
    return await firebaseUserOrSession.getIdToken();
  }
  
  // Otherwise treat as NextAuth Session
  if (firebaseUserOrSession.user?.accessToken) {
    return firebaseUserOrSession.user.accessToken;
  }
  
  throw new Error("No token available");
};
```

```tsx
// Option 2: Create new helper for NextAuth (CLEANER)
export const getNextAuthToken = async (session: Session | null): Promise<string> => {
  if (!session?.user?.accessToken) {
    throw new Error("User not authenticated");
  }
  return session.user.accessToken;
};

// Then update usage:
const { data: session } = useSession();
const token = await getNextAuthToken(session);
```

### Files Using This Pattern (20+ files)
```
src/hooks/data/use-users.ts
src/hooks/data/use-payment.ts
src/hooks/data/use-pptx-templates.ts (4 calls)
src/hooks/data/use-docx-templates.ts (4 calls)
src/hooks/data/use-features.ts
src/hooks/data/use-analytics.ts
src/hooks/data/use-projects.ts
src/hooks/data/use-agent-categories.ts
src/hooks/data/use-transactions.ts (4 calls)
src/hooks/data/use-sections.ts
src/hooks/data/use-templates.ts (6 calls)
src/hooks/writing-tools/* (multiple files)
src/hooks/admin/* (multiple files)
```

**Migration**: 🔴 **CRITICAL - Infrastructure Change**
1. Update `getAuthenticatedToken()` OR create `getNextAuthToken()`
2. Change all 20+ call sites to use new function
3. Update function signature and consumers
4. **Test thoroughly** - this is the token pipeline

---

## Pattern 4: Direct getIdToken() Calls

### Current Code (Firebase)
```tsx
// src/hooks/data/use-payment.ts
const { firebaseUser } = useAuth();
const token = await firebaseUser.getIdToken();

// src/hooks/data/use-features.ts
const { firebaseUser } = useAuth();
const token = await firebaseUser.getIdToken();

// src/hooks/auth/use-auth-mutations.ts (Line 45, 201)
const token = await user.getIdToken();
const token = await firebaseUser.getIdToken();
```

### NextAuth Equivalent
```tsx
// Option 1: Access token directly from session
const { data: session } = useSession();
const token = session?.user?.accessToken;

// Option 2: Via useAuth() if NextAuthProvider provides it
// Requires extending NextAuthProvider to expose token method

// Option 3: Create custom hook
export function useAuthToken() {
  const { data: session } = useSession();
  return session?.user?.accessToken;
}
```

### Files Affected (6 files with direct calls)
```
src/hooks/data/use-payment.ts
src/hooks/data/use-features.ts
src/hooks/data/use-analytics.ts
src/hooks/data/use-transactions.ts
src/hooks/auth/use-auth-mutations.ts (multiple calls)
src/lib/utils/authUtils.ts (core utility)
```

**Migration**: 🔴 **CRITICAL**
1. Identify NextAuth session field for access token
2. Replace all `getIdToken()` calls
3. Handle missing token case (session not loaded)

---

## Pattern 5: Complex Hook Patterns

### Pattern 5A: useQuery with Token Dependency

```tsx
// src/hooks/data/use-users.ts
export function useUserProfile(userId: string) {
  const { firebaseUser } = useAuth();
  
  const { data: users } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!firebaseUser) return null;
      const token = await getAuthenticatedToken(firebaseUser);
      const userProfileData = await fetchUserProfileApi(userId, token);
      const userInstance = userProfileData ? new User(userProfileData) : null;
      return userInstance;
    },
    enabled: !!firebaseUser && !!userId,  // ← Dependency check
  });
  
  return { data: users };
}
```

**Migration Steps**:
```tsx
export function useUserProfile(userId: string) {
  const { data: session } = useSession();  // ← Replace this line
  
  const { data: users } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!session) return null;
      const token = session.user?.accessToken;  // ← Update token extraction
      if (!token) throw new Error("No auth token");
      const userProfileData = await fetchUserProfileApi(userId, token);
      const userInstance = userProfileData ? new User(userProfileData) : null;
      return userInstance;
    },
    enabled: !!session && !!userId,  // ← Update dependency
  });
  
  return { data: users };
}
```

### Pattern 5B: useMutation with Token

```tsx
// src/hooks/data/use-payment.ts
export function usePurchaseCredits() {
  const { firebaseUser } = useAuth();
  
  return useMutation({
    mutationFn: async (amount: number) => {
      if (!firebaseUser) throw new Error("User not authenticated");
      const token = await firebaseUser.getIdToken();
      return paymentApi(amount, token);
    },
  });
}
```

**Migration**:
```tsx
export function usePurchaseCredits() {
  const { data: session } = useSession();  // ← Replace this line
  
  return useMutation({
    mutationFn: async (amount: number) => {
      if (!session?.user?.accessToken) throw new Error("User not authenticated");
      return paymentApi(amount, session.user.accessToken);  // ← Simpler
    },
  });
}
```

### Pattern 5C: Multiple Dependencies

```tsx
// src/hooks/data/use-transactions.ts
export function useTransactions() {
  const { firebaseUser, isLoading: authLoading } = useAuth();
  
  const { data } = useQuery({
    queryKey: ['transactions', firebaseUser?.uid],
    queryFn: async () => {
      if (!firebaseUser) throw new Error("User not authenticated");
      const token = await firebaseUser.getIdToken();
      return getTransactionsApi(firebaseUser.uid, token);
    },
    enabled: !authLoading && !!firebaseUser,
  });
}
```

**Migration**:
```tsx
export function useTransactions() {
  const { data: session, status } = useSession();  // ← Replace
  
  const { data } = useQuery({
    queryKey: ['transactions', session?.user?.id],  // ← Use uid/id
    queryFn: async () => {
      if (!session?.user?.id) throw new Error("User not authenticated");
      const token = session.user.accessToken;
      return getTransactionsApi(session.user.id, token);  // ← Use session fields
    },
    enabled: status === 'authenticated',  // ← Use status
  });
}
```

---

## Pattern 6: RootProviders Stack

### Current Implementation
```tsx
// src/components/shared/RootProviders.tsx
export function RootProviders({ children, fontClassName }: RootProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SessionProvider>  {/* ← NextAuth Session */}
          <LocalizationProvider>
            <NextAuthProvider>  {/* ← Custom wrapper */}
              <AuthProvider>  {/* ← Legacy Firebase */}
                <FirebaseMessagingProvider>
                  <LanguageDirectionManager>
                    {/* App content */}
                  </LanguageDirectionManager>
                </FirebaseMessagingProvider>
              </AuthProvider>
            </NextAuthProvider>
          </LocalizationProvider>
        </SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
```

### Decision Point: Dual vs Single Provider
**Option A: Keep Both (Conservative)**
```tsx
// Pros: Backwards compatible, gradual migration
// Cons: Double processing, confusing, memory overhead
// Timeline: Keep during full migration
```

**Option B: Remove Legacy AuthProvider (Recommended)**
```tsx
export function RootProviders({ children, fontClassName }: RootProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SessionProvider>
          <LocalizationProvider>
            <NextAuthProvider>  {/* ← Sole auth provider */}
              <FirebaseMessagingProvider>
                <LanguageDirectionManager>
                  {/* App content */}
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

---

## Pattern 7: Service Layer Integration

### Current Pattern
```tsx
// src/services/api/apiService.ts
interface ApiServiceOptions<T> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: T;
  token?: string;
  firebaseUser?: FirebaseUser | null;  // ← Firebase specific
  headers?: Record<string, string>;
  isFormData?: boolean;
}

export async function apiService<TRequest = any, TResponse = any>(
  options: ApiServiceOptions<TRequest>
): Promise<TResponse> {
  const { endpoint, method = 'GET', data, token: directToken, firebaseUser } = options;
  
  let authToken = directToken;
  if (!authToken && firebaseUser) {
    authToken = await getAuthenticatedToken(firebaseUser);  // ← Firebase call
  }
  
  // Use authToken in fetch...
}
```

### Refactored for NextAuth
```tsx
// Option A: Remove firebaseUser parameter entirely
interface ApiServiceOptions<T> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: T;
  token: string;  // ← Now required (pass from hook)
  headers?: Record<string, string>;
  isFormData?: boolean;
}

export async function apiService<TRequest = any, TResponse = any>(
  options: ApiServiceOptions<TRequest>
): Promise<TResponse> {
  const { endpoint, method = 'GET', data, token } = options;
  
  const config: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };
  
  // Rest of implementation
}

// Usage - caller extracts token first
const { data: session } = useSession();
const response = await apiService({
  endpoint: '/api/users',
  token: session.user.accessToken,
});
```

```tsx
// Option B: Support both for transition (2-phase approach)
interface ApiServiceOptions<T> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: T;
  token?: string;
  firebaseUser?: FirebaseUser | null;  // ← Keep temporarily
  session?: Session | null;  // ← Add NextAuth support
  headers?: Record<string, string>;
  isFormData?: boolean;
}

export async function apiService<TRequest = any, TResponse = any>(
  options: ApiServiceOptions<TRequest>
): Promise<TResponse> {
  let authToken = options.token;
  
  // Priority: explicit token > NextAuth session > Legacy Firebase
  if (!authToken && options.session?.user?.accessToken) {
    authToken = options.session.user.accessToken;
  } else if (!authToken && options.firebaseUser) {
    authToken = await getAuthenticatedToken(options.firebaseUser);
  }
  
  // Rest of implementation
}
```

---

## Pattern 8: Phone Auth Handling

### Current Code (Firebase-specific)
```tsx
// src/hooks/auth/use-auth-mutations.ts
export function usePhoneSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const sendOtp = async (phoneNumber: string) => {
    const auth = getAuth(app);
    const confirmationResult = await signInWithPhoneNumber(
      auth, 
      phoneNumber, 
      (window as any).recaptchaVerifier  // ← Firebase-specific
    );
    return confirmationResult;
  };
  
  const verifyOtp = async (confirmationResult: ConfirmationResult, otp: string) => {
    const userCredential = await confirmationResult.confirm(otp);
    // After Firebase auth succeeds, create profile
    const { getAdditionalUserInfo } = await import('firebase/auth');
    const info = getAdditionalUserInfo(userCredential);
    if (info?.isNewUser) {
      await handleFirstSignIn(userCredential.user);
    }
  };
  
  return { sendOtp, verifyOtp, isLoading };
}
```

### Migration Challenge
**Issue**: NextAuth doesn't have built-in phone auth provider

**Options**:
1. **Keep Firebase for phone auth only** (Hybrid approach)
   - Use Firebase for phone verification
   - Create NextAuth session on success
   - Simplest but keeps Firebase dependency

2. **Switch to SMS provider** (e.g., Twilio, Auth0)
   - Full NextAuth integration
   - More complex setup
   - Better long-term

3. **Implement custom NextAuth provider**
   - Complex but clean
   - Requires backend changes

**Recommended**: Option 1 (Keep Firebase for phone) during migration

---

## Migration Examples

### Example 1: Simple Component Migration
**Before** (Firebase):
```tsx
// src/components/shared/Header.tsx
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const { userProfile } = useAuth();  // ← From AuthContext
  const { data: session } = useSession();  // ← From NextAuth
  
  // Mixing both patterns
  const isAuthenticated = !!session?.user;
  return (
    <header>
      {isAuthenticated && <UserActions userProfile={userProfile} />}
    </header>
  );
}
```

**After** (NextAuth):
```tsx
// Same file - already working!
// ✅ No changes needed
// NextAuthProvider supplies userProfile via useAuth()
// useSession() provides authentication state
```

### Example 2: Hook with Token Migration
**Before** (Firebase):
```tsx
// src/hooks/data/use-users.ts
import { useAuth } from '@/context/AuthContext';

export function useUsers() {
  const { firebaseUser } = useAuth();
  
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      return fetchUsersApi(token);
    },
    enabled: !!firebaseUser,
  });
}
```

**After** (NextAuth):
```tsx
// src/hooks/data/use-users.ts
import { useSession } from 'next-auth/react';

export function useUsers() {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!session?.user?.accessToken) throw new Error('Not authenticated');
      return fetchUsersApi(session.user.accessToken);
    },
    enabled: !!session?.user?.accessToken,
  });
}
```

### Example 3: Page with UID Reference
**Before** (Firebase):
```tsx
// src/app/admin/layout.tsx
import { useAuth } from '@/context/AuthContext';

function AdminLayout({ children }) {
  const { firebaseUser } = useAuth();
  
  return (
    <DropdownMenu>
      <DropdownMenuItem>
        <Link href={`/profile/${firebaseUser?.uid}`}>Profile</Link>
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
```

**After** (NextAuth):
```tsx
// src/app/admin/layout.tsx
import { useSession } from 'next-auth/react';

function AdminLayout({ children }) {
  const { data: session } = useSession();
  
  return (
    <DropdownMenu>
      <DropdownMenuItem>
        <Link href={`/profile/${session?.user?.id}`}>Profile</Link>
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
```

---

## Token Field Name Lookup

### Critical: Verify Your NextAuth JWT Configuration

**Check your NextAuth config for session token field**:

```tsx
// pages/api/auth/[...nextauth].ts or app/api/auth/[...nextauth]/route.ts
const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,  // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;  // ← Field name
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.accessToken = token.accessToken;  // ← Available in session
      return session;
    },
  },
};
```

**Common field names**:
- `session.user.accessToken` ← Most common
- `session.user.id` ← For user ID
- `session.user.jwtToken` ← Alternative
- Check your actual config!

---

## Quick Reference: Pattern → Migration Map

| Pattern | Location | Type | Effort | Risk |
|---------|----------|------|--------|------|
| userProfile access | Header, UserDropdown | Reference | 🟢 None | 🟢 Low |
| firebaseUser.uid | Admin, Profile pages | Reference | 🟡 Review | 🟡 Medium |
| getAuthenticatedToken() | Data hooks | Function | 🔴 Update | 🔴 High |
| firebaseUser.getIdToken() | Payment, Features hooks | Function | 🔴 Replace | 🔴 High |
| useQuery with token | 11 data hooks | Pattern | 🟡 Replace | 🟡 Medium |
| useMutation with token | 8 hooks | Pattern | 🟡 Replace | 🟡 Medium |
| Phone auth | usePhoneSignIn | Feature | 🔴 Decide | 🔴 High |

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-17  
**Status**: Ready for Implementation Reference
