import admin from 'firebase-admin';
import { firebaseAdminConfig } from '@/infrastructure/config/config';

// This file should be imported only on the server-side.
// It initializes the Firebase Admin SDK.

if (!admin.apps.length) {
  try {
    // Check if the essential admin config values are present
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
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log("Firebase Admin SDK initialized using environment variables.");
    } else {
      // Fallback for environments where service account file is used (e.g., local dev without .env)
      // Note: This path might need adjustment based on your project structure.
      // It's generally better to rely on environment variables.
      try {
        const serviceAccount = require('../../../docudec-firebase-adminsdk-2maa7-d07a19d3fc.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
        console.log("Firebase Admin SDK initialized using local service account file.");
      } catch (fileError) {
          console.error("Could not initialize Firebase Admin SDK. Environment variables are missing and the local service account file was not found.");
      }
    }
  } catch (error: any) {
    console.error("Firebase admin initialization error", error.stack);
  }
}

// Export the initialized admin services.
export const adminAuth = admin.apps.length ? admin.auth() : {} as admin.auth.Auth;
// export const adminDb = admin.apps.length ? admin.firestore() : {} as admin.firestore.Firestore;
