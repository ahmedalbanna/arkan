This document describes the API endpoints for managing feature flags.

### GET `/api/features`

-   **Purpose**: To retrieve the list of all available feature flags and their current status (enabled/disabled).
-   **Access**: This is a public endpoint. All users need to know which features are active to render the UI correctly (e.g., showing or hiding tabs in the Builder).
-   **Seeding**: If the `features` collection in Firestore is empty, this endpoint automatically seeds it with the default feature configurations defined in `src/lib/features.ts`.

### PUT `/api/features/[id]`

-   **Purpose**: To update the status of a single feature flag (i.e., to enable or disable it).
-   **Access**: This is a protected endpoint that can only be accessed by users with an 'admin' role.
-   **Payload**: Accepts a JSON body with a single boolean field: `{ "isEnabled": true }`.
-   **Usage**: Called by the `useUpdateFeature` mutation hook when an admin toggles a feature switch in the `FeatureManager` component.