# 🚀 Quick Start - Security Setup (5 Minutes)

## ⚡ Fastest Way to Get Started Securely

Follow these steps to get your application running with proper security:

---

## **Step 1: Create Your Environment File (1 minute)**

```bash
# Copy the example file
cp .env.example .env.local
```

---

## **Step 2: Move Your Firebase Service Account (1 minute)**

```bash
# Create a secure folder outside your project
mkdir -p ~/.firebase-credentials

# Move your service account file there (replace with your actual filename)
mv docudec-firebase-adminsdk-2maa7-d07a19d3fc.json ~/.firebase-credentials/arkan-firebase-admin.json

# Or if you can't find it, download a new one from:
# Firebase Console > Project Settings > Service Accounts > Generate New Private Key
```

---

## **Step 3: Edit .env.local (2 minutes)**

Open `.env.local` and set these minimum required variables:

```env
# Point to your service account file
GOOGLE_APPLICATION_CREDENTIALS=/Users/yourusername/.firebase-credentials/arkan-firebase-admin.json

# Get these from Firebase Console > Project Settings > Your apps
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Get from https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_google_ai_key

# Application settings
DEDUCT_CREDITS=true
NODE_ENV=development
```

---

## **Step 4: Start Development Server (30 seconds)**

```bash
npm run dev
```

Look for this message:
```
✅ Firebase Admin SDK initialized successfully
```

---

## **Step 5: Clean Git History (Optional but CRITICAL if file was committed)**

**Only if you previously committed the service account JSON to git:**

```bash
# Quick check - did I commit it?
git log --all --full-history -- "*firebase*adminsdk*.json"

# If YES, use BFG to clean it (fastest method):
brew install bfg
bfg --delete-files "*firebase*adminsdk*.json"
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# Then IMMEDIATELY rotate your Firebase credentials:
# Firebase Console > Project Settings > Service Accounts > Generate New Private Key
```

---

## ✅ Done!

Your application is now running securely. 

**Important:** Read `SECURITY_MIGRATION_GUIDE.md` for complete details and production deployment.

---

## 🆘 Something Not Working?

### "No valid credentials found"
→ Check that `GOOGLE_APPLICATION_CREDENTIALS` path is correct and file exists

### "Permission denied"
→ Make sure the service account file has read permissions: `chmod 600 ~/.firebase-credentials/arkan-firebase-admin.json`

### "App still shows errors"
→ Restart the dev server: Stop it (Ctrl+C) and run `npm run dev` again

### Environment variables not loaded
→ Ensure file is named `.env.local` (not `.env`) and is in the project root

---

**Need more help?** See `SECURITY_MIGRATION_GUIDE.md` for detailed instructions.
