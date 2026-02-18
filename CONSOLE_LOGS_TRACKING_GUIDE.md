# Console Logs Tracking Guide: User Authentication Flow

## Overview

Comprehensive console logging has been added to track the complete user authentication flow from login to profile data retrieval. This guide shows you exactly what logs to expect at each step.

---

## 🔍 Console Log Locations & Expected Output

### STEP 1: LOGIN FORM SUBMISSION
**When you click "Sign In"**

```
No logs yet - waiting for NextAuth callback
```

---

### STEP 2: NEXTAUTH CREDENTIALS PROVIDER
**File:** `src/app/api/auth/[...nextauth]/route.ts` - `authorize()` callback

**Expected Logs:**
```
[NextAuth] authorize() called with email: admin@arkan.dev

[NextAuth] Searching for user with email: admin@arkan.dev

[NextAuth] User found: {
  id: "cmlseqqdx00009t186flyd6oq",
  email: "admin@arkan.dev",
  name: "Admin User",
  role: "ADMIN",
  credits: 10000,
  hasPasswordHash: true
}

[NextAuth] Verifying password...

[NextAuth] Password verified successfully

[NextAuth] authorize() returning user: {
  id: "cmlseqqdx00009t186flyd6oq",
  email: "admin@arkan.dev",
  name: "Admin User",
  image: null
}
```

**What to Check:**
- ✅ User found with correct email
- ✅ User has passwordHash
- ✅ Password verification succeeds
- ✅ User ID is returned

---

### STEP 3: NEXTAUTH JWT CALLBACK
**File:** `src/app/api/auth/[...nextauth]/route.ts` - `jwt()` callback

**Expected Logs:**
```
[NextAuth JWT] jwt() called {
  hasUser: true,
  tokenHasUserId: false,
  userId: "cmlseqqdx00009t186flyd6oq"
}

[NextAuth JWT] Initial sign in - user object: {
  id: "cmlseqqdx00009t186flyd6oq",
  email: "admin@arkan.dev",
  name: "Admin User"
}

[NextAuth JWT] Fetching full user data for ID: cmlseqqdx00009t186flyd6oq

[NextAuth JWT] Full user data fetched: {
  role: "ADMIN",
  credits: 10000
}

[NextAuth JWT] Token updated with role and credits: {
  role: "ADMIN",
  credits: 10000
}

[NextAuth JWT] Adding Hasura claims with role: ADMIN

[NextAuth JWT] jwt() returning token: {
  userId: "cmlseqqdx00009t186flyd6oq",
  email: "admin@arkan.dev",
  role: "ADMIN",
  credits: 10000
}
```

**What to Check:**
- ✅ JWT has user object
- ✅ Full user data fetched with role and credits
- ✅ Hasura claims added with correct role
- ✅ Token has all required fields

---

### STEP 4: NEXTAUTH SESSION CALLBACK
**File:** `src/app/api/auth/[...nextauth]/route.ts` - `session()` callback

**Expected Logs:**
```
[NextAuth Session] session() called with token: {
  userId: "cmlseqqdx00009t186flyd6oq",
  email: "admin@arkan.dev",
  role: "ADMIN",
  credits: 10000
}

[NextAuth Session] Session user object populated: {
  id: "cmlseqqdx00009t186flyd6oq",
  email: "admin@arkan.dev",
  name: "Admin User",
  role: "ADMIN",
  credits: 10000
}

[NextAuth Session] Hasura token added: {
  x-hasura-allowed-roles: ["ADMIN", "anonymous"],
  x-hasura-default-role: "ADMIN",
  x-hasura-user-id: "cmlseqqdx00009t186flyd6oq",
  x-hasura-role: "ADMIN"
}

[NextAuth Session] session() returning: {
  userExists: true,
  userId: "cmlseqqdx00009t186flyd6oq",
  hasuraTokenExists: true
}
```

**What to Check:**
- ✅ Session user object populated with all fields
- ✅ Hasura token included
- ✅ Role mapped to ADMIN
- ✅ Credits preserved

---

### STEP 5: NEXTAUTH SIGNIN CALLBACK
**File:** `src/app/api/auth/[...nextauth]/route.ts` - `signIn()` callback

**Expected Logs:**
```
[NextAuth SignIn] signIn() called for user: cmlseqqdx00009t186flyd6oq

[NextAuth SignIn] Updating lastLoginAt for user: cmlseqqdx00009t186flyd6oq

[NextAuth SignIn] lastLoginAt updated successfully

[NextAuth SignIn] signIn() returning true
```

**What to Check:**
- ✅ User ID received
- ✅ lastLoginAt timestamp updated in database
- ✅ signIn returns true (success)

---

### STEP 6: NEXTAUTH CONTEXT - SESSION HOOK
**File:** `src/context/NextAuthContext.tsx` - `useSession()` hook on component mount

**Expected Logs:**
```
[NextAuthContext] Session status: loading

(Page loads...)

[NextAuthContext] Session data: {
  userId: "cmlseqqdx00009t186flyd6oq",
  email: "admin@arkan.dev",
  name: "Admin User",
  role: "ADMIN",
  credits: 10000,
  hasHasuraToken: true
}
```

**What to Check:**
- ✅ Session status transitions from 'loading' to 'authenticated'
- ✅ Session data includes all user fields
- ✅ Hasura token present

---

### STEP 7: EXTRACT USER ID
**File:** `src/context/NextAuthContext.tsx` - Extract `session.user.id`

**Expected Output:**
```javascript
const userId = "cmlseqqdx00009t186flyd6oq"
```

**Verification:** Check that `userId` is not `undefined` or empty string

---

### STEP 8: REACT QUERY - QUERY EXECUTION CHECK
**File:** `src/context/NextAuthContext.tsx` - `useQuery` hook

**Expected Logs:**
```
[NextAuthContext Query] Query result: {
  hasData: false,
  isLoading: true,
  queryKey: ["users", "detail", "cmlseqqdx00009t186flyd6oq"]
}
```

**What to Check:**
- ✅ Query key has correct userId (not 'pending')
- ✅ Query is loading (isLoading: true)
- ✅ No data yet (hasData: false)

---

### STEP 9: REACT QUERY - QUERY FUNCTION EXECUTION
**File:** `src/context/NextAuthContext.tsx` - `queryFn` execution

**Expected Logs:**
```
[NextAuthContext Query] queryFn executing for userId: cmlseqqdx00009t186flyd6oq

[NextAuthContext Query] Calling fetchUserProfileApi with: {
  userId: "cmlseqqdx00009t186flyd6oq",
  token: "cmlseqqdx00009t186flyd6oq",
  sessionExists: true
}
```

**What to Check:**
- ✅ queryFn is executing (not skipped)
- ✅ userId is not empty
- ✅ token is provided
- ✅ session exists

---

### STEP 10: USER SERVICE - FETCH API
**File:** `src/services/api/userService.ts` - `fetchUserProfileApi()`

**Expected Logs:**
```
[userService] fetchUserProfileApi called with: {
  userId: "cmlseqqdx00009t186flyd6oq",
  tokenLength: 25,
  tokenPreview: "cmlseqqdx..."
}

[userService] Calling apiService for user profile
```

**What to Check:**
- ✅ userId is provided
- ✅ token is provided and has reasonable length
- ✅ apiService is being called

---

### STEP 11: API SERVICE - REQUEST PREPARATION
**File:** `src/services/api/apiService.ts` - Request setup

**Expected Logs:**
```
[apiService] Preparing request: {
  method: "GET",
  endpoint: "/api/users/cmlseqqdx00009t186flyd6oq",
  hasAuthToken: true,
  hasData: false,
  isFormData: false
}

[apiService] Authorization header set for token: cmlseqqdx...

[apiService] Fetching from endpoint: /api/users/cmlseqqdx00009t186flyd6oq
```

**What to Check:**
- ✅ Method is GET
- ✅ Endpoint is correct
- ✅ Authorization header set
- ✅ No request body (hasData: false)

---

### STEP 12: API SERVICE - FETCH & RESPONSE
**File:** `src/services/api/apiService.ts` - Fetch response

**Expected Logs:**
```
[apiService] Response received: {
  endpoint: "/api/users/cmlseqqdx00009t186flyd6oq",
  status: 200,
  statusText: "OK",
  ok: true
}

[apiService] GET /api/users/cmlseqqdx00009t186flyd6oq - contentType: application/json; charset=utf-8

[apiService] Response data parsed: {
  id: "cmlseqqdx00009t186flyd6oq",
  name: "Admin User",
  email: "admin@arkan.dev",
  emailVerified: true,
  image: null,
  role: "ADMIN",
  fullName: null,
  phone: null,
  phoneVerified: null,
  credits: 10000,
  totalSpent: 0,
  createdAt: "2026-02-17T16:02:15.000Z",
  updatedAt: "2026-02-17T16:02:15.000Z",
  lastLoginAt: "2026-02-18T19:14:34.000Z"
}
```

**What to Check:**
- ✅ Status is 200 OK
- ✅ Content-type includes application/json
- ✅ Response data has all user fields
- ✅ NO passwordHash in response (security check)

---

### STEP 13: WITH AUTH MIDDLEWARE - REQUEST
**File:** `src/lib/utils/api-utils.ts` - `withAuth()` middleware

**Expected Logs:**
```
[withAuth] API request received: {
  method: "GET",
  url: "http://localhost:3000/api/users/cmlseqqdx00009t186flyd6oq",
  requireAdmin: false
}

[withAuth] Resolved params: {
  id: "cmlseqqdx00009t186flyd6oq"
}

[withAuth] Getting session from NextAuth...

[withAuth] Session retrieved: {
  hasSession: true,
  hasUserId: true,
  userId: "cmlseqqdx00009t186flyd6oq",
  email: "admin@arkan.dev",
  role: "ADMIN"
}
```

**What to Check:**
- ✅ Session exists
- ✅ userId in session
- ✅ User role is present

---

### STEP 14: WITH AUTH MIDDLEWARE - USER FETCH
**File:** `src/lib/utils/api-utils.ts` - Fetch user from database

**Expected Logs:**
```
[withAuth] Fetching full user profile from database for userId: cmlseqqdx00009t186flyd6oq

[withAuth] User profile retrieved: {
  hasUser: true,
  userId: "cmlseqqdx00009t186flyd6oq",
  email: "admin@arkan.dev",
  role: "ADMIN",
  credits: 10000
}

[withAuth] Authorization passed, calling handler

[withAuth] Handler returned response with status: 200
```

**What to Check:**
- ✅ User found in database
- ✅ User profile has all required fields
- ✅ Handler called successfully
- ✅ Response status is 200

---

### STEP 15: USER SERVICE - API RESPONSE PARSED
**File:** `src/services/api/userService.ts` - Result logging

**Expected Logs:**
```
[userService] fetchUserProfileApi result: {
  hasResult: true,
  resultKeys: [
    "id",
    "name",
    "email",
    "emailVerified",
    "image",
    "role",
    "fullName",
    "phone",
    "phoneVerified",
    "credits",
    "totalSpent",
    "createdAt",
    "updatedAt",
    "lastLoginAt"
  ],
  userId: "cmlseqqdx00009t186flyd6oq",
  email: "admin@arkan.dev",
  role: "ADMIN"
}
```

**What to Check:**
- ✅ Result exists
- ✅ Has expected keys (NO passwordHash)
- ✅ User data intact

---

### STEP 16: REACT QUERY - MAP USER DATA
**File:** `src/context/NextAuthContext.tsx` - Data mapping in queryFn

**Expected Logs:**
```
[NextAuthContext Query] fetchUserProfileApi response: {
  id: "cmlseqqdx00009t186flyd6oq",
  name: "Admin User",
  email: "admin@arkan.dev",
  role: "ADMIN",
  credits: 10000,
  ...
}

[NextAuthContext Query] Mapping user profile data to User model

[NextAuthContext Query] Mapped data: {
  id: "cmlseqqdx00009t186flyd6oq",
  name: "Admin User",
  email: "admin@arkan.dev",
  role: "admin",
  credits: 10000,
  createdAt: "2026-02-17T16:02:15.000Z",
  updatedAt: "2026-02-17T16:02:15.000Z",
  hasCompletedOnboarding: true
}

[NextAuthContext Query] User instance created: {
  id: "cmlseqqdx00009t186flyd6oq",
  email: "admin@arkan.dev",
  role: "admin",
  credits: 10000
}

[NextAuthContext Query] Builder store updated with user profile
```

**What to Check:**
- ✅ API response received
- ✅ Role mapped from "ADMIN" to "admin"
- ✅ User instance created successfully
- ✅ Store updated

---

### STEP 17: REACT QUERY - FINAL RESULT
**File:** `src/context/NextAuthContext.tsx` - Query completion

**Expected Logs:**
```
[NextAuthContext Query] Query result: {
  hasData: true,
  isLoading: false,
  queryKey: ["users", "detail", "cmlseqqdx00009t186flyd6oq"]
}
```

**What to Check:**
- ✅ hasData is now true
- ✅ isLoading is false
- ✅ Query completed successfully

---

### STEP 18: NEXTAUTH CONTEXT - EFFECTS
**File:** `src/context/NextAuthContext.tsx` - useEffect hooks

**Expected Logs:**
```
[NextAuthContext Effect] Updating builder store with user profile: {
  hasProfile: true,
  userId: "cmlseqqdx00009t186flyd6oq",
  email: "admin@arkan.dev"
}

[NextAuthContext Effect] Session changed - checking if logout: {
  hasSession: true
}
```

**What to Check:**
- ✅ Builder store updated with user profile
- ✅ Session still exists (no logout)

---

### STEP 19: NEXTAUTH CONTEXT - PROVIDER
**File:** `src/context/NextAuthContext.tsx` - Context provider

**Expected Logs:**
```
[NextAuthContext] Providing auth context: {
  isLoading: false,
  hasUserProfile: true,
  userId: "cmlseqqdx00009t186flyd6oq",
  sessionStatus: "authenticated"
}
```

**What to Check:**
- ✅ isLoading is false
- ✅ userProfile exists
- ✅ sessionStatus is "authenticated"

---

## 📋 Quick Debugging Checklist

Use this checklist to quickly verify each step:

- [ ] **Login**: Can you see `[NextAuth] authorize() called` log?
- [ ] **Password**: Can you see `[NextAuth] Password verified successfully`?
- [ ] **JWT**: Can you see `[NextAuth JWT] jwt() returning token`?
- [ ] **Session**: Can you see `[NextAuth Session] Session user object populated`?
- [ ] **SignIn**: Can you see `[NextAuth SignIn] lastLoginAt updated successfully`?
- [ ] **Context Session**: Can you see `[NextAuthContext] Session data:` with user fields?
- [ ] **UserId Extracted**: Is userId NOT undefined or empty?
- [ ] **Query Enabled**: Is query key NOT showing "pending"?
- [ ] **QueryFn Executed**: Can you see `[NextAuthContext Query] queryFn executing`?
- [ ] **API Called**: Can you see `[apiService] Fetching from endpoint`?
- [ ] **API Response 200**: Can you see `status: 200` in apiService logs?
- [ ] **Response JSON**: Can you see `Response data parsed:` with user data?
- [ ] **WithAuth Passed**: Can you see `[withAuth] Authorization passed, calling handler`?
- [ ] **Data Mapped**: Can you see `[NextAuthContext Query] Mapped data:`?
- [ ] **User Instance**: Can you see `[NextAuthContext Query] User instance created:`?
- [ ] **Query Complete**: Can you see `hasData: true, isLoading: false`?
- [ ] **Context Provided**: Can you see `[NextAuthContext] Providing auth context:` with `hasUserProfile: true`?

---

## 🔴 Common Issues & Where to Look

### Issue: "User Query Details is empty"
- Check Step 8 logs
- Query key should NOT be `['users', 'detail', 'pending']`
- Should be `['users', 'detail', 'cmlseqqdx00009t186flyd6oq']`

### Issue: "No API call made"
- Check Step 9 logs
- If queryFn not executing, enabled condition is false
- Verify userId and session both exist

### Issue: "API returns 401"
- Check Step 14 logs (withAuth)
- Session not found or invalid
- Check session callback logs

### Issue: "API returns 403"
- Check Step 14 logs (withAuth)
- User not found in database
- Or user role check failed

### Issue: "userProfile is null"
- Check Step 16 logs
- If mapping fails, check field names
- If no API response, check earlier steps

### Issue: "Content-type mismatch"
- Check Step 12 logs
- Should see `application/json`
- If seeing something else, API response is wrong

---

## 🎯 Expected Log Flow Timeline

```
[NextAuth] authorize() called
    ↓
[NextAuth] User found
    ↓
[NextAuth] Password verified
    ↓
[NextAuth JWT] jwt() called
    ↓
[NextAuth Session] session() called
    ↓
[NextAuth SignIn] signIn() called
    ↓
[NextAuthContext] Session data: (received on client)
    ↓
[NextAuthContext Query] queryFn executing
    ↓
[userService] fetchUserProfileApi called
    ↓
[apiService] Preparing request
    ↓
[apiService] Fetching from endpoint
    ↓
[withAuth] API request received
    ↓
[withAuth] Authorization passed
    ↓
[apiService] Response received (200 OK)
    ↓
[NextAuthContext Query] Mapped data
    ↓
[NextAuthContext Query] User instance created
    ↓
[NextAuthContext] Providing auth context
```

---

## 💡 Pro Tips

1. **Filter console by prefix**: Type `[NextAuth]` in browser console filter to see only NextAuth logs
2. **Use console.group()**: Logs are grouped by prefix for easier reading
3. **Check Network tab**: Verify actual HTTP requests and responses
4. **Use React DevTools**: Inspect component state for userProfile
5. **Check localStorage**: NextAuth stores session token here
6. **DevTools → Application → Cookies**: Check for `next-auth.session-token`

