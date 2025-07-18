
'use client';

import type { UserProfile } from '@/lib/db/queries';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    return null;
  }
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    // The API route now returns a JSON error object, so we parse it
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch user profile' }));
    throw new Error(errorData.message || 'Failed to fetch user profile');
  }
  return response.json();
}
