This document outlines the API endpoints for managing user data.

### GET `/api/users`

-   **Purpose**: Fetches a paginated list of all users.
-   **Access**: Admin-only.
-   **Usage**: Used by the `UserManagementConsole` to display the main user table.

### POST `/api/users`

-   **Purpose**: Allows an administrator to create a new user directly.
-   **Access**: Admin-only.
-   **Logic**: Creates a user in Firebase Authentication and a corresponding user profile document in Firestore.
-   **Usage**: Called by the `CreateUserDialog` in the admin panel.

### GET `/api/users/[id]`

-   **Purpose**: Fetches the complete profile for a single user.
-   **Access**: This route is protected. Access is granted if the requester is an admin OR if the requester is the user whose profile is being requested.
-   **Usage**: Called by the `useUserProfile` hook to fetch profile data for display on profile pages or in edit forms.

### DELETE `/api/users/[id]`

-   **Purpose**: Permanently deletes a user from both Firebase Authentication and the Firestore database.
-   **Access**: Admin-only.
-   **Usage**: Called by the `deleteUser` mutation when an admin confirms the deletion of a user.

### POST `/api/users/[id]/reset-password`

-   **Purpose**: Sends a password reset email to a user.
-   **Access**: Admin-only.
-   **Note**: The Firebase Admin SDK cannot directly send these emails. A production implementation would use this endpoint to trigger a third-party email service (like SendGrid) after generating a reset link with `adminAuth.generatePasswordResetLink()`. The current implementation simulates this for demonstration.
-   **Usage**: Called by the `useSendPasswordReset` hook in the `EditUserForm`.