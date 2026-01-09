
'use client';

import { auth } from '@/lib/firebase/client-init';
import type { LoginCredentials, SignupCredentials, UserProfile } from '@/lib/types';
import {
  GoogleAuthProvider,
  getAdditionalUserInfo,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type UserCredential
} from "firebase/auth";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { apiService } from './apiService';
import { fetchUserProfileApi } from './userService';

// Re-export for convenience
export { fetchUserProfileApi };


// --- Authentication Functions ---

export async function loginWithEmail(credentials: LoginCredentials): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
  } catch (error: any) {
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-email"
    ) {
      throw new Error("Invalid email or password.");
    }
    throw new Error(error.message || "Login failed. Please try again.");
  }
}

export async function loginWithGoogle(): Promise<{user: UserCredential['user'], isNewUser: boolean}> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const info = getAdditionalUserInfo(result);
    return { user: result.user, isNewUser: !!info?.isNewUser };
  } catch (error: any) {
    throw new Error(error.message || "Google Sign-In failed.");
  }
}

export async function serviceLogoutUser() {
  await signOut(auth);
  return apiService({ endpoint: '/api/auth/logout', method: 'POST' });
}

/**
 * Signs up a new user via the dedicated API endpoint.
 * This now handles both auth creation and profile creation in one go.
 */
export async function serviceSignupUser(credentials: SignupCredentials) {
    return apiService({
        endpoint: '/api/auth/signup',
        method: 'POST',
        data: credentials
    });
}


export async function forgotPasswordService(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function sendPasswordResetEmailApi(userId: string, token: string) {
  return apiService({
    endpoint: `/api/users/${userId}/reset-password`,
    method: 'POST',
    token,
  });
}

/**
 * Creates or updates a user profile document in Firestore.
 * This is now the single source of truth for creating profiles.
 */
export async function createOrUpdateUserProfileApi(userId: string, data: Partial<UserProfile>, token: string): Promise<UserProfile> {
    return apiService({
        endpoint: `/api/users/${userId}`,
        method: 'PUT',
        data,
        token
    });
}
