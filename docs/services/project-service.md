This code defines the service layer for all project-related CRUD (Create, Read, Update, Delete) operations.

**1. Purpose**

- The `project-service.ts` file is responsible for all direct `fetch` calls to the `/api/projects` endpoints. It abstracts away the raw network communication, providing a clean set of async functions for managing project data.

**2. Key Concepts**

-   **Service Layer**: This file is a core part of the service layer. It contains no React-specific logic and is solely focused on API interactions. Each function maps directly to a backend REST endpoint.
-   **Authentication**: Every function in this service requires a user's authentication token. This token is included in the `Authorization` header of each request to ensure that users can only access and modify their own projects.
-   **Hook Integration**: These service functions are the foundation for the custom hooks defined in `src/hooks/use-projects.ts`. The `useProjects`, `useProject`, `useSaveProject`, `useUpdateProject`, and `useDeleteProject` hooks use these services to power their `useQuery` and `useMutation` calls.

**3. Key Functions**

-   **`fetchProjects(token)`**: Retrieves a list of all projects for the authenticated user.
-   **`fetchProject(projectId, token)`**: Retrieves the full data for a single project.
-   **`createProject(data, token)`**: Sends a new project's data to be saved to the database.
-   **`updateProject(projectId, data, token)`**: Sends updated data for an existing project.
-   **`deleteProject(projectId, token)`**: Sends a request to delete a project.

**In summary:**

The `project-service.ts` file provides a robust and secure layer for all project data management. By keeping the `fetch` logic here, the corresponding hooks can focus on state management, caching, and UI feedback, creating a clean separation of concerns.