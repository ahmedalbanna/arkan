
'use server';

import admin from 'firebase-admin';
import './server-init'; // This ensures the SDK is initialized

// Export a function to get the auth instance.
export async function getAdminAuth() {
  return admin.auth();
}
