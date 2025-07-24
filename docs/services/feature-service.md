This code defines the service layer for interacting with the feature flag API endpoints.

**1. Purpose**

- The `feature-service.ts` file contains the raw `fetch` calls for getting and updating the application's feature flags. It's the lowest level of communication with the `/api/features` backend.

**2. Key Concepts**

-   **Service Layer**: This file is dedicated to network requests. It has no knowledge of React or state management; it simply sends requests to the API and handles the responses.
-   **Public vs. Authenticated Endpoints**:
    -   The `fetchFeatures` function calls a public endpoint (`GET /api/features`) that does not require an auth token, as all users need to know which features are enabled.
    -   The `updateFeature` function calls a protected endpoint (`PUT /api/features/[id]`) and requires an admin's auth token to be passed in the `Authorization` header.
-   **Hook Integration**: These functions are consumed by the custom hooks in `src/hooks/use-features.ts`. The hooks (`useFeatures`, `useUpdateFeature`) use these services to fetch data for `useQuery` and to perform actions for `useMutation`.

**3. Key Functions**

-   **`fetchFeatures()`**: Makes a `GET` request to retrieve the list of all feature flags.
-   **`updateFeature(variables, token)`**: Makes a `PUT` request to update the `isEnabled` status of a specific feature.

**In summary:**

The `feature-service.ts` file perfectly illustrates the separation of concerns in the application's architecture. It isolates all `fetch` logic related to feature flags, providing a clean API for the `use-features.ts` hooks to consume.