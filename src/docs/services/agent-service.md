This code defines the service layer for all AI agent-related API interactions.

**1. Purpose**

- The `agent-service.ts` file is responsible for all raw `fetch` calls to the `/api/agents` backend endpoints. It handles the direct network communication for fetching agent lists, fetching a single agent's details, and sending update requests.

**2. Key Concepts**

-   **Service Layer**: This file strictly contains API interaction logic. It does not manage state or have any React-specific code. It simply makes requests and returns the resulting data or throws an error.
-   **Authentication**: Each function requires an authentication token, which is passed in to be included in the `Authorization` header of the `fetch` request, ensuring that only authorized (admin) users can access these endpoints.
-   **Hook Integration**: These service functions are not called directly by components. Instead, they are used by the custom hooks in `src/hooks/use-agents.ts` (`useAgents`, `useAgent`, `useUpdateAgent`), which manage the React Query state, caching, and UI feedback.

**3. Key Functions**

-   **`fetchAgents(token)`**: Performs a `GET` request to `/api/agents` to retrieve the full list of agent configurations.
-   **`fetchAgent(agentId, token)`**: Performs a `GET` request to `/api/agents/[id]` to get a single agent's data.
-   **`updateAgent(variables, token)`**: Performs a `PUT` request to `/api/agents/[id]` with a new payload to update an agent's configuration.

**In summary:**

The `agent-service.ts` file provides a clean and isolated set of functions for interacting with the agent API. This separation of concerns allows the corresponding React hooks to focus on state management and caching, leading to a more organized and maintainable codebase.
