# 🧪 Manual Authentication Testing Guide

## ✅ Pre-Flight Checks Complete!

All systems are ready for manual browser testing.

---

## 📋 Test Summary

**Database Status**: ✅ Connected  
**Users Available**: 2 users  
**Admin Account**: ✅ Ready  
**Server Status**: ✅ Running on port 9002  
**Environment**: ✅ All variables set  

---

## 🎯 Test Plan

### **Test 1: Admin Login (Existing User)**
### **Test 2: New User Signup**
### **Test 3: Session Persistence**
### **Test 4: Protected Routes**
### **Test 5: Logout Flow**

---

## 🔐 Test 1: Admin Login (Existing User)

### **Objective**: Verify existing users can log in with PostgreSQL authentication

### **Steps**:

1. **Open Browser**
   - Navigate to: http://localhost:9002/login
   - ✅ You should see the login form

2. **Enter Credentials**
   - Email: `admin@arkan.dev`
   - Password: `admin123`
   - ✅ Form should accept the input

3. **Click "Login" Button**
   - ✅ Button should show loading spinner
   - ✅ Should redirect to `/builder` within 2 seconds

4. **Verify Success**
   - ✅ URL should be: `http://localhost:9002/builder`
   - ✅ User name "Admin User" should appear in header
   - ✅ No error messages displayed

### **Expected Database Changes**:
```sql
-- Run this in PostgreSQL to verify:
SELECT * FROM sessions ORDER BY "createdAt" DESC LIMIT 1;
-- Should show a new session for admin@arkan.dev
```

### **Expected Browser State**:
- Open DevTools → Application → Cookies
- ✅ Should see cookie: `next-auth.session-token`
- ✅ Cookie should be httpOnly and secure

### **Troubleshooting**:
- ❌ If login fails with "Invalid credentials":
  - Check password is exactly `admin123` (case-sensitive)
  - Run: `npm run test:auth-manual` to verify admin user setup
  
- ❌ If redirects to login again:
  - Check browser console for errors
  - Verify cookies are enabled
  - Check NEXTAUTH_URL in .env.local

---

## 👤 Test 2: New User Signup

### **Objective**: Verify new users can create accounts

### **Steps**:

1. **Navigate to Signup**
   - URL: http://localhost:9002/signup
   - ✅ You should see the signup form

2. **Fill Out Form**
   - Name: `Manual Test User`
   - Email: `manualtest@example.com`
   - Password: `TestPassword123!`
   - ✅ All fields should accept input

3. **Click "Sign up" Button**
   - ✅ Button should show loading spinner
   - ✅ Should auto-login and redirect to `/builder`

4. **Verify Success**
   - ✅ URL should be: `http://localhost:9002/builder`
   - ✅ User name "Manual Test User" in header
   - ✅ Toast notification: "Account Created"

### **Expected Database Changes**:
```sql
-- Verify new user was created:
SELECT id, email, name, role, credits, "passwordHash" 
FROM users 
WHERE email = 'manualtest@example.com';

-- Should return:
-- - id: (cuid)
-- - email: manualtest@example.com
-- - name: Manual Test User
-- - role: USER
-- - credits: 100
-- - passwordHash: $2b$10...
```

### **Expected Behavior**:
- ✅ Password should be hashed (starts with `$2b$10`)
- ✅ User should have 100 default credits
- ✅ Role should be 'USER'
- ✅ Session created automatically

### **Troubleshooting**:
- ❌ If "Email already in use" error:
  - Use a different email address
  - Or delete the user and try again

- ❌ If signup succeeds but login fails:
  - Check browser console for errors
  - Verify API endpoint `/api/auth/signup` returned 201

---

## 🔄 Test 3: Session Persistence

### **Objective**: Verify session persists across page refreshes

### **Steps**:

1. **Ensure You're Logged In**
   - Complete Test 1 or Test 2 first
   - ✅ User name should be in header

2. **Refresh the Page**
   - Press F5 or Cmd+R
   - ✅ Page should reload
   - ✅ User should remain logged in
   - ✅ User name still in header

3. **Navigate to Different Pages**
   - Go to: http://localhost:9002/dashboard
   - Go to: http://localhost:9002/builder
   - Go to: http://localhost:9002/profile
   - ✅ Should stay logged in on all pages

4. **Close and Reopen Browser Tab**
   - Close the tab completely
   - Open new tab and visit: http://localhost:9002
   - ✅ Should automatically redirect to `/builder` (logged in)

### **Expected Behavior**:
- ✅ Session cookie persists for 30 days
- ✅ JWT token remains valid
- ✅ User doesn't need to re-login

### **Verify in DevTools**:
```javascript
// Open Console and run:
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log);

// Should return:
// {
//   user: {
//     id: "...",
//     email: "admin@arkan.dev",
//     name: "Admin User",
//     role: "ADMIN",
//     credits: 10000
//   },
//   expires: "2026-03-19T..."
// }
```

---

## 🔒 Test 4: Protected Routes

### **Objective**: Verify protected routes require authentication

### **Steps**:

1. **Logout First** (if logged in)
   - Click user menu → Logout
   - Or clear cookies manually

2. **Try Accessing Protected Route**
   - Navigate to: http://localhost:9002/builder
   - ✅ Should redirect to `/login`
   - ✅ URL becomes: `http://localhost:9002/login`

3. **Login**
   - Use admin credentials
   - ✅ Should redirect back to `/builder` after login

4. **Verify Protection**
   - Logout again
   - Try accessing: http://localhost:9002/dashboard
   - ✅ Should redirect to `/login`

### **Expected Behavior**:
- ✅ Protected routes redirect unauthenticated users
- ✅ After login, user goes to intended page
- ✅ Public routes (/, /login, /signup) accessible without auth

---

## 🚪 Test 5: Logout Flow

### **Objective**: Verify users can logout successfully

### **Steps**:

1. **Ensure You're Logged In**
   - Complete Test 1 first

2. **Click Logout**
   - Find user menu in header
   - Click "Logout" option
   - ✅ Should redirect to `/login` or `/`

3. **Verify Logout**
   - ✅ User name should disappear from header
   - ✅ Session cookie should be cleared
   - ✅ Cannot access `/builder` anymore

4. **Check Cookie**
   - DevTools → Application → Cookies
   - ✅ `next-auth.session-token` should be deleted

5. **Verify Database**
```sql
-- Check session was destroyed:
SELECT * FROM sessions WHERE "userId" = 'admin-user-id';
-- Should return no rows (or expired session)
```

---

## 📊 Test Results Template

Copy this template to document your test results:

```markdown
## Test Results - [Date]

### Test 1: Admin Login
- [ ] Login form loads
- [ ] Credentials accepted
- [ ] Redirects to /builder
- [ ] Session cookie created
- [ ] User name in header
- **Status**: ✅ PASS / ❌ FAIL
- **Notes**: 

### Test 2: New User Signup
- [ ] Signup form loads
- [ ] New user created in database
- [ ] Password hashed correctly
- [ ] Auto-login successful
- [ ] Default credits assigned
- **Status**: ✅ PASS / ❌ FAIL
- **Notes**:

### Test 3: Session Persistence
- [ ] Session survives page refresh
- [ ] Session survives tab close/reopen
- [ ] API returns valid session
- **Status**: ✅ PASS / ❌ FAIL
- **Notes**:

### Test 4: Protected Routes
- [ ] Unauthenticated redirects to /login
- [ ] Post-login redirects to intended page
- [ ] Public routes accessible
- **Status**: ✅ PASS / ❌ FAIL
- **Notes**:

### Test 5: Logout Flow
- [ ] Logout successful
- [ ] Cookie cleared
- [ ] Cannot access protected routes
- [ ] Database session removed
- **Status**: ✅ PASS / ❌ FAIL
- **Notes**:

## Overall Result
- **Total Tests**: 5
- **Passed**: _/5
- **Failed**: _/5
- **Authentication System**: ✅ READY FOR PRODUCTION / ⚠️ NEEDS FIXES
```

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid credentials" on login
**Cause**: Password doesn't match hash in database  
**Solution**: 
```bash
# Reset admin password:
DATABASE_URL="postgresql://arkan_user:arkan_dev_password@localhost:5432/arkan_dev" \
npx tsx scripts/create-admin-user.ts
```

### Issue: Redirect loop after login
**Cause**: Session not being created  
**Solution**: Check browser console for errors, verify NEXTAUTH_SECRET is set

### Issue: Cookie not being set
**Cause**: HTTPS/HTTP mismatch or cookie settings  
**Solution**: 
- Ensure NEXTAUTH_URL matches your current URL
- Check cookies are enabled in browser
- For localhost, HTTP is fine

### Issue: Session expires immediately
**Cause**: JWT secret mismatch  
**Solution**: Verify NEXTAUTH_SECRET is consistent across restarts

---

## ✅ Success Criteria

The authentication system is working correctly if:

- ✅ Users can login with email/password
- ✅ Sessions persist across page refreshes
- ✅ New users can signup successfully
- ✅ Protected routes redirect to login
- ✅ Logout clears session properly
- ✅ No console errors during any flow
- ✅ Database records match expected state

---

## 🎊 Next Steps After Testing

Once all tests pass:

1. ✅ **Document any issues found**
2. ✅ **Share test results with team**
3. ✅ **Proceed with data migration** (if needed)
4. ✅ **Plan production deployment**
5. ✅ **Remove Firebase dependencies** (optional)

---

**Happy Testing!** 🚀

If you encounter any issues during testing, refer to the troubleshooting section or check the main documentation at `docs/migration/AUTHENTICATION_MIGRATION_SUCCESS.md`.
