// src/lib/firebase/server-init.ts
import admin from 'firebase-admin';

// This file should be imported only on the server-side.
// It initializes the Firebase Admin SDK.

if (!admin.apps.length) {
  try {
    // When deployed, GOOGLE_APPLICATION_CREDENTIALS will be set by the environment.
    // This is the recommended and more secure approach.
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log("Firebase Admin SDK initialized using Application Default Credentials.");
  } catch (error: any) {
    console.error("Firebase admin initialization error. Ensure GOOGLE_APPLICATION_CREDENTIALS is set in your environment.", error.stack);
    // Exit if Firebase Admin fails to initialize in a server environment
    process.exit(1);
  }
}

// Export the initialized admin services.
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminRealtimeDb = admin.database();
