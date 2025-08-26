This code defines custom React hooks using TanStack Query for managing templates (proposal, report, and presentation templates).

**1. Purpose**

- The `use-templates.ts` file provides hooks for fetching and updating the various generation templates used throughout the application. It follows the project's standard architecture by separating API logic into a dedicated service file, `src/services/template-service.ts`.

**2. Key Concepts**

-   **Service Layer (`src/services/template-service.ts`)**: Contains all the `fetch` calls to the `/api/templates/*` endpoints. It handles the raw network communication for fetching and updating proposal, report, and presentation templates.
-   **Hook Layer (`src/hooks/use-templates.ts`)**: This file uses `useQuery` and `useMutation` from TanStack Query to wrap the service functions. It is responsible for caching the template data, handling mutations, and providing UI feedback via toasts.
-   **Authentication (`src/lib/authUtils.ts`)**: The mutation hooks use the `getAuthenticatedToken` utility to get the admin's auth token for secure API requests.
-   **Query Keys (`src/lib/query-keys.ts`)**: The `templateKeys` factory provides structured and consistent query keys, making it easy to manage the cache for different template types (e.g., `templateKeys.proposals()`, `templateKeys.reports()`).

**3. Key Functions and Hooks**

-   **`useProposalTemplates()`**, **`useReportTemplates()`**, **`usePresentationTemplates()`**: A set of `useQuery` hooks, each responsible for fetching its specific type of template by calling the corresponding function from the `template-service`. They cache the data to improve performance.
-   **`useUpdateProposalTemplate()`**, **`useUpdateReportTemplate()`**, **`useUpdatePresentationTemplate()`**: A set of `useMutation` hooks for updating each type of template.
    -   Each mutation calls its corresponding `update...` function from the `template-service`.
    -   On success, they invalidate the appropriate query in the cache (e.g., `queryClient.invalidateQueries({ queryKey: templateKeys.proposals() })`) to ensure the UI is refreshed with the latest data.
    -   They also display a success toast to confirm the update.

**In summary:**

The `use-templates.ts` file provides a clean and organized way to manage all template-related data. By using a dedicated service for API calls and leveraging TanStack Query for caching and mutations, the hooks offer a robust and maintainable interface for the admin panel components to interact with template configurations.