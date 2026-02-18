# Authentication Debugging Summary

## What Was Done

I've added comprehensive console logging throughout your entire authentication flow to help you track user data from login to profile loading. This makes it easy to identify exactly where any issues occur.

---

## 📁 Files Modified

### 1. **NextAuth Configuration** 
`src/app/api/auth/[...nextauth]/route.ts`
- Added logging to `authorize()` callback - tracks credentials verification
- Added logging to `jwt()` callback - tracks token creation and claims
- Added logging to `session()` callback - tracks session object creation
- Added logging to `signIn()` callback - tracks last login update

### 2. **Authentication Context**
`src/context/NextAuthContext.tsx`
- Added logging to session retrieval with `useSession()`
- Added logging to React Query `useQuery` hook execution
- Added logging to user data mapping and User model instantiation
- Added logging to useEffect hooks for store updates
- Added logging to context provider value

### 3. **API Service Layer**
`src/services/api/apiService.ts`
- Added logging to request preparation (method, endpoint, headers)
- Added logging to fetch execution
- Added logging to response status and content-type
- Added logging to response data parsing

### 4. **User Service**
`src/services/api/userService.ts`
- Added logging to `fetchUserProfileApi()` function
- Added logging to API result inspection

### 5. **Authentication Middleware**
`src/lib/utils/api-utils.ts` 
- Added logging to withAuth middleware request handling
- Added logging to session retrieval on server
- Added logging to user profile fetch from database
- Added logging to authorization checks
- Added logging to handler execution

---

## 🎯 How to Use

### Step 1: Start Your App
```bash
npm run dev
```

### Step 2: Open Browser DevTools
Press **F12** to open DevTools, then go to **Console** tab

### Step 3: Login
Go to `http://localhost:3000/login` and sign in with:
- Email: `admin@arkan.dev`
- Password: `admin123`

### Step 4: Watch the Logs
In the Console, you'll see logs with these prefixes:
- `[NextAuth]` - NextAuth callbacks
- `[NextAuth JWT]` - JWT token creation
- `[NextAuth Session]` - Session data setup
- `[NextAuth SignIn]` - Sign in callback
- `[NextAuthContext]` - Client-side context
- `[NextAuthContext Query]` - React Query execution
- `[userService]` - User profile API call
- `[apiService]` - HTTP request/response
- `[withAuth]` - Server-side authorization

### Step 5: Follow the Data Flow
Each log is numbered step by step, showing exactly how user data transforms through the system.

---

## 📊 Key Logs to Watch For

### Success Path:
```
✅ [NextAuth] User found
✅ [NextAuth] Password verified successfully  
✅ [NextAuth JWT] jwt() returning token
✅ [NextAuth Session] Session user object populated
✅ [withAuth] Authorization passed, calling handler
✅ [apiService] Response received: 200 OK
✅ [NextAuthContext Query] User instance created
✅ [NextAuthContext] Providing auth context with userProfile
```

### If You See These - There's an Issue:
```
❌ [NextAuth] No user found with email → User doesn't exist in DB
❌ [NextAuth] Invalid password → Wrong password
❌ [withAuth] Unauthorized: No session found → Session lost
❌ [apiService] Response received: 403 → Authorization failed
❌ [apiService] Response received: 404 → User not found
❌ [NextAuthContext Query] No user profile data returned → API returned null
```

---

## 🔍 Debugging Guide References

### Full Documentation:
1. **CONSOLE_LOGS_TRACKING_GUIDE.md** - Complete log output reference for each step
2. **DATA_FLOW_TRACE.md** - Data type transformations and architecture overview
3. **DEBUGGING_GUIDE.md** - Step-by-step debugging instructions

### Quick Reference:
- Look at **Console** tab in browser DevTools (F12)
- Filter by `[NextAuth]` or `[apiService]` to focus on specific areas
- Check **Network** tab to see actual HTTP requests
- Use **React DevTools** to inspect component state

---

## 🚀 Expected Behavior After Login

1. **Immediate** (within 1-2 seconds):
   - See `[NextAuth] authorize() called` logs
   - User verified in database
   - JWT created with user data

2. **Page Redirect** (automatic):
   - Logged in user redirected to `/builder`
   - Session established

3. **Page Load** (1-3 seconds):
   - See `[NextAuthContext]` logs
   - See `useQuery` start executing
   - See API call to `/api/users/{id}`
   - See user profile data loaded

4. **Final State**:
   - `[NextAuthContext] Providing auth context with userProfile: true`
   - User data available to components via `useAuth()` hook

---

## 💻 Testing Checklist

- [ ] Clear browser cache/cookies
- [ ] Open DevTools Console (F12)
- [ ] Navigate to `/login`
- [ ] Enter: `admin@arkan.dev` / `admin123`
- [ ] Click Sign In
- [ ] Watch logs appear
- [ ] Check for errors
- [ ] Verify redirect to `/builder`
- [ ] Check final `userProfile` data
- [ ] Open React DevTools → Components → NextAuthProvider
- [ ] Inspect `userProfile` prop value

---

## 🔧 Common Debugging Tasks

### Task 1: Verify User Exists in Database
```bash
docker exec arkan-postgres psql -U user -d arkan_db \
  -c "SELECT id, email, name, role, credits FROM public.users WHERE email='admin@arkan.dev';"
```

### Task 2: Check Password Hash Exists
```bash
docker exec arkan-postgres psql -U user -d arkan_db \
  -c "SELECT email, password_hash IS NOT NULL as has_password FROM public.users WHERE email='admin@arkan.dev';"
```

### Task 3: Test API Endpoint Directly
```bash
curl -H "Authorization: Bearer cmlseqqdx00009t186flyd6oq" \
  http://localhost:3000/api/users/cmlseqqdx00009t186flyd6oq
```

### Task 4: Monitor Prisma Queries
```bash
DEBUG=prisma:* npm run dev
```

---

## 📈 Performance Notes

The logging is comprehensive but shouldn't impact performance significantly. In production, you can:

1. Remove console.log statements (recommended)
2. Keep them with a `DEBUG` environment variable guard:
   ```typescript
   if (process.env.DEBUG === 'true') {
     console.log('[NextAuth] User found:', user);
   }
   ```

---

## 🎓 What You Can Learn

This logging setup demonstrates:

1. **Authentication Flow**: How NextAuth handles credentials → JWT → Session
2. **Data Transformation**: How user data transforms at each boundary
3. **API Architecture**: How client talks to server with authentication
4. **Error Handling**: Where things can fail and why
5. **State Management**: How React Query manages async data
6. **Security**: How passwords, tokens, and sessions work

---

## ❓ FAQ

**Q: Why is userProfile null?**
A: Check the logs in order. If API call succeeded (200 OK) but data is null, the issue is in the mapping or database query.

**Q: Why don't I see [NextAuthContext Query] logs?**
A: The queryFn might not be executing. Check if `enabled` condition is true (userId and session both exist).

**Q: Why is the API returning 403?**
A: Check `[withAuth]` logs. User role check failed or user not found in database.

**Q: How do I disable logs in production?**
A: Search for all `console.log` statements and either remove them or wrap in `if (process.env.NODE_ENV === 'development')`.

**Q: Can I share these logs with the team?**
A: Yes! Screenshot the console output or use browser's "Save as..." to export the logs.

---

## 🎯 Next Steps

1. **Run the app**: `npm run dev`
2. **Open DevTools**: Press F12
3. **Login**: Use admin@arkan.dev / admin123
4. **Watch logs**: Follow the flow in the Console tab
5. **Check for errors**: Look for red/orange logs
6. **Document findings**: Note where data breaks or transforms unexpectedly
7. **Reference guides**: Use CONSOLE_LOGS_TRACKING_GUIDE.md to verify expected output

---

## 📞 Support

If you find issues:

1. **Screenshot the console logs** - shows exactly where the problem is
2. **Note the last successful log** - helps narrow down the issue
3. **Check error messages** - they often tell you exactly what went wrong
4. **Cross-reference with guides** - CONSOLE_LOGS_TRACKING_GUIDE.md shows expected output

---

**Created:** February 18, 2026
**Last Updated:** February 18, 2026
**Status:** Ready for testing ✅
