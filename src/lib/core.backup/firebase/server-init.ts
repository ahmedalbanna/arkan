/**
 * تهيئة Firebase للخادم
 *
 * هذا الملف يحتوي على تهيئة Firebase للخادم فقط
 * ولا يجب استيراده في العميل
 */

import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

/**
 * إعدادات Firebase للخادم
 */
const firebaseServerConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

/**
 * تهيئة Firebase Admin
 */
let adminApp: any = null;

if (typeof window === 'undefined') {
    // فقط على الخادم
    try {
        if (getApps().length === 0) {
            adminApp = initializeApp({
                credential: cert(firebaseServerConfig as any),
                projectId: process.env.FIREBASE_PROJECT_ID,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            });
        } else {
            adminApp = getApp();
        }
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
    }
}

/**
 * تصدير خدمات Firebase للخادم
 */
export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminFirestore = adminApp ? getFirestore(adminApp) : null;
export const adminStorage = adminApp ? getStorage(adminApp) : null;

/**
 * تصدير التطبيق
 */
export default adminApp;
