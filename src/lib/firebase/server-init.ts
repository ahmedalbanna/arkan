// src/lib/firebase/server-init.ts
import admin from 'firebase-admin';

// This file should be imported only on the server-side.
// It initializes the Firebase Admin SDK.

if (!admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key must be properly formatted (replace \\n with \n)
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };
    
    // Check if the essential service account variables are provided
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            // The apiKey is crucial for some Admin SDK operations in a web context.
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, 
        });
        console.log("Firebase Admin SDK initialized using service account environment variables.");
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Fallback to application default credentials if the specific variables aren't set
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        });
        console.log("Firebase Admin SDK initialized using Application Default Credentials.");
    } else {
        throw new Error("Firebase Admin SDK credentials are not configured. Please set either FIREBASE_* environment variables or GOOGLE_APPLICATION_CREDENTIALS.");
    }

  } catch (error: any) {
    console.error("Firebase admin initialization error:", error.stack);
    // In a real production environment, you might want to handle this more gracefully
    // than exiting the process, but for development, this makes configuration issues obvious.
    process.exit(1);
  }
}

// Export the initialized admin services.
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminRealtimeDb = admin.database();
