

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Checks if a user is authenticated and returns their ID token.
 * Throws a consistent error if the user is not authenticated.
 * This should be used at the beginning of any authenticated API service function.
 *
 * @param user The user object, which can be null.
 * @returns A promise that resolves with the user's token.
 * @throws An error with the message "User not authenticated" if user is null.
 */
export const getAuthenticatedToken = async (user: { uid: string; getIdToken: (force: boolean) => Promise<string> } | null): Promise<string> => {
  if (!user) {
    throw new Error("User not authenticated");
  }
  return await user.getIdToken(true);
};
