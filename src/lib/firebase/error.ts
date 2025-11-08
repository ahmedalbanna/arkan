
import { FirebaseError as AdminFirebaseError } from 'firebase-admin/app';
import { FirebaseError as ClientFirebaseError } from 'firebase/app';

/**
 * Custom error class for wrapping Firebase errors to be identified easily.
 */
export class CustomFirebaseError extends Error {
  public code: string;
  public originalError?: any;

  constructor(code: string, message: string, originalError?: any) {
    super(message);
    this.code = code;
    this.name = 'CustomFirebaseError';
    this.originalError = originalError;
    Object.setPrototypeOf(this, CustomFirebaseError.prototype);
  }
}

/**
 * Checks if an error is a Firebase Admin or Client SDK error.
 * @param error The error to check.
 * @returns True if the error has a 'code' property, which is characteristic of Firebase errors.
 */
function isFirebaseError(error: any): error is AdminFirebaseError | ClientFirebaseError {
  return error && typeof error.code === 'string' && typeof error.message === 'string';
}

/**
 * Utility function to handle and normalize Firebase errors.
 * If the error is a known Firebase error, it's wrapped in a CustomFirebaseError.
 * @param error The caught error.
 * @returns A CustomFirebaseError if the error is from Firebase, otherwise returns the original error.
 */
export function handleFirebaseError(error: any): CustomFirebaseError | any {
  if (isFirebaseError(error)) {
    let message = error.message;
    // Provide more user-friendly messages for common auth errors
    switch (error.code) {
      case 'auth/id-token-expired':
        message = 'Your session has expired. Please log in again.';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-email':
        message = 'Invalid email or password.';
        break;
      case 'auth/email-already-exists':
        message = 'An account with this email address already exists.';
        break;
      case 'auth/weak-password':
        message = 'The password is too weak. It must be at least 6 characters long.';
        break;
    }
    return new CustomFirebaseError(error.code, message, error);
  }
  // If it's not a Firebase error, return it as-is to be handled by the next part of the chain.
  return error;
}
