/**
 * تهيئة Firebase للعميل
 *
 * هذا الملف يحتوي على تهيئة Firebase للعميل
 * مع إعدادات آمنة ومحسنة
 */

import { getAnalytics } from 'firebase/analytics';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * إعدادات Firebase
 */
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * تهيئة Firebase App
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * تهيئة Firebase Auth
 */
export const auth = getAuth(app);

/**
 * تهيئة Firebase Firestore
 */
export const db = getFirestore(app);

/**
 * تهيئة Firebase Storage
 */
export const storage = getStorage(app);

/**
 * تهيئة Firebase Analytics (فقط في المتصفح)
 */
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

/**
 * تصدير Firebase App
 */
export default app;
