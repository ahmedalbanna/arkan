This code defines custom React hooks using TanStack Query to manage AI agent data. Let's break it down:

**1. Purpose**

- The `use-agents.ts` file provides React hooks for fetching, caching, and updating AI agent data. It follows a clean architecture where the hook itself doesn't contain `fetch` logic. Instead, it calls functions from `src/services/agent-service.ts` to interact with the backend API.

**2. Key Concepts**

-   **Service Layer (`src/services/agent-service.ts`)**: This file contains the actual `fetch` calls to the backend API (e.g., `/api/agents`). It's responsible for the raw network communication.
-   **Hook Layer (`src/hooks/use-agents.ts`)**: This file uses TanStack Query (`useQuery`, `useMutation`) to wrap the service functions. It manages the caching, state synchronization, and UI feedback (toasts, error handling).
-   **Authentication (`src/lib/authUtils.ts`)**: The `getAuthenticatedToken` utility function is used within the hooks to get the current user's ID token, which is then passed to the service functions for authorized API requests.
-   **Query Keys (`src/lib/query-keys.ts`)**: The `agentKeys` factory provides a consistent way to define query keys, which is crucial for caching and invalidation.

**3. Key Functions and Hooks**

-   **`useAgents()`**: A React hook that fetches a list of all AI agents.
    -   It uses `useQuery` to manage the data fetching lifecycle.
    -   It calls the `fetchAgents` function from the agent service to get the data.
    -   It caches the data for 5 minutes (`staleTime`).
-   **`useAgent(agentId: string)`**: A React hook that fetches a single agent by its ID.
    -   It uses `useQuery` and calls the `fetchAgent` service function.
-   **`useUpdateAgent()`**: A React hook that provides a mutation for updating an agent's configuration.
    -   It uses `useMutation` to handle the update operation.
    -   It calls the `updateAgentApi` service function to send the update request.
    -   On success, it invalidates the `agentKeys` queries to refetch the updated data and displays a success toast.

**4. Agent Editor**

The `AgentEditor` component, located in `src/components/admin/agent-editor/AgentEditor.tsx`, provides a user interface for configuring AI agents. It is divided into several tabs, each handling a specific aspect of the agent's configuration:
-   **General**: Contains basic settings like the agent's name, prompt, introduction, and conversation starters. It is implemented in `src/components/admin/agent-editor/GeneralTab.tsx`.
-   **Guidelines**: Allows for the addition of specific rules and instructions for the agent to follow.
-   **Knowledge**: Used to train the agent with dynamic knowledge from various sources.
-   **Tools**: Enables the selection of tools that the agent can use to perform actions.
-   **Context**: Configures the agent's ability to share and receive context from other agents.
-   **Automation**: Used to integrate the agent into automation workflows.

**In summary:**

The `use-agents.ts` file cleanly separates the concerns of data fetching and state management. The hooks provide a robust interface for components to interact with agent data, while the underlying services handle the direct API communication. This pattern makes the code more modular, testable, and easier to maintain. The `AgentEditor` component provides a comprehensive UI for configuring all aspects of an agent's behavior.
