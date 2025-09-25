# `useWritingTool` Hook

The `useWritingTool` hook is a generic and reusable factory for creating TanStack Query mutation hooks that interact with various AI writing tool API endpoints. Instead of creating a separate `useMutation` hook for each tool (e.g., `useRewrite`, `useHumanize`), this single hook centralizes the common logic, promoting code reuse and simplifying maintenance.

## Purpose & Design

The primary goal of this hook is to abstract away the boilerplate code involved in making authenticated API calls to writing tool endpoints. This includes:

-   Fetching the user's authentication token.
-   Calling the API endpoint.
-   Handling credit updates on success.
-   Providing standardized error handling with the option for custom overrides.

## Parameters

-   `endpoint: string`: The specific API route for the tool (e.g., `/api/ai/writing-tools/rewrite-text`).
-   `options?: { onSuccess?: (data, variables) => void; onError?: (error, variables) => void; }`: An optional object containing `onSuccess` and `onError` callback functions. This allows the calling component to define custom logic for handling the results of the API call.

## How It Works

1.  **Authentication**: It uses the `useAuth` hook to get the current `firebaseUser` and the `refetchUser` function.
2.  **`useMutation`**: It wraps TanStack Query's `useMutation` to manage the entire lifecycle of the API request (loading, success, error states).
3.  **`mutationFn`**: This is the core function that performs the API call. It first gets an authentication token via `getAuthenticatedToken` and then calls a generic `writingToolApi` function, passing the `endpoint`, the request `data`, and the `token`.
4.  **`onSuccess`**: When the API call is successful, it first calls `refetchUser()` to update the user's credit count. Then, it executes the custom `onSuccess` callback provided in the `options`, allowing the calling component to handle the returned data (e.g., updating the UI with the rewritten text).
5.  **`onError`**: If the API call fails, it first checks if a custom `onError` callback was provided. If so, it runs it. Otherwise, it falls back to the `handleErrorUtility` to show a generic error toast notification.

This design makes it very simple to add new writing tools to the application. A developer only needs to create the new API endpoint and then call the `useWritingTool` hook with the new route, without duplicating mutation logic.
