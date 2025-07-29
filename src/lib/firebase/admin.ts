import admin from 'firebase-admin';
import * as fs from 'fs'; // Import the 'fs' module to read files
import * as path from 'path'; // Import the 'path' module to resolve file paths

// This function initializes the Firebase Admin SDK if it hasn't been already.
function initializeFirebaseAdmin() {
  if (admin.apps.length === 0) {
    try {
      const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS!;
      // Resolve the absolute path to the service account key file
      const absoluteServiceAccountPath = path.resolve(serviceAccountPath);

      // Read the content of the service account key file
      const serviceAccountContent = fs.readFileSync(absoluteServiceAccountPath, 'utf-8');

      // Parse the JSON content
      const serviceAccount = JSON.parse(serviceAccountContent);


      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
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
