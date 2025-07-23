import { FirebaseUser } from '@/context/AuthContext';

/**
 * Checks if a Firebase user is authenticated and returns their ID token.
 * Throws an error if the user is not authenticated.
 *
 * @param firebaseUser The authenticated Firebase user object.
 * @returns A promise that resolves with the user's ID token.
 */
export const getAuthenticatedToken = async (firebaseUser: FirebaseUser | null): Promise<string> => {
    if (!firebaseUser) {
        throw new Error("User not authenticated.");
    }
    return await firebaseUser.getIdToken();
};
