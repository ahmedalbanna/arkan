import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

let serviceAccount: admin.ServiceAccount;

// Check if the environment variable is set and file exists
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const serviceAccountPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    } else {
        console.error("Firebase service account file not found at path:", serviceAccountPath);
        throw new Error("Firebase admin credentials file is missing.");
    }
} else {
    console.error("GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.");
    throw new Error("Firebase admin credentials are not configured.");
}


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const adminDb = getFirestore();
const auth = getAdminAuth();

export { adminDb, auth };
