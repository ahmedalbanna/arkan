The documentation explicitly outlines the roles of each layer:

- **Services (`src/services`)**: Responsible for direct API communication (`fetch` calls) [1, 3]. They are simple, focused functions.
- **Hooks (`src/hooks`)**: Utilize services to interact with APIs and manage data fetching and state using libraries like React Query (`useQuery`, `useMutation`) [1, 3]. They connect the data layer to the UI.
- **Components (`src/components`)**: Consume data and mutations provided by hooks to render the UI and handle user interactions [1]. They do not directly perform data fetching.
- **API Routes (`app/api`)**: These are the backend endpoints that the services communicate with.
