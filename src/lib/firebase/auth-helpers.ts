'use server';

import { adminAuth } from './server-init';
import type { UserProfile } from '@/lib/models';
import { getUserHelper } from './db-helpers';

/**
 * Auth Helper Functions
 * 
 * Server-side authentication operations using Firebase Admin SDK.
 * These functions are designed to work with session cookies and admin auth.
 */

/**
 * Verify a session cookie and extract user data
 * @param sessionCookie - The session cookie value
 * @returns Decoded session data with user info
 * @throws Error if cookie is invalid or expired
 */
export async function verifySessionCookie(sessionCookie: string): Promise<{ uid: string; email?: string }> {
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
    };
  } catch (error: any) {
    throw new Error(`Invalid or expired session cookie: ${error.message}`);
  }
}

/**
 * Get full user data from session cookie
 * @param sessionCookie - The session cookie value
 * @returns User profile from Firestore
 * @throws Error if cookie is invalid or user not found
 */
export async function getUserFromSession(sessionCookie: string): Promise<UserProfile | null> {
  try {
    const claims = await verifySessionCookie(sessionCookie);
    return getUserHelper(claims.uid);
  } catch (error) {
    throw error;
  }
}

/**
 * Verify a custom token and return user info
 * @param customToken - Firebase custom token
 * @returns Decoded token claims
 * @throws Error if token is invalid
 */
export async function verifyCustomToken(customToken: string): Promise<{ uid: string; email?: string }> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(customToken);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new Error(`Invalid token: ${error.message}`);
  }
}

/**
 * Get user by UID using admin SDK
 * @param uid - User UID
 * @returns User record from Firebase Auth
 * @throws Error if user not found
 */
export async function getUserByUid(uid: string) {
  try {
    return await adminAuth.getUser(uid);
  } catch (error: any) {
    throw new Error(`User not found: ${error.message}`);
  }
}

/**
 * Check if a user is authenticated via session cookie
 * @param sessionCookie - The session cookie value
 * @returns true if session is valid, false otherwise
 */
export async function isAuthenticatedSession(sessionCookie: string): Promise<boolean> {
  try {
    await verifySessionCookie(sessionCookie);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate auth state from session cookie
 * Used by contexts to restore auth state
 * @param sessionCookie - The session cookie value
 * @returns User data if authenticated, null otherwise
 */
export async function validateAuthState(sessionCookie: string): Promise<{ uid: string; email?: string } | null> {
  try {
    return await verifySessionCookie(sessionCookie);
  } catch {
    return null;
  }
}
