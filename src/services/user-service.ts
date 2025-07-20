
'use client';

import type { UserProfile } from '@/lib/db/queries';
import { auth } from '@/lib/firebase'; // Assuming you have firebase client auth initialized

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    return null;
  }
  
  // Ensure there's a current user and get their token
  const currentUser = auth.currentUser;
  if (!currentUser) {
      console.warn("Attempted to fetch profile without a logged-in user.");
      return null;
  }
  
  const token = await currentUser.getIdToken();

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
  return response.json();
}
