
This document outlines the API endpoints responsible for managing AI agent configurations. These endpoints are protected and can only be accessed by admin users.

### GET `/api/admin/agents`

-   **Purpose**: Retrieves a complete list of all AI agent configurations stored in Firestore.
-   **Seeding**: If the `agents` collection in Firestore is empty, this endpoint automatically seeds it with the default agent configurations defined in `src/lib/agents.ts`. This ensures the application has a baseline set of agents to work with on first run.
-   **Hydration**: It merges the stored data (like `name`, `prompt`, `isEnabled`) with static data from the default configuration (like the `icon`), ensuring the frontend receives a complete agent object.

### GET `/api/admin/agents/[id]`

-   **Purpose**: Fetches the detailed configuration for a single agent, identified by its `id`.
-   **Usage**: Called by the `AgentEditor` component when an admin edits a specific agent.

### PUT `/api/admin/agents/[id]`

-   **Purpose**: Updates the configuration for a specific agent.
-   **Payload**: Accepts a JSON body with the fields to be updated, such as `name`, `prompt`, and `isEnabled`. The Zod schema ensures the payload is valid.
-   **Logic**: It intelligently handles prompt updates. If the agent has a complex prompt object (with a `base` and `guidelines`), it only updates the `base` property. If it's a simple string prompt, it updates the whole string.
-   **Usage**: This is the endpoint called by the `useUpdateAgent` mutation hook when an admin saves changes in the `AgentEditor`.

