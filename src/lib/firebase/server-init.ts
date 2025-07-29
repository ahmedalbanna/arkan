
// src/lib/firebase/server-init.ts
import admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK if it hasn't been already.
function initializeFirebaseAdmin() {
  if (admin.apps.length === 0) {
    admin.initializeApp({
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
    console.log("Firebase Admin SDK initialized successfully.");
  }
}

// Ensure the SDK is initialized when this module is loaded.
initializeFirebaseAdmin();

// Export the admin db and rtdb instances directly.
export const adminDb = admin.firestore();
export const adminRealtimeDb = admin.database();
