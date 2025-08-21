// src/lib/firebase/server-init.ts
import admin from 'firebase-admin';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';

const serviceAccount = require('../../../docudec-firebase-adminsdk-2maa7-d07a19d3fc.json');
const firebaseConfig = {
  credential: cert(serviceAccount),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://docudec-default-rtdb.asia-southeast1.firebasedatabase.app", // Use the environment variable or a default

  // You might have other config options here
};

let adminApp;
if (!getApps().length) {
  adminApp = initializeApp(firebaseConfig);
} else {
  adminApp = getApp();
}

// This function initializes the Firebase Admin SDK if it hasn't been already.
function initializeFirebaseAdmin() {
  if (admin.apps.length === 0) {
    // Explicitly provide the databaseURL to prevent errors in local script environments.
    admin.initializeApp({
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
    console.log("Firebase Admin SDK initialized successfully.");
  }
}

// // Ensure the SDK is initialized when this module is loaded.
initializeFirebaseAdmin();

// Export the admin db and rtdb instances directly.
export const adminDb = admin.firestore();
export const adminRealtimeDb = admin.database();
