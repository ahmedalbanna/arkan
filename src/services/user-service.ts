
'use client';

import type { UserProfile, PricingPlan } from '@/lib/types';
import { auth, app } from '@/lib/firebase/client-init';
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
import type { SignupCredentials } from "@/components/auth/SignupForm";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

export interface UserListResponse {
    users: UserProfile[];
    hasNextPage: boolean;
    lastVisibleId: string | null;
}

/**
 * Fetches a list of all administrators.
 * This is a public endpoint used to initiate support chats.
 * @returns A promise that resolves to an array of admin UserProfile objects.
 */
export async function fetchAdmins(): Promise<UserProfile[]> {
    const response = await fetch('/api/admins');
    if (!response.ok) {
        throw new Error('Failed to fetch admins');
    }
    return response.json();
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
    return await response.json();
}

/**
 * Subscribes to real-time updates for a user's profile from Firestore.
 * This is a client-side function that uses the Firebase JS SDK.
 * @param userId - The ID of the user to subscribe to.
 * @param callback - A function to call with the user profile data whenever it changes.
 * @returns An unsubscribe function to stop listening for updates.
 */
export function subscribeToUserProfile(userId: string, callback: (user: UserProfile | null) => void) {
    const db = getFirestore(app);
    const userDocRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() } as UserProfile);
        } else {
            callback(null);
        }
    }, (error) => {
        console.error("Error listening to user profile:", error);
        callback(null);
    });

    return unsubscribe;
}

/**
 * Fetches the profile for a single user from the API.
 * Requires authentication.
 * @param userId - The ID of the user whose profile is to be fetched.
 * @param token - The authentication token of the requester.
 * @returns A promise that resolves to the UserProfile object or null if not found.
 */
export async function fetchUserProfileApi(userId: string, token: string): Promise<UserProfile | null> {
    if (!userId) return null;
    const response = await fetch(`/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        if(response.status === 404) return null;
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch user profile');
    }
    return await response.json();
}


export async function loginWithEmail(credentials: {email: string, password: string}) {
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
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-email"
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
    throw errorData; // Throw the structured error from the API
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


export async function saveDeviceToken(userId: string, token: string) {
    if (!userId || !token) return;
    const db = getFirestore(app);
    const tokenRef = doc(db, 'deviceTokens', userId);
    await setDoc(tokenRef, { token, updatedAt: new Date().toISOString() }, { merge: true });
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

export async function forgotPasswordService(email: string) {
  return sendPasswordResetEmail(auth, email);
}


export async function purchaseCreditsApi(
  plan: PricingPlan,
  token: string
): Promise<{ newBalance: number }> {
  const response = await fetch("/api/purchase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planId: plan.id, credits: plan.credits }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Purchase failed.");
  }
  return response.json();
}
