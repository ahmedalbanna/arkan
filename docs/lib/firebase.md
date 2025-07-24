
This document outlines the Firebase configuration and initialization for the project.

## 1. Purpose

-   This part of the codebase is responsible for connecting the application to the Firebase backend, handling both client-side and server-side interactions.

## 2. Key Files

-   **`src/lib/firebase.ts` (Client-side)**:
    -   This file initializes the Firebase client-side SDK using the project's public Firebase configuration keys.
    -   It exports the `auth` object, which is used throughout the application (via the `useAuth` hook) for all client-side authentication tasks like signing in, signing up, and listening for auth state changes.

-   **`src/lib/firebase/admin.ts` (Server-side)**:
    -   This file initializes the **Firebase Admin SDK**. It is for **server-side use only**.
    -   It reads the service account credentials (a JSON file) securely from an environment variable (`GOOGLE_APPLICATION_CREDENTIALS`).
    -   It exports `adminDb` (for direct Firestore access) and `auth` (for administrative auth tasks like verifying tokens and creating session cookies). This SDK is used in all API routes to interact with Firebase services with administrative privileges.

-   **`src/lib/firebase/serverApp.js` (Server-side)**:
    -   This file contains a helper function `getAuthenticatedAppForUser` which is used in Next.js Server Actions.
    -   It initializes a server-side version of the Firebase app using the user's session cookie. This allows Server Actions to securely perform operations on behalf of the currently logged-in user.

## 3. Security

-   The separation between client and admin initializations is critical for security.
-   Client-side code uses the public configuration and can only perform actions allowed by Firestore Security Rules.
-   Server-side code uses the admin credentials, giving it full access to the project's resources. This is why all server-side API routes must first verify the user's identity token before performing any action.
