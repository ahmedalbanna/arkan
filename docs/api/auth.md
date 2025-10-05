This document describes the API endpoints related to user authentication and session management.

### POST `/api/auth/session`

-   **Purpose**: Creates an HTTP-only session cookie after a user successfully logs in on the client using the Firebase client-side SDK.
-   **Workflow**:
    1.  A user logs in via email/password, Google, or phone on the client.
    2.  The client sends the user's `idToken` to this endpoint.
    3.  The server verifies the `idToken` and creates a secure, HTTP-only session cookie (`__session`).
    4.  This cookie is set in the user's browser, allowing them to make authenticated requests to server-side API endpoints.
-   **Security**: This is a critical step that bridges client-side authentication with secure server-side sessions.

### DELETE `/api/auth/session`

-   **Purpose**: Logs the user out by clearing the session cookie.
-   **Workflow**: When a user clicks "Logout", the client calls `signOut()` from the Firebase SDK and then sends a request to this endpoint to expire the `__session` cookie.

### POST `/api/auth/signup`

-   **Purpose**: Handles the creation of new user records in both Firebase Auth and the Firestore database. It supports two distinct flows:
    1.  **Email/Password Signup**: It receives an email, password, and name, creates a new user in Firebase Auth, and then creates a corresponding user profile document in Firestore with default values (e.g., 10 credits, 'user' role).
    2.  **Provider-Based Signup/Login (Google, Phone)**: This flow acts as an "upsert." After a user signs in with a provider on the client, the client sends the user's `uid`, `email`, `name`, etc., to this endpoint. The endpoint checks if a user profile already exists in Firestore. If not, it creates one. This ensures that every authenticated user, regardless of their sign-in method, has a profile in the database.
