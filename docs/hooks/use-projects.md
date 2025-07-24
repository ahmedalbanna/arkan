This code defines custom React hooks using TanStack Query to manage project data.

**1. Purpose**

- The `use-projects.ts` file provides a complete set of hooks for performing CRUD (Create, Read, Update, Delete) operations on user projects. It follows a clean architecture by separating API logic into a dedicated service file, `src/services/project-service.ts`.

**2. Key Concepts**

-   **Service Layer (`src/services/project-service.ts`)**: This file contains all the `fetch` calls to the `/api/projects` endpoints. It handles the raw network communication for fetching, creating, updating, and deleting projects.
-   **Hook Layer (`src/hooks/use-projects.ts`)**: This file uses `useQuery` and `useMutation` from TanStack Query to wrap the service functions. It manages data caching, server state synchronization, and user feedback (e.g., toast notifications).
-   **Authentication (`src/lib/authUtils.ts`)**: The hooks use the `getAuthenticatedToken` utility to securely get the user's ID token, which is then passed to the service functions to authorize API requests.
-   **Query Keys (`src/lib/query-keys.ts`)**: The `projectKeys` factory provides consistent and structured query keys, making it easy to manage the cache and trigger refetches after mutations.
-   **Zustand Integration (`useBuilderStore`)**: The mutation hooks (`useSaveProject`, `useUpdateProject`) interact with the `useBuilderStore` to update the global client state, such as setting the `currentProjectId` after a new project is saved or clearing the `hasUnsavedChanges` flag.

**3. Key Functions and Hooks**

-   **`useProjects()`**: Fetches a list of all projects belonging to the authenticated user by calling the `fetchProjectsApi` service.
-   **`useProject(projectId)`**: Fetches the complete data for a single project by calling the `fetchProjectApi` service.
-   **`useSaveProject()`**: A mutation hook that calls the `createProject` service to save a new project. On success, it updates the `useBuilderStore` and invalidates the project list to refresh the UI.
-   **`useUpdateProject()`**: A mutation hook that calls the `updateProject` service to save changes to an existing project. It also updates the `useBuilderStore` and invalidates the relevant queries.
-   **`useDeleteProject()`**: A mutation hook that calls the `deleteProject` service. On success, it invalidates the project list query.

**In summary:**

The `use-projects.ts` file is a prime example of the application's clean data management architecture. It provides a clear, reusable, and robust set of hooks for all project-related server interactions, while keeping the underlying API calls neatly encapsulated in a separate service file. This separation makes the codebase easier to understand, maintain, and test.