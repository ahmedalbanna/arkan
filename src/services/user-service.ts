
'use client';

import type { UserProfile, LoginCredentials } from '@/lib/types';
import { auth, app } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { SignupCredentials } from '@/components/SignupForm';

export interface UserListResponse {
    users: UserProfile[];
    hasNextPage: boolean;
    lastVisibleId: string | null;
}

/**
 * Fetches a paginated list of users from the API.
 * Requires admin authentication.
 * @param token The admin user's authentication token.
 * @returns A promise that resolves to an array of UserProfile objects.
 */
export async function fetchUsers(limit: number, lastVisibleId: string | undefined, token: string): Promise<UserListResponse> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (lastVisibleId) {
        params.append('lastVisibleId', lastVisibleId);
    }
    const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch users');
    }
    return response.json();
}

/**
 * Fetches a user's profile from the database via the API.
 * @param userId - The ID of the user to fetch.
 * @param token - The authentication token of the currently logged-in user (for authorization).
 * @returns A promise that resolves to the UserProfile object or null if not found.
 */
export async function fetchUserProfile(userId: string, token: string): Promise<UserProfile | null> {
  if (!userId || !token) {
    return null;
  }

  const response = await fetch(`/api/admin/users/${userId}`, {
      headers: {
          'Authorization': `Bearer ${token}`
      }
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch user profile' }));
    throw new Error(errorData.message || 'Failed to fetch user profile');
  }
  return await response.json();
}


export async function loginWithEmail(credentials: LoginCredentials) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    return userCredential.user;
  } catch (error: any) {
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      throw new Error("Invalid email or password.");
    }
    throw new Error(error.message || "Login failed. Please try again.");
  }
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
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

export async function serviceSignupUser(credentials: SignupCredentials) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
}

export async function createUserService(data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> & { password?: string }, token: string) {
    const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user.');
    }
    return response.json();
}
