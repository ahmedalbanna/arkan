# Security: Environment Variable Setup Guide

**Status:** 🔴 CRITICAL - Complete before deployment  
**Last Updated:** January 24, 2026

## Overview

This guide walks through setting up environment variables to replace hardcoded credentials. All sensitive values (Firebase keys, private keys, API endpoints) must be stored in `.env.local` and never committed to the repository.

## Critical Security Issues Fixed

✅ **Removed hardcoded Firebase API keys**
- Before: Exposed in `src/lib/config.ts`
- After: Loaded from `NEXT_PUBLIC_FIREBASE_*` environment variables

✅ **Removed hardcoded Firebase private key**
- Before: Full private key in source code
- After: Loaded from `FIREBASE_PRIVATE_KEY` environment variable

✅ **Removed service account JSON file**
- Before: `docudec-firebase-adminsdk-2maa7-d07a19d3fc.json` in repository
- After: Never stored in repo, only in `.env.local`

✅ **Removed hardcoded Ollama server URL**
- Before: Hardcoded IP address `http://185.190.140.93:11434`
- After: Loaded from `NEXT_PUBLIC_OLLAMA_SERVER_ADDRESS` environment variable

✅ **Removed hardcoded external API endpoint**
- Before: Hardcoded IP address `http://185.190.140.93:9003/api/convert`
- After: Loaded from `NEXT_PUBLIC_IMAGE_CONVERSION_API_ENDPOINT` environment variable

## Setup Instructions

### Step 1: Create `.env.local` File

Copy the template and create your local configuration:

```bash
cp .env.example .env.local
```

### Step 2: Obtain Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (docudec)
3. Click **Project Settings** (gear icon)
4. Go to the **General** tab
5. Copy your **Firebase SDK config** and fill in these variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=docudec.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://docudec-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=docudec
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=docudec.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=201859762958
NEXT_PUBLIC_FIREBASE_APP_ID=1:201859762958:web:602e322feffdcb11ed255f
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-K42VXYX7NQ
```

### Step 3: Obtain Firebase Admin Credentials

**⚠️ CRITICAL: These are extremely sensitive - treat like passwords**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Project Settings** > **Service Accounts** tab
4. Click **Generate New Private Key**
5. A JSON file downloads - open it and extract these values:

```
FIREBASE_PROJECT_ID=docudec
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-2maa7@docudec.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important:** The private key should be on a single line with literal `\n` for newlines:
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkq...\n-----END PRIVATE KEY-----\n"
```

### Step 4: Configure Ollama Server Address

Set the address where your Ollama server is running:

```
NEXT_PUBLIC_OLLAMA_SERVER_ADDRESS=http://localhost:11434
```

Or for production:
```
NEXT_PUBLIC_OLLAMA_SERVER_ADDRESS=http://your-ollama-server:11434
```

### Step 5: Configure External Services

```
NEXT_PUBLIC_IMAGE_CONVERSION_API_ENDPOINT=http://localhost:9003/api/convert
```

### Step 6: Verify Configuration

Run the development server to verify all variables are loaded:

```bash
npm run dev
```

Check console output for:
- ✅ `Firebase Admin SDK initialized using environment variables.`
- No errors about missing environment variables

## Verification Checklist

- [ ] `.env.local` file created and contains all required variables
- [ ] `.env.local` is in `.gitignore` (already configured)
- [ ] `npm run dev` starts without errors
- [ ] Firebase connection works (check browser console)
- [ ] Ollama server is accessible from configured address
- [ ] Image conversion service is accessible

## Environment Variables Reference

### Client-side (NEXT_PUBLIC_* - visible in browser)

These are safe to expose as they're used in the browser:

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `docudec.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Realtime DB URL | `https://docudec-default-rtdb...` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `docudec` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket | `docudec.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID | `201859762958` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | `1:201859762958:web:...` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | GA measurement ID | `G-K42VXYX7NQ` |
| `NEXT_PUBLIC_OLLAMA_SERVER_ADDRESS` | Ollama server URL | `http://localhost:11434` |
| `NEXT_PUBLIC_IMAGE_CONVERSION_API_ENDPOINT` | Image conversion API | `http://localhost:9003/api/convert` |

### Server-side (NO NEXT_PUBLIC prefix - server only)

These are SECRET and must never be exposed to the browser:

| Variable | Purpose | Security Level |
|----------|---------|-----------------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | 🔴 Critical |
| `FIREBASE_CLIENT_EMAIL` | Service account email | 🔴 Critical |
| `FIREBASE_PRIVATE_KEY` | Service account private key | 🔴 EXTREMELY SECRET |

## Build Process

The Firebase Service Worker configuration is now **auto-generated** from environment variables:

1. Before build: `scripts/generate-firebase-sw.js` validates all variables
2. Generates: `public/firebase-messaging-sw.js`
3. This file is in `.gitignore` - never committed

### Manual Generation

To regenerate the service worker configuration:

```bash
node scripts/generate-firebase-sw.js
```

## Files Modified

### Code Changes
- ✅ `src/lib/config.ts` - Now uses environment variables
- ✅ `src/ai/genkit.ts` - Ollama server from env variable
- ✅ `src/app/api/image-to-svg/route.ts` - API endpoint from env variable
- ✅ `src/app/api/svg-conversion/route.ts` - API endpoint from env variable
- ✅ `src/lib/firebase/server-init.ts` - Removed hardcoded file fallback

### Configuration Changes
- ✅ `.env.example` - Created template
- ✅ `.gitignore` - Enhanced to exclude `.env*` and secret files
- ✅ `package.json` - Added `prebuild` script to generate service worker
- ✅ `scripts/generate-firebase-sw.js` - New auto-generation script

## Deployment Considerations

### Local Development
```bash
# Copy template
cp .env.example .env.local

# Fill in values
nano .env.local

# Start development
npm run dev
```

### Staging/Production

**Option 1: GitHub Secrets (for GitHub Actions)**
1. Go to repository Settings > Secrets and variables > Actions
2. Add each environment variable as a secret
3. Update CI/CD workflow to set them

**Option 2: Platform Environment (Vercel, Railway, etc.)**
1. Go to project settings
2. Add each variable in the environment configuration
3. Variables marked with `NEXT_PUBLIC_` are available at build time

**Option 3: Docker**
```dockerfile
# .env.local is read by Next.js at build time
# For production, use Docker build args or environment variables
ENV NEXT_PUBLIC_FIREBASE_API_KEY=${FIREBASE_API_KEY}
```

## Troubleshooting

### Error: "Firebase Admin SDK initialization failed"

**Cause:** Missing `FIREBASE_*` environment variables

**Solution:**
1. Check `.env.local` has all three variables:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
2. Verify private key includes literal `\n` characters
3. Restart development server: `npm run dev`

### Error: "Ollama server unreachable"

**Cause:** `NEXT_PUBLIC_OLLAMA_SERVER_ADDRESS` points to wrong address

**Solution:**
1. Check Ollama is running: `curl http://localhost:11434/api/tags`
2. Update `.env.local` with correct address
3. Restart development server

### Error: "Image conversion service unreachable"

**Cause:** `NEXT_PUBLIC_IMAGE_CONVERSION_API_ENDPOINT` points to wrong address

**Solution:**
1. Verify service is running at configured address
2. Update `.env.local` with correct endpoint
3. Restart development server

### Firebase Service Worker not loading

**Cause:** `public/firebase-messaging-sw.js` not generated

**Solution:**
1. Run: `node scripts/generate-firebase-sw.js`
2. Check for error messages about missing variables
3. Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set

## Security Best Practices

✅ **DO:**
- Store all secrets in `.env.local`
- Add `.env.local` to `.gitignore` (already done)
- Rotate credentials regularly
- Use environment variables for all configuration
- Never commit `.env*` files
- Use different credentials for dev/staging/production

❌ **DON'T:**
- Hardcode secrets in source code
- Commit `.env.local` files
- Share `.env.local` files via email
- Use same credentials across environments
- Log environment variables
- Include secrets in error messages

## Credential Rotation

When credentials expire or are compromised:

1. **Generate new Firebase credentials:**
   - Firebase Console > Project Settings > Service Accounts > Generate New Private Key
   
2. **Update environment variables:**
   - Update `.env.local` with new values
   - Update CI/CD secrets if deployed

3. **Restart application:**
   - Stop and restart development: `npm run dev`
   - Redeploy production

4. **Revoke old credentials:**
   - Firebase Console > Manage Service Accounts > Delete old key

## Next Steps

After completing this setup:

1. ✅ Verify local development works
2. ✅ Set up environment variables in staging
3. ✅ Set up environment variables in production
4. ✅ Remove any cached credentials from git history:
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch *.json' --prune-empty --tag-name-filter cat -- --all
   ```
5. ✅ Review Firebase security rules
6. ✅ Implement rate limiting for API routes
7. ✅ Set up monitoring and alerting

## Support

For issues:
1. Check this guide's troubleshooting section
2. Review console output for error messages
3. Check `.env.local` file exists and has all variables
4. Verify external services (Ollama, conversion API) are running

---

**Last Updated:** January 24, 2026  
**Security Status:** 🟢 RESOLVED - All credentials now use environment variables
