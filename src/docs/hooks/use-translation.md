This code defines a custom React hook called `useTranslate` that uses TanStack Query to manage the state of a text translation feature.

**1. Purpose**

- The `useTranslate` hook provides a way to translate text using an AI service. It is designed to be a simple, reusable utility that can be called from anywhere in the application. It follows the standard architecture of separating API logic into a service.

**2. Core Concepts**

-   **Service Layer (`src/services/translation-service.ts`)**: This file contains the `fetch` call to the `/api/translate` endpoint. It's responsible for the raw network communication.
-   **Hook Layer (`src/hooks/use-translation.ts`)**: This file uses `useMutation` from TanStack Query to wrap the `translateTextApi` service function. It manages the asynchronous state of the translation request.
-   **Authentication (`src/lib/authUtils.ts`)**: The hook uses the `getAuthenticatedToken` utility to securely get the user's ID token before making the API call.
-   **Credit Deduction**: After a successful translation, the hook invalidates the user's profile query (`userKeys.profile(...)`). This is a key pattern in the app: any action that consumes credits triggers a refetch of the user's profile to ensure the credit balance displayed in the UI is always up-to-date.

**3. Key Functions and Hooks**

-   **`useTranslate()`**: The main hook that encapsulates the translation logic.
    -   It uses `useMutation` to perform the translation.
    -   `mutationFn`: This function calls the `translateTextApi` from the service layer to send the translation request.
    -   `onSuccess`: After a successful translation, this function invalidates the current user's profile query to update their credit balance.
    -   `onError`: Uses the `handleErrorUtility` for consistent error handling and toast notifications.

**In summary:**

The `useTranslate` hook provides a convenient and robust way to translate text within any component. It cleanly handles authentication, API calls, state management, and user credit updates, making it easy to integrate text translation functionality throughout the application.