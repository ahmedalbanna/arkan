import type { User as FirebaseUser } from 'firebase/auth';


export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Checks if a Firebase user is authenticated and returns their ID token.
 * Throws a consistent error if the user is not authenticated.
 * This should be used at the beginning of any authenticated API service function.
 *
 * @param firebaseUser The Firebase user object, which can be null.
 * @returns A promise that resolves with the user's ID token.
 * @throws An error with the message "User not authenticated" if firebaseUser is null.
 */
export const getAuthenticatedToken = async (firebaseUser: FirebaseUser | null): Promise<string> => {
  if (!firebaseUser) {
    throw new Error("User not authenticated");
  }
  // Force refresh the token to ensure it's not a cached, revoked token.
  return await firebaseUser.getIdToken(true);
};
