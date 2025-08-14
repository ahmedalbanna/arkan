This document outlines the API endpoints for managing user projects, which involves full CRUD (Create, Read, Update, Delete) functionality.

### GET `/api/projects`

-   **Purpose**: Fetches a list of all projects belonging to the currently authenticated user.
-   **Usage**: Called by the `useProjects` hook on the "My Projects" page to display the project cards.
-   **Authentication**: Requires a valid user auth token.

### POST `/api/projects`

-   **Purpose**: Creates a new project document in Firestore.
-   **Payload**: Accepts a full `ProjectState` object, which includes the proposal, all report sections, diagrams, etc.
-   **Authentication**: Requires a valid user auth token to associate the project with the correct user.
-   **Usage**: Called by the `useSaveProject` mutation hook when a user saves a new project for the first time.

### GET `/api/projects/[id]`

-   **Purpose**: Retrieves the full data for a single project by its ID.
-   **Authentication**: This route verifies that the requester is the owner of the project before returning data.
-   **Usage**: Called by the `useProject` hook when a project is loaded into the builder.

### PUT `/api/projects/[id]`

-   **Purpose**: Updates an existing project document with new data.
-   **Authentication**: Verifies project ownership.
-   **Usage**: Called by the `useUpdateProject` mutation hook when a user saves changes to an already-saved project.

### DELETE `/api/projects/[id]`

-   **Purpose**: Permanently deletes a project document from Firestore.
-   **Authentication**: Verifies project ownership.
-   **Usage**: Called by the `useDeleteProject` mutation hook when a user confirms they want to delete a project from the "My Projects" page.
