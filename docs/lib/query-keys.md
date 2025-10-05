
This document explains the purpose and usage of the query key factories defined in `src/lib/query-keys.ts`.

## 1. Purpose

-   This file centralizes the creation of all keys used by **TanStack React Query**.
-   The primary goal is to eliminate "magic strings" and prevent typos when fetching, caching, and invalidating data. By using these factory functions, we ensure that a query's key is always structured consistently throughout the application.

## 2. Key Concepts

-   **Query Key Factory**: A simple object that contains functions for generating query keys. Each key is an array that uniquely identifies a piece of server state.
-   **Structure and Specificity**: The keys are structured hierarchically, moving from the general domain to more specific details.
    -   `userKeys.all`: `['users']` - Invalidate this to refetch everything related to users.
    -   `userKeys.lists()`: `['users', 'list']` - Targets all lists of users.
    -   `userKeys.list(1)`: `['users', 'list', { page: 1 }]` - Targets a specific page in a paginated list.
    -   `userKeys.profile('user-123')`: `['users', 'detail', 'user-123']` - Targets a specific user's profile.

## 3. Usage Example

When fetching data with `useQuery`:

```typescript
// In a hook
const { data } = useQuery({
  queryKey: userKeys.profile('user-123'),
  queryFn: () => fetchUserProfile('user-123', token),
});
```

When invalidating data after a mutation:

```typescript
// In a mutation's onSuccess callback
queryClient.invalidateQueries({ queryKey: userKeys.lists() });
```

This pattern is fundamental to how the application manages server state. It allows different components and hooks to share the same cached data and provides a reliable way to trigger refetches after data has been updated on the server.
