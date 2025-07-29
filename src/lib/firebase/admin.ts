'use server';

import admin from 'firebase-admin';
import { adminDb, adminRealtimeDb } from './server-init';

// Export a function to get the auth instance.
export async function getAdminAuth() {
  return admin.auth();
}

export { adminDb, adminRealtimeDb };
