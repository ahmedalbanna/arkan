/**
 * Firebase الموحد
 *
 * هذا الملف يحتوي على جميع مكونات Firebase الموحدة
 */

// Client-side Firebase (للعميل فقط)
export * from './client-init';

// Server-side Firebase (للخادم فقط)
export * from './server-init';

// Re-export commonly used Firebase types
export type { User } from 'firebase/auth';
export type { DocumentData, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
export type { UploadTask, UploadTaskSnapshot } from 'firebase/storage';

