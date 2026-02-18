
'use client';

import type { SignupCredentials, UserProfile } from '@/lib/types';
import { apiService } from './apiService';
import { fetchUserProfileApi } from './userService';

// Re-export for convenience
export { fetchUserProfileApi };

/**
 * Note: Firebase Auth has been removed. All authentication is now handled via NextAuth.
 * These functions are deprecated and kept for backwards compatibility.
 */

/**
 * @deprecated Use NextAuth signIn() instead
 */
export async function loginWithEmail(_credentials: { email: string; password: string }) {
  throw new Error('Firebase Auth removed. Use NextAuth signIn() instead.');
}

/**
 * @deprecated Use NextAuth signIn('google') instead
 */
export async function loginWithGoogle() {
  throw new Error('Firebase Auth removed. Use NextAuth signIn("google") instead.');
}

/**
 * @deprecated Use NextAuth signOut() instead
 */
export async function serviceLogoutUser() {
  throw new Error('Firebase Auth removed. Use NextAuth signOut() instead.');
}

/**
 * Signs up a new user via the dedicated API endpoint.
 */
export async function serviceSignupUser(credentials: SignupCredentials) {
    return apiService({
        endpoint: '/api/auth/signup',
        method: 'POST',
        data: credentials
    });
}

/**
 * @deprecated Use NextAuth password reset flow instead
 */
export async function forgotPasswordService(_email: string) {
  throw new Error('Firebase Auth removed. Implement NextAuth password reset flow.');
}

export async function sendPasswordResetEmailApi(userId: string, token: string) {
  return apiService({
    endpoint: `/api/users/${userId}/reset-password`,
    method: 'POST',
    token,
  });
}

/**
 * Creates or updates a user profile via API.
 */
export async function createOrUpdateUserProfileApi(userId: string, data: Partial<UserProfile>, token: string): Promise<UserProfile> {
    return apiService({
        endpoint: `/api/users/${userId}`,
        method: 'PUT',
        data,
        token
    });
}
