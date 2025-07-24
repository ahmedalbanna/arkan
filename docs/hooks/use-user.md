This code defines several custom React hooks using TanStack Query to manage user authentication and profile data.

**1. Purpose**

- The `use-user.ts` file is the central location for all user-related hooks. It handles authentication (login, logout, signup, etc.), profile data fetching, and other user-specific actions like purchasing credits. It follows a clean architecture by separating direct API and Firebase SDK calls into a service file (`src/services/user-service.ts`).

**2. Core Concepts**

-   **Service Layer (`src/services/user-service.ts`)**: This file contains the direct interactions with the Firebase Auth SDK (e.g., `signInWithEmailAndPassword`, `signOut`) and `fetch` calls to custom backend endpoints (e.g., `/api/auth/signup`). It abstracts away the implementation details of *how* authentication is performed.
-   **Hook Layer (`src/hooks/use-user.ts`)**: This file uses `useQuery` and `useMutation` to wrap the service functions. It's responsible for managing the application's state around the user, such as:
    -   Triggering navigation (`router.push`).
    -   Invalidating queries to refetch data (`queryClient.invalidateQueries`).
    -   Showing user feedback (`toast`).
    -   Connecting with the `AuthContext` to update the global user state.
-   **Authentication Context (`AuthContext.tsx`)**: The `useAuth` hook provides access to the current Firebase user and the user's profile from Firestore. The mutation hooks in `use-user.ts` call `refetchUser` from this context after successful auth changes to ensure the global state is updated.

**3. Key Functions and Hooks**

-   **`useUserProfile(userId)`**: A `useQuery` hook that fetches a user's profile data by calling the `fetchUserProfileApi` service function.
-   **`useLogin()`**: A mutation hook for email/password login. It calls the `loginUser` service function and, on success, updates the auth state and navigates the user to the main application.
-   **`useGoogleSignIn()`**: A mutation hook for signing in with Google.
-   **`useLogout()`**: A mutation hook that calls the `logoutUser` service and clears all cached data on success.
-   **`useSignup()`**: A mutation hook for creating a new user account via the backend API.
-   **`usePhoneSignIn()`**: A more complex hook that manages the multi-step phone authentication flow (sending and verifying the OTP) using Firebase's `RecaptchaVerifier`.
-   **`usePurchaseCredits()`**: A mutation hook for the (now deprecated) direct credit purchase flow.

**In summary:**

The `use-user.ts` file provides a comprehensive and well-structured set of hooks for all user management tasks. By abstracting the direct Firebase and API calls into a service layer, the hooks can focus on managing application state, side effects, and user feedback, leading to a more maintainable and organized codebase.