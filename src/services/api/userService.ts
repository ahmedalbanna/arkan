
// src/services/user-service.ts
'use client';

import type { UserProfile } from '@/lib/models/user';
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
 * Subscribes to real-time updates for a user's profile.
 * Note: This function is deprecated. Use React Query's polling or WebSocket alternatives.
 * @deprecated Use React Query with refetchInterval for real-time updates
 */
export function subscribeToUserProfile(_userId: string, _callback: (user: UserProfile | null) => void) {
  console.warn('subscribeToUserProfile is deprecated. Use React Query polling instead.');
  return () => {}; // Return no-op unsubscribe function
}

/**
 * Fetches the profile for a single user from the API.
 */
export async function fetchUserProfileApi(userId: string, token: string): Promise<UserProfile | null> {
  console.log('[userService] fetchUserProfileApi called with:', {
    userId,
    tokenLength: token?.length,
    tokenPreview: token?.substring(0, 10) + '...'
  });

  if (!userId) {
    console.warn('[userService] fetchUserProfileApi: userId is empty, returning null');
    return null;
  }

  console.log('[userService] Calling apiService for user profile');
  const result = await apiService({ endpoint: `/api/users/${userId}`, token });
  
  console.log('[userService] fetchUserProfileApi result:', {
    hasResult: !!result,
    resultKeys: result ? Object.keys(result) : null,
    userId: result?.id,
    email: result?.email,
    role: result?.role
  });
  
  return result;
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
