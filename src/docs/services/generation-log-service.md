
This code defines the service function for fetching AI generation logs from the backend.

**1. Purpose**

- The `generation-log-service.ts` file acts as the data-fetching layer for the generation logs feature, used primarily in the admin panel. Its purpose is to handle the `fetch` call to the `/api/admin/generations` endpoint.

**2. Key Concepts**

-   **Service Layer**: This file is a pure data-fetching module. It constructs the API request with the necessary parameters and headers but does not contain any state management or UI logic.
-   **Pagination and Filtering**: The `fetchGenerationLogs` function is designed to support server-side pagination and filtering. It accepts parameters like `page`, `limit`, `agentId`, and `userId` and constructs the appropriate query string to send to the backend.
-   **Authentication**: The function requires an admin's authentication token to be passed, which it includes in the `Authorization` header to secure the API request.
-   **Hook Integration**: This service is consumed by the `useInfiniteQuery` hook within the `src/components/admin/GenerationLogViewer.tsx` component, which manages the fetching, caching, and state for displaying the logs.

**In summary:**

The `generation-log-service.ts` file provides a clean and reusable function for fetching generation logs. By centralizing the API call here, the component that uses this data can remain focused on presentation and user interaction, adhering to the application's clean architectural pattern.
