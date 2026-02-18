# Debugging Guide: User Profile Data Flow

## Problem Statement
When logging in with `admin@arkan.dev` / `admin123`:
- ✅ Session returns user data correctly
- ❓ React Query user profile query may not be fetching or returning data

## Data Flow Overview

```
Login → NextAuth Session → React Query useQuery → apiService → /api/users/{id} → Prisma → Database
```

## Step-by-Step Debugging

### 1. Browser Console Logs (F12)
After logging in, check for these logs:

```
[apiService] GET /api/users/cmlseqqdx00009t186flyd6oq - contentType: application/json
[apiService] Response data: { id: '...', name: 'Admin User', email: 'admin@arkan.dev', ... }
fetchUserProfileApi response: { id: '...', name: 'Admin User', ... }
```

**If you see these logs** → Data is being fetched correctly
**If you DON'T see these logs** → Query is not executing (check enabled condition)

### 2. VS Code Debugger - Break on Session Load

In `.vscode/launch.json`, use the `Debug with Breakpoints` configuration:

1. Press `F5` to start debugging
2. In `src/context/NextAuthContext.tsx` line 26, click to set a breakpoint on the `useQuery` hook
3. Reload the page at `http://localhost:3000`
4. When breakpoint hits:
   - Inspect `session` variable - should have user data
   - Inspect `userId` variable - should be `cmlseqqdx00009t186flyd6oq`
   - Note the timestamp when this breakpoint hits

### 3. Debug the API Call

Set breakpoint in `src/services/api/apiService.ts` line 67:

```typescript
const response = await fetch(endpoint, config);
```

When it hits:
- **endpoint** should be: `/api/users/cmlseqqdx00009t186flyd6oq`
- **config.headers** should include: `Authorization: Bearer cmlseqqdx00009t186flyd6oq`
- **config.method** should be: `GET`

### 4. Debug the API Endpoint

Set breakpoint in `src/app/api/users/[id]/route.ts` line 9:

```typescript
const { id: targetUserId } = await params;
```

When it hits:
- **targetUserId** should be: `cmlseqqdx00009t186flyd6oq`
- **requester** should have user info (from withAuth middleware)

Then step through to line 16:
```typescript
const user = await getUserProfile(targetUserId);
```

- **user** should have the full profile data from database

### 5. Debug the Database Query

In `src/services/userService.ts`, set breakpoint at line 13:

```typescript
const user = await prisma.user.findUnique({
```

When it hits:
- **id** parameter should be: `cmlseqqdx00009t186flyd6oq`

Step over to line 37 where it returns:
- **user** should have full profile data

## Common Issues & Solutions

### Issue 1: Query Not Executing
**Symptom:** No `[apiService]` logs in console

**Cause:** `enabled: !!userId && !!session` is false
- Check if session is loading correctly
- Verify userId is being extracted from session

**Fix:** Add debug logs in NextAuthContext:
```typescript
console.log('userId:', userId, 'session:', !!session, 'enabled:', !!userId && !!session);
```

### Issue 2: API Returns 403 Forbidden
**Symptom:** Error thrown in apiService

**Cause:** withAuth middleware authorization check failing
- User role is not ADMIN
- User is trying to access another user's profile

**Fix:** Verify in the API endpoint line 12:
```typescript
if (requester.role !== 'ADMIN' && requester.role !== 'SUPER_ADMIN' && requester.id !== targetUserId) {
    return handleApiError({ message: "Forbidden" }, 403);
}
```

### Issue 3: API Returns 404 User Not Found
**Symptom:** `handleApiError({ message: "User not found." }, 404)`

**Cause:** Prisma query returned null
- User doesn't exist in database
- userId is malformed

**Fix:** Verify user exists in database:
```bash
docker exec arkan-postgres psql -U user -d arkan_db -c "SELECT id, email, name FROM public.users WHERE id = 'cmlseqqdx00009t186flyd6oq';"
```

### Issue 4: Data is Null in React Component
**Symptom:** `userProfile` is always null in NextAuthProvider

**Cause:** Response is being parsed but mapping to User model fails

**Fix:** Check the mapping logic in NextAuthContext lines 38-54:
- Verify fields are being mapped correctly
- Check if `new User()` constructor expects different field names

## Debugging Commands

### Check if User Exists in Database
```bash
docker exec arkan-postgres psql -U user -d arkan_db -c \
  "SELECT id, name, email, role, credits FROM public.users WHERE id = 'cmlseqqdx00009t186flyd6oq';"
```

### Check Prisma Query Logs
Enable Prisma debug mode:
```bash
DEBUG=prisma:* npm run dev
```

### Test API Endpoint Directly
```bash
curl -H "Authorization: Bearer cmlseqqdx00009t186flyd6oq" \
  http://localhost:3000/api/users/cmlseqqdx00009t186flyd6oq
```

## Quick Checklist

- [ ] Session returns user data (check in browser Network tab → /api/auth/session)
- [ ] userId is extracted correctly from session
- [ ] React Query `enabled` condition is true
- [ ] API call is made (check Network tab → /api/users/{id})
- [ ] API returns 200 status code
- [ ] Response has `application/json` content-type
- [ ] Response body has user data
- [ ] Prisma query returns user from database
- [ ] User model mapping is correct
- [ ] userProfile is set in React component state

## Testing with Next.js DevTools

1. Open browser DevTools (F12)
2. Go to Application → Cookies → Check for `next-auth.session-token`
3. Go to Network → XHR/Fetch → Check for:
   - `/api/auth/session` (should return user data)
   - `/api/users/{id}` (should return profile)

## Additional Resources

- [NextAuth.js Debugging](https://next-auth.js.org/faq#how-can-i-debug-nextauth-js)
- [React Query DevTools](https://tanstack.com/query/latest/docs/devtools)
- [Prisma Debugging](https://www.prisma.io/docs/orm/reference/error-reference)
