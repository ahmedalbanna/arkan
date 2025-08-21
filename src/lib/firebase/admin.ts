
// 'use server';

import admin from 'firebase-admin';

// This file should be imported only on the server-side.
// It initializes the Firebase Admin SDK.

// Check if the app is already initialized to prevent errors during hot-reloading in development.
if (!admin.apps.length) {
  try {
    // When deployed (e.g., on Vercel), GOOGLE_APPLICATION_CREDENTIALS environment variable
    // should contain the JSON content of the service account key.
    // For local development, it can be the path to the service account file.
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log("Firebase Admin SDK initialized.");
  } catch (error: any) {
    console.error("Firebase admin initialization error", error.stack);
  }
}

// Export the initialized admin services.
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminRealtimeDb = admin.database();
