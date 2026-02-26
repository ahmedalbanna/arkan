/**
 * Session management utilities for handling authentication sessions and cookies.
 */

/**
 * Manages setting/clearing the session cookie based on authentication state.
 * @param user The authenticated Firebase user, or null to clear session
 */
export async function manageSession(user: { getIdToken: (forceRefresh: boolean) => Promise<string> } | null) {
  if (user) {
    const idToken = await user.getIdToken(true);
    // Set session cookie
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  } else {
    // This API route is designed to clear both session and guest cookies
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  }
}
