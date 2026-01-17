
// src/services/user-service.ts
'use client';

import { initializeFirebase } from '@/firebase';

const { firebaseApp: app } = initializeFirebase();
import type { UserProfile } from '@/lib/models/user';
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { apiService } from './apiService';

/**
 * Fetches a list of all administrators.
 * This is a public endpoint used to initiate support chats.
 * @returns A promise that resolves to an array of admin UserProfile objects.
 */
export async function fetchAdminsApi(): Promise<UserProfile[]> {
  return apiService({ endpoint: '/api/admins' });
}

export interface UserListResponse {
  users: UserProfile[];
  hasNextPage: boolean;
  lastVisibleId: string | null;
}

/**
 * Fetches a paginated list of users from the API.
 * Requires admin authentication.
 */
export async function fetchUsersApi(limit: number, lastVisibleId: string | undefined, token: string): Promise<UserListResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (lastVisibleId) {
    params.append('lastVisibleId', lastVisibleId);
  }
  return apiService({ endpoint: `/api/admin/users?${params.toString()}`, token });
}

/**
 * Subscribes to real-time updates for a user's profile from Firestore.
 * This is a client-side function that uses the Firebase JS SDK.
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
 */
export async function fetchUserProfileApi(userId: string, token: string): Promise<UserProfile | null> {
  if (!userId) return null;
  return apiService({ endpoint: `/api/users/${userId}`, token });
}

/**
 * Creates a new user via the admin API.
 */
export async function createUserService(data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'hasCompletedOnboarding'> & { password?: string }, token: string) {
  return apiService({
    endpoint: '/api/admin/users',
    method: 'POST',
    data,
    token
  });
}

/**
 * Updates an existing user's profile via the API.
 */
export async function updateUserApi(userId: string, data: Partial<UserProfile>, token: string): Promise<UserProfile> {
  return apiService({
    endpoint: `/api/users/${userId}`,
    method: 'PUT',
    data,
    token
  });
}

/**
 * Updates an existing user's profile via the ADMIN API.
 */
export async function adminUpdateUserApi(userId: string, data: Partial<UserProfile>, token: string): Promise<UserProfile> {
  return apiService({
    endpoint: `/api/admin/users/${userId}`,
    method: 'PUT',
    data,
    token
  });
}


/**
 * Deletes a user via the admin API.
 */
export async function deleteUserApi(userId: string, token: string): Promise<{ message: string }> {
  return apiService({
    endpoint: `/api/admin/users/${userId}`,
    method: 'DELETE',
    token
  });
}

interface SendNotificationVariables {
  userId: string;
  title: string;
  body: string;
  link?: string;
}

/**
 * Sends a push notification to a specific user via the admin API.
 */
export async function sendNotificationApi(variables: SendNotificationVariables, token: string): Promise<{ messageId: string }> {
  return apiService({
    endpoint: '/api/admin/notifications/send',
    method: 'POST',
    data: variables,
    token
  });
}
