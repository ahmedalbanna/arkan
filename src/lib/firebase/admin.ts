
'use server';

import admin from 'firebase-admin';
import { adminDb, adminRealtimeDb } from './server-init';

// Export a function to get the auth instance.
export async function getAdminAuth() {
  return admin.auth();
}

// NOTE: The non-async exports were removed from this file.
// Other modules should import them directly from './server-init'.
