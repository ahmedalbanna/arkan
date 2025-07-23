
'use client';

import type { UserProfile } from '@/lib/db/queries';

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

  const response = await fetch(`/api/users/${userId}`, {
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
