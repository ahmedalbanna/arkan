
import admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK if it hasn't been already.
function initializeFirebaseAdmin() {
  if (admin.apps.length === 0) {
    // When running in a Google Cloud environment (like App Hosting or Cloud Functions),
    // the SDK automatically discovers the service account credentials.
    // The GOOGLE_APPLICATION_CREDENTIALS environment variable should be set to the path of the key file for local development.
    admin.initializeApp({
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
    console.log("Firebase Admin SDK initialized successfully.");
  }
}

// Ensure the SDK is initialized when this module is loaded.
initializeFirebaseAdmin();

// Export a function to get the auth instance.
export function getAdminAuth() {
  return admin.auth();
}

// Export the admin db and rtdb instances directly.
export const adminDb = admin.firestore();
export const adminRealtimeDb = admin.database();
