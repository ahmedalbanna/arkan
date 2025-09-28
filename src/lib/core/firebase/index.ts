/**
 * Firebase الموحد
 *
 * هذا الملف يحتوي على جميع مكونات Firebase الموحدة
 */

// Client-side Firebase
export * from './client-init';

// Re-export commonly used Firebase types
export type { User } from 'firebase/auth';
export type { DocumentData, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
export type { UploadTask, UploadTaskSnapshot } from 'firebase/storage';

