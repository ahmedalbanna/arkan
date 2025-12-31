
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
import { fetchUserProfileApi } from './userService';


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
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Logout failed.");
  }
  return response.json();
}

/**
 * Signs up a new user via the dedicated API endpoint.
 * This now handles both auth creation and profile creation in one go.
 */
export async function serviceSignupUser(credentials: SignupCredentials): Promise<UserCredential> {
    const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
    }
    // Signup is now just for creating the user; login is separate
    // So we don't return the user credential directly, just a success indicator
    // The user will be redirected to the login page
    return response.json();
}


export async function forgotPasswordService(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function sendPasswordResetEmailApi(userId: string, token: string) {
  const response = await fetch(`/api/users/${userId}/reset-password`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send password reset email.");
  }
  return response.json();
}

/**
 * Creates or updates a user profile document in Firestore.
 * This is now the single source of truth for creating profiles.
 */
export async function createOrUpdateUserProfileApi(userId: string, data: Partial<UserProfile>, token: string): Promise<UserProfile> {
    const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create or update user profile.');
    }
    return response.json();
}
