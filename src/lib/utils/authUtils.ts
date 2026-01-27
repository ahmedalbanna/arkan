/**
 * FirebaseUser Interface
 * Local type definition to avoid dependency on firebase/auth client package.
 * Represents a user object from Firebase Admin SDK or custom auth implementation.
 */
export interface FirebaseUser {
  uid: string;
  email?: string;
  displayName?: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  providerData?: Array<{
    providerId: string;
    uid: string;
    displayName?: string;
    email?: string;
  }>;
  getIdToken?: (forceRefresh?: boolean) => Promise<string>;
  reload?: () => Promise<void>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Checks if a Firebase user is authenticated and returns their ID token.
 * Throws a consistent error if the user is not authenticated.
 * This should be used at the beginning of any authenticated API service function.
 *
 * NOTE: The firebaseUser parameter is used only for the null check.
 * The actual token is retrieved from the real Firebase Auth user via getFirebaseAuthToken().
 *
 * @param firebaseUser The Firebase user object from the store (used for presence check only), which can be null.
 * @returns A promise that resolves with the user's ID token.
 * @throws An error with the message "User not authenticated" if firebaseUser is null.
 */
export const getAuthenticatedToken = async (firebaseUser: FirebaseUser | null): Promise<string> => {
  if (!firebaseUser) {
    throw new Error("User not authenticated");
  }
  // Delegate to getFirebaseAuthToken which retrieves the real Firebase Auth user
  return getFirebaseAuthToken(true);
};

/**
 * Gets the ID token for the currently authenticated Firebase user.
 * This is the primary function to use for getting tokens throughout the app.
 * 
 * Since the store only holds a plain FirebaseUser object (without getIdToken method),
 * this function retrieves the real Firebase Auth user and gets the token from it.
 *
 * @param forceRefresh If true, forces token refresh (recommended for API calls)
 * @returns A promise that resolves with the user's ID token
 * @throws An error if no user is authenticated or token retrieval fails
 */
export const getFirebaseAuthToken = async (forceRefresh: boolean = true): Promise<string> => {
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return await currentUser.getIdToken(forceRefresh);
  } catch (error) {
    if (error instanceof Error && error.message === "User not authenticated") {
      throw error;
    }
    throw new Error(`Failed to get auth token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
