/**
 * Session management utilities for handling authentication sessions and cookies.
 */

import { apiService } from '@/infrastructure/api/ApiService';

/**
 * Manages setting/clearing the session cookie based on authentication state.
 * @param user The authenticated Firebase user, or null to clear session
 */
export async function manageSession(
  user: { getIdToken: (forceRefresh: boolean) => Promise<string> } | null,
): Promise<void> {
  if (user) {
    const idToken = await user.getIdToken(true);

    await apiService<{ idToken: string }, void>({
      endpoint: '/api/auth/session',
      method: 'POST',
      data: { idToken },
    });

    return;
  }

  await apiService<undefined, void>({
    endpoint: '/api/auth/logout',
    method: 'POST',
  });
}
