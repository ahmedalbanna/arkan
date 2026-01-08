// src/lib/firebase/server-init.ts
import admin from 'firebase-admin';

// This file should be imported only on the server-side.
// It initializes the Firebase Admin SDK.

/**
 * Initialize Firebase Admin SDK with secure credential loading
 * 
 * SECURITY: This now supports multiple secure methods:
 * 1. GOOGLE_APPLICATION_CREDENTIALS env var (path to service account JSON)
 * 2. FIREBASE_SERVICE_ACCOUNT_JSON env var (JSON string)
 * 3. Individual env vars (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 * 
 * NEVER hardcode credentials or commit service account files to git.
 */
if (!admin.apps.length) {
  try {
    let credential;
    
    // Method 1: Use GOOGLE_APPLICATION_CREDENTIALS (path to JSON file)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      credential = admin.credential.applicationDefault();
      console.log("✅ Firebase Admin SDK: Using Application Default Credentials (file path)");
    } 
    // Method 2: Use FIREBASE_SERVICE_ACCOUNT_JSON (JSON string - for Vercel, etc.)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        credential = admin.credential.cert(serviceAccount);
        console.log("✅ Firebase Admin SDK: Using service account JSON from environment variable");
      } catch (parseError) {
        throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Ensure it's valid JSON.");
      }
    }
    // Method 3: Use individual environment variables
    else if (
      process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_CLIENT_EMAIL && 
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newlines in private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      console.log("✅ Firebase Admin SDK: Using individual environment variables");
    }
    // No valid credentials found
    else {
      throw new Error(
        "❌ Firebase Admin SDK initialization failed: No valid credentials found.\n" +
        "Please set one of the following:\n" +
        "1. GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON)\n" +
        "2. FIREBASE_SERVICE_ACCOUNT_JSON (service account JSON as string)\n" +
        "3. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY\n\n" +
        "See .env.example for configuration details."
      );
    }

    // Initialize Firebase Admin with the selected credential
    admin.initializeApp({
      credential,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    console.log("✅ Firebase Admin SDK initialized successfully");
  } catch (error: any) {
    console.error("❌ Firebase Admin SDK initialization error:", error.message);
    // Re-throw to prevent the app from running with invalid Firebase config
    throw error;
  }
}

// Export the initialized admin services.
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminRealtimeDb = admin.database();
