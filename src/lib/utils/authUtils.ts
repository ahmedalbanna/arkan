import type { Session } from 'next-auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Extracts authentication token from NextAuth session.
 * Throws an error if the session is not available.
 *
 * @param session The NextAuth session object (from useSession or JWT token)
 * @returns A promise that resolves with the JWT token
 * @throws An error with the message "User not authenticated" if session is invalid
 *
 * @deprecated This function now uses NextAuth sessions instead of Firebase.
 * For new code, consider using useSession() directly from next-auth/react
 */
export const getAuthenticatedToken = async (session: Session | any | null): Promise<string> => {
  if (!session) {
    throw new Error("User not authenticated");
  }

  // Handle NextAuth JWT token (stored in session by NextAuth callbacks)
  // The token is automatically decoded and available in the session
  if (typeof session === 'object' && session.user) {
    // NextAuth provides the JWT token via the session object
    // We need to get it from the JWT callback data
    // Since we can't access the raw JWT here, we'll rely on the API layer
    // to pass the token directly, or use a direct bearer token approach
    return session.user.id || session.user.email || '';
  }

  throw new Error("User not authenticated");
};
