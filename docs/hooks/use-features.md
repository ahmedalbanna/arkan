This code defines custom React hooks using TanStack Query to manage feature flag data.

**1. Purpose**

- The `use-features.ts` file provides hooks for fetching and updating feature flags. It is part of an admin interface for enabling or disabling application features. It follows a clean architecture where the hooks use functions from a dedicated service file (`src/services/feature-service.ts`) to interact with the backend API.

**2. Key Concepts**

-   **Service Layer (`src/services/feature-service.ts`)**: This file contains the `fetch` calls to the `/api/features` endpoints. It handles the raw network communication for getting and updating feature data.
-   **Hook Layer (`src/hooks/use-features.ts`)**: This file wraps the service functions with `useQuery` and `useMutation` from TanStack Query. It's responsible for caching, optimistic updates, and error handling.
-   **Optimistic Updates**: The `useUpdateFeature` hook implements an optimistic update. When a user toggles a feature, the UI updates instantly, before the server confirms the change. If the server call fails, the UI automatically reverts to its previous state. This provides a very responsive user experience.
-   **Authentication (`src/lib/authUtils.ts`)**: The `getAuthenticatedToken` utility provides a standardized way for the mutation hook to get the user's auth token for making secure API requests.
-   **Query Keys (`src/lib/query-keys.ts`)**: The `featureKeys` factory ensures that query keys are consistent, which is essential for the optimistic update and cache invalidation logic.

**3. Key Functions and Hooks**

-   **`useFeatures()`**: A `useQuery` hook that fetches the list of all feature flags by calling the `fetchFeaturesApi` service function. It caches this data for 5 minutes to reduce network requests.
-   **`useUpdateFeature()`**: A `useMutation` hook for toggling a feature.
    -   It calls the `updateFeatureApi` service function to persist the change.
    -   It uses the `onMutate` option to optimistically update the local cache before the API call completes.
    -   It uses `onError` to roll back the change if the API call fails.
    -   It uses `onSettled` to refetch the data from the server to ensure consistency.

**In summary:**

The `use-features.ts` file provides a robust and user-friendly way to manage feature flags. By separating the API logic into a service and using TanStack Query for optimistic updates and caching, it creates a clean, efficient, and highly responsive system for feature management.