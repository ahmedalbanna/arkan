This code defines the service layer for text translation functionality.

**1. Purpose**

- The `translation-service.ts` file is responsible for making the raw `fetch` call to the `/api/translate` backend endpoint. Its sole purpose is to send text to the server for translation and return the result.

**2. Key Concepts**

-   **Service Layer**: This file is a simple and focused part of the service layer. It contains only the network request logic and is completely decoupled from any React components or state management.
-   **Authentication**: The `translateText` function requires a user's authentication token, which is passed in the `Authorization` header. This ensures that only authenticated users can use the translation service and that their credit usage can be tracked on the backend.
-   **Hook Integration**: This service is consumed by the `useTranslate` custom hook in `src/hooks/use-translation.ts`. The `useTranslate` hook uses this service function within its `useMutation` call to handle the asynchronous state, error handling, and subsequent cache invalidation of the user's profile (to update their credit balance).

**In summary:**

The `translation-service.ts` file provides a clean, reusable function for accessing the translation API. This follows the application's architectural pattern of separating API calls into services and state management into hooks.