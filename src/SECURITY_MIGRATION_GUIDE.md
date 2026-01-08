# 🔐 Security Migration Guide - CRITICAL SECURITY FIXES

## ⚠️ IMMEDIATE ACTIONS REQUIRED

This guide covers the critical security fixes applied to your Arkan application. **You must follow these steps immediately** to secure your application.

---

## 🚨 What Was Fixed?

### 1. **Removed Hardcoded Firebase Credentials**
- ❌ **Before:** Service account JSON file hardcoded in `lib/firebase/server-init.ts`
- ✅ **After:** Secure environment variable-based credential loading

### 2. **Added .gitignore**
- ❌ **Before:** No `.gitignore` file, sensitive files could be committed
- ✅ **After:** Comprehensive `.gitignore` protecting credentials and databases

### 3. **Fixed Build Configuration**
- ❌ **Before:** React Strict Mode disabled, TypeScript/ESLint errors ignored
- ✅ **After:** Security checks enabled in production

### 4. **Created Environment Template**
- ✅ **New:** `.env.example` with all required environment variables documented

---

## 📋 STEP-BY-STEP MIGRATION INSTRUCTIONS

### **Step 1: Secure Your Firebase Credentials (CRITICAL)**

#### Option A: Using Service Account JSON File (Local Development)

1. **Locate your Firebase service account JSON file:**
   - It should be named something like: `docudec-firebase-adminsdk-2maa7-d07a19d3fc.json`
   - **DO NOT delete it yet** - we need it for the next step

2. **Move the file outside your git repository:**
   ```bash
   # Create a secure credentials folder OUTSIDE your project
   mkdir -p ~/.firebase-credentials
   
   # Move the service account file (replace with your actual filename)
   mv docudec-firebase-adminsdk-2maa7-d07a19d3fc.json ~/.firebase-credentials/arkan-firebase-admin.json
   ```

3. **Create `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```

4. **Add the path to your `.env.local`:**
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=/Users/yourusername/.firebase-credentials/arkan-firebase-admin.json
   ```

#### Option B: Using JSON String (Vercel/Production)

For deployment platforms like Vercel:

1. **Get your service account JSON content**
2. **Minify it to a single line** (remove all newlines and extra spaces)
3. **Add to environment variables:**
   ```env
   FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
   ```

#### Option C: Using Individual Environment Variables

1. Extract values from your service account JSON
2. Add to `.env.local`:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
   ```

---

### **Step 2: Configure All Environment Variables**

Edit your `.env.local` file and fill in ALL values from `.env.example`:

```env
# Firebase Client (from Firebase Console > Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Google AI (from https://makersuite.google.com/app/apikey)
GOOGLE_API_KEY=AIza...

# Application
DEDUCT_CREDITS=true
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### **Step 3: Remove Sensitive Files from Git History (CRITICAL)**

If you've already committed the service account JSON file, you MUST remove it from git history:

#### Quick Check:
```bash
# Check if the file exists in git history
git log --all --full-history -- "*firebase*adminsdk*.json"
```

If it shows results, **you must clean your git history:**

#### Option A: Using BFG Repo-Cleaner (Recommended - Faster)
```bash
# Install BFG (macOS)
brew install bfg

# Or download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove the sensitive file from ALL commits
bfg --delete-files "*firebase*adminsdk*.json"

# Clean up the repository
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history)
git push --force
```

#### Option B: Using git filter-branch
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch *firebase*adminsdk*.json" \
  --prune-empty --tag-name-filter cat -- --all

git reflog expire --expire=now --all
git gc --prune=now --aggressive

git push --force
```

#### **⚠️ AFTER CLEANING GIT HISTORY:**

1. **Rotate your Firebase credentials immediately:**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Manage service account permissions"
   - Delete the old service account or generate a new private key
   - Update your `.env.local` with the new credentials

2. **Notify your team:**
   - All team members must re-clone the repository or clean their local copies
   - Share the new credentials securely (NOT via git)

---

### **Step 4: Remove Database Files from Repository**

The SQLite database files should not be in git:

```bash
# Remove database files from git (keeps local files)
git rm --cached lib/db/agents.db
git rm --cached lib/db/agents.db-shm
git rm --cached lib/db/agents.db-wal

# Commit the removal
git commit -m "security: Remove database files from repository"

# Push the changes
git push
```

**Note:** The `.gitignore` now prevents these files from being committed in the future.

---

### **Step 5: Test Your Configuration**

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Check for Firebase initialization success:**
   - Look for: `✅ Firebase Admin SDK initialized successfully`
   - If you see errors, check your environment variables

3. **Test authentication:**
   - Try logging in to verify Firebase Auth is working
   - Try creating a project to test Firestore

4. **Test AI features:**
   - Try generating content to verify Google AI API is working

---

### **Step 6: Configure Production Environment**

#### For Vercel:

1. Go to your project settings on Vercel
2. Navigate to: Settings > Environment Variables
3. Add all variables from `.env.example`
4. Use the **FIREBASE_SERVICE_ACCOUNT_JSON** method (Option B above)
5. Set different variables for Production, Preview, and Development

#### For Other Platforms:

- **Netlify:** Use Environment Variables in Site Settings
- **AWS/Heroku:** Use their secrets management systems
- **Docker:** Use Docker secrets or environment files (not committed to git)

---

## 🔍 Verification Checklist

After completing the migration, verify:

- [ ] `.env.local` file exists and is NOT committed to git
- [ ] `.gitignore` file exists and includes sensitive files
- [ ] Firebase service account JSON is removed from the repository
- [ ] Firebase service account JSON is NOT in git history
- [ ] All environment variables are configured
- [ ] Application starts without errors
- [ ] Authentication works correctly
- [ ] AI features work correctly
- [ ] Database operations work correctly
- [ ] Production environment variables are configured
- [ ] Old credentials have been rotated (if they were exposed)

---

## 🚨 If Credentials Were Exposed

If your Firebase credentials or API keys were committed to git and pushed to a remote repository (GitHub, GitLab, etc.):

### **Immediate Actions:**

1. **Assume the credentials are compromised**
2. **Rotate ALL credentials immediately:**
   - Generate new Firebase service account
   - Regenerate Google AI API key
   - Update all environment variables
3. **Check Firebase Console for suspicious activity:**
   - Review Authentication logs
   - Check Firestore usage
   - Review Storage access logs
4. **Enable Firebase App Check** (for production)
5. **Consider enabling 2FA** on your Firebase account

---

## 📚 Additional Security Recommendations

### 1. **Enable Firebase Security Rules**

Review and tighten your Firestore security rules:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Only admins can access admin collections
    match /admins/{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 2. **Set Up Monitoring**

- Enable Firebase App Check for production
- Set up alerts for unusual API usage
- Monitor credit consumption patterns
- Set up error tracking (e.g., Sentry)

### 3. **Regular Security Audits**

- Review environment variables quarterly
- Rotate API keys every 6 months
- Update dependencies regularly
- Run security audits with `npm audit`

---

## 🆘 Troubleshooting

### Error: "No valid credentials found"

**Solution:** Check that at least ONE of these is set:
- `GOOGLE_APPLICATION_CREDENTIALS` (file path)
- `FIREBASE_SERVICE_ACCOUNT_JSON` (JSON string)
- All three: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

### Error: "Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON"

**Solution:** Ensure the JSON is valid and properly escaped:
```bash
# Test your JSON:
echo $FIREBASE_SERVICE_ACCOUNT_JSON | jq
```

### Error: "Private key must be a string"

**Solution:** Ensure newlines in private key are properly escaped:
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

### Development server starts but Firebase operations fail

**Solution:** 
1. Check `.env.local` exists in the root directory
2. Verify all `NEXT_PUBLIC_` variables are set
3. Restart the development server after changing `.env.local`

---

## 📞 Need Help?

If you encounter issues during migration:

1. Check the error messages in the console
2. Verify all environment variables are set correctly
3. Ensure the service account JSON file path is correct
4. Test Firebase credentials using Firebase CLI:
   ```bash
   firebase login
   firebase projects:list
   ```

---

## ✅ Summary

You have successfully:
- ✅ Secured Firebase credentials with environment variables
- ✅ Protected sensitive files with .gitignore
- ✅ Improved build configuration security
- ✅ Documented all environment variables

**Next recommended actions:**
1. Set up continuous security monitoring
2. Implement automated security testing
3. Add comprehensive test coverage
4. Document your deployment process

---

**Last Updated:** January 8, 2025
**Security Fixes Version:** 1.0.0
