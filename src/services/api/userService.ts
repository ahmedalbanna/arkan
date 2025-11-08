
// src/services/user-service.ts
'use client';

import { app } from '@/lib/firebase/client-init';
import type { UserProfile } from '@/lib/models/user';
import { doc, getFirestore, onSnapshot } from "firebase/firestore";

/**
 * Fetches a list of all administrators.
 * This is a public endpoint used to initiate support chats.
 * @returns A promise that resolves to an array of admin UserProfile objects.
 */
export async function fetchAdminsApi(): Promise<UserProfile[]> {
  const response = await fetch('/api/admins');
  if (!response.ok) {
    throw new Error('Failed to fetch admins');
  }
  return response.json();
}

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
export async function fetchUsersApi(limit: number, lastVisibleId: string | undefined, token: string): Promise<UserListResponse> {
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
    if (response.status === 404) return null;
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch user profile');
  }
  return await response.json();
}

/**
 * Creates a new user via the admin API.
 * @param data - The data for the new user, including email, password, name, role, and credits.
 * @param token - The admin user's authentication token.
 * @returns A promise that resolves with the newly created user's data.
 */
export async function createUserService(data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'hasCompletedOnboarding'> & { password?: string }, token: string) {
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

/**
 * Updates an existing user's profile via the API.
 * @param userId - The ID of the user to update.
 * @param data - The partial user profile data to update.
 * @param token - The authentication token of the user making the request.
 * @returns A promise that resolves with the updated user profile data.
 */
export async function updateUserApi(userId: string, data: Partial<UserProfile>, token: string): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user.');
  }
  return response.json();
}

/**
 * Deletes a user via the admin API.
 * @param userId - The ID of the user to delete.
 * @param token - The admin user's authentication token.
 * @returns A promise that resolves with a success message.
 */
export async function deleteUserApi(userId: string, token: string): Promise<{ message: string }> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete user.');
  }
  return response.json();
}
