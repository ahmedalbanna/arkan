# Environment Variables Fix - Summary

**Date:** January 24, 2026  
**Status:** ✅ FIXED  
**Issue:** Build failing due to missing environment variables

---

## Problem

When running `pnpm build`, the prebuild script was failing with:

```
❌ Missing required environment variables:
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NEXT_PUBLIC_FIREBASE_DATABASE_URL
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID
  - NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

Please set these variables in your .env.local file.
```

Even though the variables were set in `.env` and `.env.local` files.

---

## Root Causes

### Issue 1: Malformed Environment Variable
In both `.env` and `.env.local`, there was a space after the `=` sign:

**BEFORE (❌ Wrong):**
```env
NEXT_PUBLIC_FIREBASE_DATABASE_URL= https://docudec-default-rtdb.asia-southeast1.firebasedatabase.app
```

**AFTER (✅ Fixed):**
```env
NEXT_PUBLIC_FIREBASE_DATABASE_URL="https://docudec-default-rtdb.asia-southeast1.firebasedatabase.app"
```

The space caused the URL to not be parsed correctly.

### Issue 2: dotenv Not Loaded in Build Script
The prebuild script (`scripts/generate-firebase-sw.js`) was checking `process.env` directly, but Node.js doesn't automatically load `.env` files. The script needed to explicitly load them using `dotenv`.

**BEFORE (❌ Wrong):**
```javascript
const fs = require('fs');
const path = require('path');
// No dotenv loading
```

**AFTER (✅ Fixed):**
```javascript
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
```

---

## Changes Made

### 1. Fixed `.env` file
- ✅ Corrected `NEXT_PUBLIC_FIREBASE_DATABASE_URL` with proper quoting and no space

### 2. Fixed `.env.local` file
- ✅ Corrected `NEXT_PUBLIC_FIREBASE_DATABASE_URL` with proper quoting and no space

### 3. Updated `scripts/generate-firebase-sw.js`
- ✅ Added `require('dotenv').config()` to load environment variables
- ✅ Loads `.env.local` first (higher priority)
- ✅ Falls back to `.env`

---

## Verification

✅ Build script now successfully:
1. Loads environment variables from `.env` and `.env.local`
2. Validates all required Firebase configuration variables
3. Generates `public/firebase-messaging-sw.js` with correct config
4. Completes without errors

**Generated file:** `public/firebase-messaging-sw.js` ✅
- Contains all Firebase configuration
- All API keys properly injected
- Ready for production use

---

## Environment Variable Format Rules

For Next.js projects, follow these rules:

1. **No spaces around `=`:**
   ```env
   ✅ CORRECT: KEY=value
   ❌ WRONG:   KEY= value
   ❌ WRONG:   KEY =value
   ```

2. **Quote values with special characters (URLs, etc.):**
   ```env
   ✅ CORRECT: DATABASE_URL="https://example.com/db"
   ❌ RISKY:   DATABASE_URL=https://example.com/db
   ```

3. **Public variables need `NEXT_PUBLIC_` prefix:**
   ```env
   ✅ Client-side: NEXT_PUBLIC_API_KEY=xyz
   ❌ Wrong:       API_KEY=xyz (won't be accessible in browser)
   ```

4. **Server-only variables don't use prefix:**
   ```env
   ✅ Server-side: SECRET_KEY=xyz
   ✅ Server-side: FIREBASE_ADMIN_PRIVATE_KEY="..."
   ```

---

## Files Modified

1. `.env` - Fixed `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
2. `.env.local` - Fixed `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
3. `scripts/generate-firebase-sw.js` - Added dotenv loading

---

## How It Works Now

```
pnpm build
  ↓
prebuild script runs: scripts/generate-firebase-sw.js
  ↓
dotenv loads .env.local and .env files
  ↓
Environment variables are now available in process.env
  ↓
Firebase config is validated
  ↓
public/firebase-messaging-sw.js is generated
  ↓
Build continues successfully
```

---

## Testing

To verify everything is working:

```bash
# Run the build
pnpm build

# Check if firebase-messaging-sw.js was created
ls -la public/firebase-messaging-sw.js

# Verify it has the correct content
cat public/firebase-messaging-sw.js
```

---

## What NOT to Do

❌ **Don't commit `.env` or `.env.local`** to git
- These contain sensitive credentials
- Use `.env.example` and `.env.local.example` instead

❌ **Don't modify `.env.example`** with real credentials
- It's a template file for developers

❌ **Don't use spaces** around `=` in environment variables
- Causes parsing issues

❌ **Don't forget quotes** for URLs and complex values
- Can cause parsing errors

---

## Next Steps

1. ✅ Build script now works correctly
2. ✅ Environment variables are properly loaded
3. ⏳ Your application should now build successfully
4. ⏳ Run `pnpm build` to generate production build
5. ⏳ Run `pnpm dev` to test in development

---

## Additional Resources

- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables
- dotenv Documentation: https://github.com/motdotla/dotenv
- Firebase Configuration: https://firebase.google.com/docs/web/setup

---

**Status:** ✅ Fixed and Verified  
**Build Script Output:** `public/firebase-messaging-sw.js` generated successfully
