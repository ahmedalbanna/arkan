This document describes the API endpoint for viewing the log of all AI generation events.

**Endpoint**: `GET /api/generations`

**1. Purpose**

-   This endpoint is designed for administrative use, allowing administrators to review the history of all AI generations that have occurred across the platform. It provides valuable data for monitoring usage, debugging, and understanding how different AI agents are being used.

**2. Key Concepts**

-   **Admin-Only Access**: The endpoint is protected and requires an admin-level authentication token.
-   **Pagination**: To handle potentially large volumes of logs, the endpoint supports cursor-based pagination using `page` and `limit` query parameters.
-   **Filtering**: It supports server-side filtering by `agentId` and/or `userId`, allowing admins to narrow down the results.
-   **Usage**: It is called by the `GenerationLogViewer` component in the admin panel.

**3. Workflow**

1.  An admin navigates to the "Activity History" page in the admin panel.
2.  The `GenerationLogViewer` component's `useQuery` hook calls this endpoint with the current page, limit, and any active filters.
3.  The route handler authenticates the admin.
4.  It constructs a Firestore query based on the pagination and filter parameters.
5.  It fetches the relevant log documents from the `agent_generations` collection.
6.  It returns the list of logs and a `hasNextPage` boolean to the client to enable/disable the "Next Page" button.
