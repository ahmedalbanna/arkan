# Arkan Application: React Query Guide

This document outlines the conventions and patterns for using TanStack React Query within the Arkan application. Following these guidelines ensures that our data fetching is consistent, efficient, and easy to maintain.

## 1. Overview & Core Concepts

We use **React Query** to manage all asynchronous operations and server state. This lets us remove boilerplate `useEffect` and `useState` logic from our components and centralizes the complexities of data fetching, caching, and state synchronization.

-   **`QueryClientProvider`**: Our entire application is wrapped in this provider in `src/components/QueryProvider.tsx`, which is used in the root `layout.tsx`. This makes the query client available everywhere.
-   **Query Function**: A simple async function that fetches data and returns a promise. It's responsible for one thing: getting the data.
-   **Mutation Function**: An async function that creates, updates, or deletes data on the server.

---

## 2. Query Key Factories (`src/lib/query-keys.ts`)

To ensure consistency and avoid typos, we **always** use the query key factories defined in `src/lib/query-keys.ts`.

-   **Structure**: Keys are organized by data domain (e.g., `userKeys`, `agentKeys`).
-   **Specificity**: Keys go from general to specific (e.g., `userKeys.all` -> `userKeys.lists()` -> `userKeys.list(page)`).

### Example Usage:

```typescript
import { userKeys } from '@/lib/core/query-keys';

// Key for a list of users on a specific page
const listKey = userKeys.list(1); // Returns ['users', 'list', { page: 1 }]

// Key for a specific user's profile
const profileKey = userKeys.profile('user-123'); // Returns ['users', 'detail', 'user-123']
```

Using these factories is crucial for the cache invalidation strategy.

---

## 3. Custom Hooks for Data Fetching

All React Query logic (`useQuery`, `useMutation`) **must** be encapsulated within a custom hook, organized by data domain (e.g., `src/hooks/use-user.ts`). This keeps components clean and logic reusable.

### Custom Query Hook (`useQuery`)

A custom hook for fetching data should:
1.  Use the query key factory.
2.  Call the query function.
3.  Include sensible defaults like `staleTime`.

**Example: `src/hooks/use-user.ts`**
```typescript
import { useQuery } from '@tanstack/react-query';
import { userKeys } from '@/lib/core/query-keys';

async function fetchUserProfile(userId: string): Promise<UserProfile> {
  // ... fetch logic
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.profile(userId), // Use the factory
    queryFn: () => fetchUserProfile(userId),
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
    enabled: !!userId, // Only run if userId is provided
  });
}
```

### Custom Mutation Hook (`useMutation`)

A custom hook for mutations should:
1.  Define the mutation function.
2.  Use `useQueryClient` to get access to the cache.
3.  Implement `onSuccess` to invalidate relevant queries. This is our primary pattern for ensuring the UI updates after a change.
4.  Implement `onError` to show user-friendly feedback via `toast`.

**Example: `src/hooks/use-user.ts`**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks';

async function purchasePlan(plan: PricingPlan): Promise<{ newBalance: number }> {
    // ... fetch logic for purchase
}

export function usePurchaseCredits() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: purchasePlan,
        onSuccess: (data, plan) => {
            // Invalidate all queries related to users
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast({ title: 'Purchase Successful!' });
        },
        onError: (error: Error) => {
            toast({ title: 'Purchase Failed', description: error.message, variant: 'destructive' });
        },
    });
}
```

---

## 4. Testing Strategy

Our testing strategy focuses on mocking at the API layer (`fetch`) or the custom hook layer.

1.  **Testing Hooks**: We use `@testing-library/react`'s `renderHook` function. We wrap our hook in the `QueryClientProvider` and mock the global `fetch` function to return expected data or errors. See `__tests__/hooks/use-user.test.tsx` for a complete example.

2.  **Testing Components**: For components, we mock the custom hook itself using `jest.mock('@/hooks')`. This lets us easily test how the component renders in different states (`isLoading`, `isError`, etc.) by controlling what the mocked hook returns. See `__tests__/components/PricingCard.test.tsx` for a complete example.
