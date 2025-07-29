
'use client';

import type { UserProfile } from '@/lib/db/queries';

export async function createUserService(data: any, token: string): Promise<any> {
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
 * Fetches the list of all users from the API.
 * Requires admin authentication.
 * @param token The admin user's authentication token.
 * @returns A promise that resolves to an array of UserProfile objects.
 */
export async function fetchUsers(page: number, limit: number, token: string): Promise<UserProfile[]> {
    const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}`, {
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
