
'use client';

import type { UserProfile } from '@/lib/db/queries';

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
