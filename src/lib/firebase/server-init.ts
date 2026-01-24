import { firebaseAdminConfig } from '@/lib/config';
import admin from 'firebase-admin';

// This file should be imported only on the server-side.
// It initializes the Firebase Admin SDK.

if (!admin.apps.length) {
  try {
    // Ensure all required environment variables are present
    if (
      firebaseAdminConfig.projectId &&
      firebaseAdminConfig.clientEmail &&
      firebaseAdminConfig.privateKey
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseAdminConfig.projectId,
          clientEmail: firebaseAdminConfig.clientEmail,
          privateKey: firebaseAdminConfig.privateKey,
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log("Firebase Admin SDK initialized using environment variables.");
    } else {
      console.error(
        "Firebase Admin SDK initialization failed. Required environment variables are missing:\n" +
        "- FIREBASE_PROJECT_ID\n" +
        "- FIREBASE_CLIENT_EMAIL\n" +
        "- FIREBASE_PRIVATE_KEY\n\n" +
        "Please set these in your .env.local file. See .env.example for details."
      );
    }
  } catch (error: any) {
    console.error("Firebase admin initialization error", error.stack);
  }
}

// Export the initialized admin services.
export const adminAuth = admin.apps.length ? admin.auth() : {} as admin.auth.Auth;
export const adminDb = admin.apps.length ? admin.firestore() : {} as admin.firestore.Firestore;
export const adminRealtimeDb = admin.apps.length ? admin.database() : {} as admin.database.Database;
