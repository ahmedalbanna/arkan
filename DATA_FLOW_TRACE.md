# Complete Data Flow Trace: Login to Profile User

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ USER LOGIN                                                                   │
│ Input: email="admin@arkan.dev", password="admin123"                         │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. LOGIN COMPONENT (src/app/login/page.tsx)                                 │
│ signIn('credentials', { email, password })                                  │
│ ↓                                                                             │
│ SignInResponse { error?, status?, ok?, url? }                               │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. NEXTAUTH CREDENTIALS PROVIDER                                            │
│ authorize(credentials, req)                                                  │
│ ├─ prisma.user.findUnique({ where: { email } })                            │
│ ├─ bcrypt.compare(password, user.passwordHash)                             │
│ └─ return { id, email, name, image, role, credits }                        │
│ ↓                                                                             │
│ Session User Object { id, email, name, image, role, credits }              │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. JWT CALLBACK                                                             │
│ jwt(token, user, account, profile, isNewUser)                              │
│ └─ token.user = user  (merge user into JWT)                                │
│ ↓                                                                             │
│ JWT { user: {...}, iat, exp, jti }                                         │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. SESSION CALLBACK                                                         │
│ session(session, token, user)                                               │
│ ├─ session.user = token.user                                               │
│ └─ session.hasuraToken = {...}                                             │
│ ↓                                                                             │
│ Session {                                                                    │
│   user: { id, email, name, image, role, credits },                        │
│   hasuraToken: { x-hasura-* },                                             │
│   expires                                                                    │
│ }                                                                            │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. API ENDPOINT: GET /api/auth/session                                      │
│ HTTP Response: 200 OK                                                       │
│ Content-Type: application/json                                              │
│ ↓                                                                             │
│ JSON { user, hasuraToken, expires }                                        │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. NEXTAUTH CONTEXT (src/context/NextAuthContext.tsx)                       │
│ const { data: session, status } = useSession()                              │
│ ↓                                                                             │
│ session: Session Object                                                     │
│ status: 'loading' | 'authenticated' | 'unauthenticated'                   │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 7. EXTRACT USER ID                                                          │
│ const userId = session?.user?.id                                            │
│ ↓                                                                             │
│ userId: string | undefined = "cmlseqqdx00009t186flyd6oq"                  │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 8. REACT QUERY (useQuery)                                                   │
│ queryKey: ['users', 'detail', userId]                                       │
│ enabled: !!userId && !!session                                              │
│ queryFn: async () => fetchUserProfileApi(userId, token)                    │
│ ↓                                                                             │
│ Triggers Query Execution                                                    │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 9. FETCH USER PROFILE API (src/services/api/userService.ts)                │
│ fetchUserProfileApi(userId, token)                                          │
│ └─ apiService({ endpoint: `/api/users/${userId}`, token })                 │
│ ↓                                                                             │
│ Calls apiService with:                                                      │
│   - endpoint: "/api/users/cmlseqqdx00009t186flyd6oq"                       │
│   - token: "cmlseqqdx00009t186flyd6oq"                                     │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 10. API SERVICE (src/services/api/apiService.ts)                            │
│ apiService<TRequest, TResponse>(options)                                    │
│ ├─ Extract authToken from token parameter                                   │
│ ├─ Build RequestInit config with Authorization header                      │
│ ├─ fetch(endpoint, config)                                                  │
│ ├─ Check response.ok (must be true)                                        │
│ ├─ Check content-type header (must be 'application/json')                  │
│ └─ response.json()                                                          │
│ ↓                                                                             │
│ HTTP Request:                                                               │
│   GET /api/users/cmlseqqdx00009t186flyd6oq                                │
│   Authorization: Bearer cmlseqqdx00009t186flyd6oq                         │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 11. API ENDPOINT: GET /api/users/[id] (src/app/api/users/[id]/route.ts)    │
│ Handler: withAuth(async ({ params, user: requester }) => {...})            │
│ ├─ Extract targetUserId from params                                         │
│ ├─ Authorization check:                                                     │
│ │  if (requester.role !== 'ADMIN' && requester.id !== targetUserId)        │
│ │    return 403 Forbidden                                                   │
│ ├─ Call getUserProfile(targetUserId)                                       │
│ └─ Return createApiResponse(user, 200)                                     │
│ ↓                                                                             │
│ Authorization: ✅ PASSES (requester.role === 'ADMIN')                       │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 12. GET USER PROFILE SERVICE (src/services/userService.ts)                 │
│ getUserProfile(id)                                                           │
│ ├─ prisma.user.findUnique({                                                │
│ │    where: { id },                                                         │
│ │    select: { id, name, email, role, credits, ... } (NO passwordHash!)   │
│ │  })                                                                       │
│ └─ return user as UserProfile                                              │
│ ↓                                                                             │
│ Database Query Result:                                                      │
│   User { id, name, email, role, credits, ... }                            │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 13. API RESPONSE: 200 OK                                                    │
│ Content-Type: application/json; charset=utf-8                               │
│ Body:                                                                        │
│ {                                                                            │
│   "id": "cmlseqqdx00009t186flyd6oq",                                       │
│   "name": "Admin User",                                                     │
│   "email": "admin@arkan.dev",                                              │
│   "role": "ADMIN",                                                          │
│   "credits": 10000,                                                         │
│   ...                                                                        │
│ }                                                                            │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 14. API SERVICE PARSES RESPONSE                                             │
│ ├─ contentType = response.headers.get('content-type')                      │
│ ├─ if (contentType?.includes('application/json'))                          │
│ │    return response.json()                                                │
│ └─ [DEBUG LOG] [apiService] Response data: {...}                           │
│ ↓                                                                             │
│ Parsed JSON Object (UserProfile type)                                       │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 15. REACT QUERY QueryFn PROCESSES RESPONSE                                  │
│ userProfileData = await fetchUserProfileApi(userId, token)                 │
│ ├─ [DEBUG LOG] fetchUserProfileApi response: {...}                         │
│ ├─ Map userProfileData to User model fields                                │
│ │  {                                                                        │
│ │    id, name, email,                                                      │
│ │    role: 'admin' | 'user' (mapped from Prisma enum),                   │
│ │    credits,                                                              │
│ │    createdAt, updatedAt, hasCompletedOnboarding                         │
│ │  }                                                                        │
│ ├─ userInstance = new User(mappedData)                                      │
│ ├─ setUserProfile(userInstance)  [update Zustand store]                   │
│ └─ return userInstance                                                      │
│ ↓                                                                             │
│ User Instance (fully populated)                                            │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 16. REACT QUERY STORES RESULT                                               │
│ useQuery returns:                                                            │
│ {                                                                            │
│   data: User instance,                                                      │
│   isLoading: false,                                                         │
│   isError: false,                                                           │
│   error: null,                                                              │
│   status: 'success'                                                         │
│ }                                                                            │
│ ↓                                                                             │
│ const { data: userProfile } = useQuery(...)                                │
│ userProfile = User instance                                                │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 17. UPDATE ZUSTAND BUILDER STORE                                            │
│ useEffect(() => {                                                           │
│   setUserProfile(userProfile ?? null)                                       │
│ }, [userProfile, setUserProfile])                                           │
│ ↓                                                                             │
│ Builder Store Updated with User Instance                                    │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 18. AUTH CONTEXT PROVIDES VALUE                                             │
│ <AuthContext.Provider value={{                                              │
│   userProfile: User instance,                                              │
│   isLoading: false,                                                         │
│   refetchUser: () => {...}                                                 │
│ }}>                                                                         │
│   {children}                                                                │
│ </AuthContext.Provider>                                                    │
│ ↓                                                                             │
│ AuthContext Ready for Consumption                                           │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 19. COMPONENTS USE AUTH CONTEXT                                             │
│ const { userProfile, isLoading } = useAuth()                                │
│ ↓                                                                             │
│ Access user data:                                                           │
│   userProfile.id         = "cmlseqqdx00009t186flyd6oq"                    │
│   userProfile.name       = "Admin User"                                    │
│   userProfile.email      = "admin@arkan.dev"                              │
│   userProfile.role       = "admin"                                         │
│   userProfile.credits    = 10000                                           │
│   isLoading              = false                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Type Transformations Summary

| Step | Location | Input Type | Output Type | Function |
|------|----------|-----------|-------------|----------|
| 1 | Login Form | `{ email, password }` | `SignInResponse` | `signIn()` |
| 2 | NextAuth Provider | `credentials` | `User (Prisma)` | `authorize()` |
| 3 | JWT Callback | `{ token, user }` | `JWT` | `jwt()` |
| 4 | Session Callback | `{ session, token }` | `Session` | `session()` |
| 5 | /api/auth/session | - | `JSON` | NextAuth endpoint |
| 6 | useSession() | - | `Session` | React hook |
| 7 | Extract ID | `session` | `string \| undefined` | Destructure |
| 8 | React Query | `enabled, queryFn` | Query State | `useQuery()` |
| 9 | Fetch API | `userId, token` | `UserProfile \| null` | `fetchUserProfileApi()` |
| 10 | API Service | `ApiServiceOptions` | `JSON` | `apiService()` |
| 11 | /api/users/[id] | HTTP Request | `UserProfile` | `GET handler` |
| 12 | Prisma Query | `id` | `User` | `findUnique()` |
| 13 | API Response | User data | JSON | `createApiResponse()` |
| 14 | Parse Response | `Response` | Parsed JSON | `response.json()` |
| 15 | Map & Store | JSON | `User instance` | QueryFn |
| 16 | React Query | Query result | Query state | `useQuery()` |
| 17 | Update Store | User instance | Zustand state | `setUserProfile()` |
| 18 | Context Provider | State | Context value | `<Provider>` |
| 19 | Components | Context | Data access | `useAuth()` |

---

## Critical Data Type Points to Check

### ✅ Type Must Match at Each Boundary

1. **Session → userId**
   - Source: `session.user.id` (string)
   - Type: `string | undefined`
   - ✅ Correct

2. **userId → Query Key**
   - Source: `userKeys.profile(userId)`
   - Result: `['users', 'detail', userId]`
   - ✅ Correct format

3. **Query Enabled Condition**
   - Check: `!!userId && !!session`
   - Type: `boolean`
   - ✅ Must be `true` to execute

4. **Token Extraction**
   - Source: `session.user.id` (reused as token)
   - Type: `string`
   - ⚠️ Note: Using user ID as token for authorization

5. **API Authorization Header**
   - Format: `Authorization: Bearer {token}`
   - Type: `string`
   - ✅ Standard format

6. **UserProfile Type**
   - Returned from API
   - Must NOT include `passwordHash` field
   - ✅ Verified in Prisma select

7. **User Model Mapping**
   - Prisma enum: `'USER' | 'ADMIN' | 'SUPER_ADMIN'`
   - Model type: `'admin' | 'user'`
   - Mapping: `role === 'ADMIN' || role === 'SUPER_ADMIN' ? 'admin' : 'user'`
   - ✅ Correct conversion

8. **Query Result Type**
   - Expected: `User | null`
   - Stored in: `data: userProfile`
   - ✅ Correct

---

## Potential Breaking Points

### 🔴 If userId is undefined
- React Query won't execute (enabled = false)
- No API call made
- userProfile stays null

### 🔴 If session is undefined
- React Query won't execute (enabled = false)
- No API call made
- userProfile stays null

### 🔴 If API returns 403
- Authorization check failed
- apiService throws error
- Query error state set

### 🔴 If API returns 404
- User not found in database
- handleApiError returns 404
- Query error state set

### 🔴 If content-type is not application/json
- apiService returns `{}`
- QueryFn tries to map empty object
- Mapping may produce invalid User instance

### 🔴 If User model constructor fails
- Invalid mapped data
- User instance creation throws
- Query error state set

### 🔴 If password field included in response
- Security vulnerability
- But User model mapping doesn't include it, so safe

---

## Debug Checklist

When debugging, verify in this order:

- [ ] **Session exists** → Check browser Network tab → `/api/auth/session`
- [ ] **userId extracted** → Console: `console.log(userId)` in NextAuthContext
- [ ] **Query enabled** → Console: `console.log('enabled:', !!userId && !!session)`
- [ ] **API called** → Browser Network tab → `/api/users/{id}`
- [ ] **API returns 200** → Network tab status code
- [ ] **Response is JSON** → Network tab → Preview tab
- [ ] **QueryFn executes** → Console: `fetchUserProfileApi response:` log
- [ ] **User mapped correctly** → Console log before `new User()`
- [ ] **Context has data** → Open DevTools → Components tab → `<NextAuthProvider>`
- [ ] **Components receive data** → `useAuth()` hook returns userProfile

