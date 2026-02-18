# Quick Debug Reference Card

## 🚀 Quick Start (30 seconds)

```bash
npm run dev                    # Start app
# Open browser: http://localhost:3000/login
# Press F12 to open DevTools Console
# Login: admin@arkan.dev / admin123
# Watch console for logs with [NextAuth] prefix
```

---

## 🎯 What to Look For (In Order)

| Step | Expected Log | Status |
|------|--------------|--------|
| 1 | `[NextAuth] authorize() called with email:` | 🟢 Should appear |
| 2 | `[NextAuth] User found:` | 🟢 Should appear |
| 3 | `[NextAuth] Password verified successfully` | 🟢 Should appear |
| 4 | `[NextAuth JWT] jwt() returning token:` | 🟢 Should appear |
| 5 | `[NextAuth Session] Session user object populated:` | 🟢 Should appear |
| 6 | `[NextAuthContext] Session data:` | 🟢 Should appear |
| 7 | `[NextAuthContext Query] queryFn executing` | 🟢 Should appear |
| 8 | `[apiService] Response received: { status: 200 }` | 🟢 Should appear |
| 9 | `[NextAuthContext Query] User instance created:` | 🟢 Should appear |
| 10 | `[NextAuthContext] Providing auth context: { hasUserProfile: true }` | 🟢 Should appear |

---

## ❌ Error Reference

### "No user found with email"
```
[NextAuth] No user found with email: admin@arkan.dev
```
**Fix:** Check if user exists in database
```bash
docker exec arkan-postgres psql -U user -d arkan_db \
  -c "SELECT * FROM users WHERE email='admin@arkan.dev';"
```

### "Invalid password"
```
[NextAuth] Invalid password for user: admin@arkan.dev
```
**Fix:** Check password is correct. Try resetting it:
```bash
# Run seed script to recreate user with password
npm run prisma:seed
```

### "No password hash"
```
[NextAuth] User has no password hash, OAuth required
```
**Fix:** User needs password. Add one via:
```bash
npm run seed  # Recreates admin user with password
```

### "Unauthorized: No session found"
```
[withAuth] Unauthorized: No session found
```
**Fix:** Session lost. Check:
- Browser cookies: DevTools → Application → Cookies
- NextAuth session-token exists
- Check browser console for auth errors

### "Response received: 403"
```
[apiService] Error response (403): Forbidden
```
**Fix:** Authorization failed. Check:
```
[withAuth] User profile retrieved: { hasUser: false }
```
User not found in database after login

### "Response received: 401"
```
[apiService] Error response (401): Unauthorized
```
**Fix:** Token invalid. Check:
```
[apiService] Authorization header set for token: ...
```
Token format should be: `Bearer {userId}`

---

## 🔍 Console Filter Tips

### Filter by authentication logs
```javascript
// In browser console, click filter box and type:
[NextAuth]
```

### Filter by API logs
```javascript
[apiService]
```

### Filter by context logs
```javascript
[NextAuthContext]
```

### Copy all logs to clipboard
```javascript
// Paste in console:
copy(console.log.toString())
```

---

## 📊 Data Flow at a Glance

```
LOGIN FORM
    ↓
[NextAuth] authorize() 
    ├─ Find user in DB
    ├─ Verify password
    └─ Return user object
    ↓
[NextAuth JWT] jwt()
    ├─ Get user from authorize callback
    ├─ Fetch role & credits from DB
    └─ Create JWT token
    ↓
[NextAuth Session] session()
    ├─ Populate session.user
    ├─ Add hasuraToken claims
    └─ Return session
    ↓
[NextAuth SignIn] signIn()
    └─ Update lastLoginAt timestamp
    ↓
REDIRECT TO /builder
    ↓
[NextAuthContext] useSession()
    └─ Get session from NextAuth
    ↓
[NextAuthContext Query] useQuery()
    ├─ Execute queryFn
    ├─ Call fetchUserProfileApi()
    ├─ API call to /api/users/{id}
    └─ Return user data
    ↓
[withAuth] middleware on server
    ├─ Get session
    ├─ Fetch user from DB
    ├─ Check authorization
    └─ Call handler
    ↓
[apiService] HTTP response
    ├─ Status 200 OK
    ├─ Parse JSON
    └─ Return data
    ↓
[NextAuthContext Query] Map data
    ├─ Transform to User model
    ├─ Create User instance
    └─ Update Zustand store
    ↓
[NextAuthContext] Provide context
    └─ userProfile available to components
```

---

## 🛠️ Quick Commands

### Clear all data and restart
```bash
npm run reset-agent-db
npm run seed
npm run dev
```

### Check user in database
```bash
docker exec arkan-postgres psql -U user -d arkan_db \
  -c "SELECT id, email, name, role, credits FROM users LIMIT 5;"
```

### Test API endpoint directly
```bash
# Get your user ID first, then:
curl -H "Authorization: Bearer YOUR_USER_ID" \
  http://localhost:3000/api/users/YOUR_USER_ID
```

### View Prisma debug logs
```bash
DEBUG=prisma:* npm run dev
```

### Kill process on port 3000
```bash
lsof -ti:3000 | xargs kill -9
```

---

## 📋 Browser DevTools Checklist

- [ ] Console tab open (F12)
- [ ] No JavaScript errors (red X at top)
- [ ] Logs appear in correct order
- [ ] Network tab shows /api/users request (200 OK)
- [ ] Application tab shows next-auth.session-token cookie
- [ ] React DevTools → Components → NextAuthProvider
  - [ ] userProfile prop not null
  - [ ] isLoading is false

---

## ✅ Success Indicators

```javascript
// In browser console, type:
// If useAuth() hook available:
// const { userProfile } = useAuth();
// userProfile should be an object with:
{
  id: "cmlseqqdx00009t186flyd6oq",
  name: "Admin User",
  email: "admin@arkan.dev",
  role: "admin",
  credits: 10000,
  createdAt: "...",
  updatedAt: "...",
  hasCompletedOnboarding: true
}
```

---

## 🔗 Full Documentation

- **CONSOLE_LOGS_TRACKING_GUIDE.md** - Complete log reference for all 19 steps
- **DATA_FLOW_TRACE.md** - Full data flow diagram with types
- **DEBUGGING_GUIDE.md** - VS Code debugger setup
- **DEBUGGING_SUMMARY.md** - Full implementation summary

---

## 💡 Pro Tips

1. **Use browser console filters**: Type `[NextAuth]` to see only auth logs
2. **Check timestamp order**: Logs should follow the flow exactly
3. **Screenshot errors**: Easy to share with team
4. **Network tab**: Verify actual HTTP requests/responses
5. **React DevTools**: Inspect component state directly
6. **Console.log from components**: Add `const { userProfile } = useAuth();` and check in console

---

## 🎯 Common Debugging Path

1. **Is user logged in?**
   - Look for `[NextAuth] User found:` log
   - If not: User doesn't exist in DB

2. **Is JWT created?**
   - Look for `[NextAuth JWT] jwt() returning token:` log
   - If not: Token creation failed

3. **Is session set?**
   - Look for `[NextAuth Session] Session user object populated:` log
   - If not: Session callback failed

4. **Is React Query executing?**
   - Look for `[NextAuthContext Query] queryFn executing` log
   - If not: enabled condition is false (userId or session missing)

5. **Is API call made?**
   - Look for `[apiService] Fetching from endpoint:` log
   - If not: queryFn not executing

6. **Is API response 200?**
   - Look for `[apiService] Response received: { status: 200 }` log
   - If 403/401/404: Check [withAuth] logs for authorization issues

7. **Is data mapped?**
   - Look for `[NextAuthContext Query] User instance created:` log
   - If not: Mapping or User model creation failed

8. **Is context provided?**
   - Look for `[NextAuthContext] Providing auth context: { hasUserProfile: true }` log
   - If false: userProfile is still null

---

## 📞 Need Help?

1. **Check the logs** - Tell us the last log you see
2. **Note the error** - Copy the red/orange log message
3. **Check the order** - Logs should follow the flow chart
4. **Reference guides** - Check CONSOLE_LOGS_TRACKING_GUIDE.md for expected output

---

**Last Updated:** February 18, 2026  
**Status:** Ready for Testing ✅
