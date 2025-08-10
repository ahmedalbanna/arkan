// firebaseErrors.ts

import { FirebaseError as AdminFirebaseError } from 'firebase-admin';
import { FirebaseError as ClientFirebaseError } from 'firebase/app'; // Assuming you might use client-side Firebase too

/**
 * Custom error class for wrapping Firebase errors.
 */
export class CustomFirebaseError extends Error {
  public code: string;
  public originalError: AdminFirebaseError | ClientFirebaseError | any;

  constructor(code: string, message: string, originalError?: AdminFirebaseError | ClientFirebaseError | any) {
    super(message);
    this.code = code;
    this.name = 'CustomFirebaseError';
    this.originalError = originalError;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CustomFirebaseError.prototype);
  }
}

/**
 * A utility function to check if an error is a Firebase Admin SDK error.
 * @param error The error to check.
 * @returns True if the error is a Firebase Admin SDK error, false otherwise.
 */
export function isAdminFirebaseError(error: any): error is AdminFirebaseError {
  return error instanceof Error && typeof (error as any).code === 'string';
}

/**
 * A utility function to check if an error is a Firebase Client SDK error.
 * @param error The error to check.
 * @returns True if the error is a Firebase Client SDK error, false otherwise.
 */
export function isClientFirebaseError(error: any): error is ClientFirebaseError {
  // This is a basic check, you might need to refine it based on the actual client SDK structure
  return error && typeof error.code === 'string' && typeof error.message === 'string' && error.name === 'FirebaseError';
}

/**
 * Utility function to handle and potentially wrap Firebase errors.
 * @param error The caught error.
 * @param defaultMessage A default message if the error is not a recognized Firebase error.
 * @returns A CustomFirebaseError or a standard Error.
 */
export function handleFirebaseError(error: any, defaultMessage: string = 'An unexpected Firebase error occurred.'): CustomFirebaseError | Error {
  if (isAdminFirebaseError(error) || isClientFirebaseError(error)) {
    console.error('Caught Firebase Error:', error.code, error.message, error);
    return new CustomFirebaseError(error.code, error.message, error);
  } else {
    console.error('Caught Non-Firebase Error:', error);
    // You might want to inspect other types of errors here
    return new Error(defaultMessage);
  }
}

// Example Usage (Illustrative - this code won't run without Firebase setup)

/*
import { handleFirebaseError, CustomFirebaseError } from './firebaseErrors';
import { adminDb } from './firebase/server-init'; // Assuming your admin initialization

async function fetchDataFromFirestore() {
  try {
    const docRef = adminDb.collection('some_collection').doc('some_doc_that_might_not_exist');
    const doc = await docRef.get();
    if (!doc.exists) {
      console.log('Document does not exist.');
    } else {
      console.log('Document data:', doc.data());
    }
  } catch (error) {
    const handledError = handleFirebaseError(error, 'Failed to fetch data.');

    if (handledError instanceof CustomFirebaseError) {
      console.error('Handled Firebase Error (Custom):', handledError.code, handledError.message);
      // You can access handledError.originalError for the original Firebase error object
    } else {
      console.error('Handled Non-Firebase Error:', handledError.message);
    }
  }
}

// Example with a potential Realtime Database error (if you were using it)
// import admin from 'firebase-admin';
// async function writeToRealtimeDatabase() {
//   try {
//     await admin.database().ref('some/path').set({ data: 'test' });
//   } catch (error) {
//      const handledError = handleFirebaseError(error, 'Failed to write to RTDB.');
//      if (handledError instanceof CustomFirebaseError) {
//         console.error('Handled RTDB Error (Custom):', handledError.code, handledError.message);
//      }
//   }
// }

// fetchDataFromFirestore();
*/