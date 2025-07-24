// This file is a workaround to avoid circular dependencies when both server and client
// components import from the same files that use firebase-admin.
// It initializes a single instance of the admin SDK and exports the db object.
import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS!)),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_UL
        });
        console.log("Firebase Admin DB initialized successfully.");
    } catch (error: any) {
        console.error("Firebase Admin DB initialization error:", error.stack);
    }
}

export const adminDb = admin.firestore();
