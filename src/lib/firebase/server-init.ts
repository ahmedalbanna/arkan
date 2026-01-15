// src/lib/firebase/server-init.ts
import admin from 'firebase-admin';

// This file should be imported only on the server-side.
// It initializes the Firebase Admin SDK.

// Check if the app is already initialized to prevent errors during hot-reloading in development.
if (!admin.apps.length) {
  try {
    // When deployed (e.g., on Vercel), GOOGLE_APPLICATION_CREDENTIALS will be set.
    // For local development, we can fall back to the service account file.
    if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log("Firebase Admin SDK initialized using environment variables.");
    } else {
      // Fallback for local development
      const serviceAccount = require('../../../docudec-firebase-adminsdk-2maa7-d07a19d3fc.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://docudec-default-rtdb.asia-southeast1.firebasedatabase.app",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log("Firebase Admin SDK initialized using local service account.");
    }
  } catch (error: any) {
    console.error("Firebase admin initialization error", error.stack);
  }
}

// Export the initialized admin services.
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminRealtimeDb = admin.database();
