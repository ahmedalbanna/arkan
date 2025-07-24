import admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK if it hasn't been already.
function initializeFirebaseAdmin() {
  if (admin.apps.length === 0) {
    try {
      const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;

      if (!serviceAccount) {
        throw new Error(
          "The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set."
        );
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_UL,
      });

      console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
      console.error("Firebase Admin initialization error:", error);
      // In a real app, you might want to handle this more gracefully.
      // For this example, we'll let it throw to prevent the app from starting
      // in a misconfigured state.
      throw error;
    }
  }
}

// Ensure the SDK is initialized when this module is loaded.
initializeFirebaseAdmin();

// Export a function to get the auth instance.
export function getAdminAuth() {
  return admin.auth();
}

// Export a function to get the firestore instance.
// Note: We're exporting the db instance directly after initialization.
export const adminDb = admin.firestore();
