/**
 * Query Key Factories for React Query
 * 
 * This file centralizes the creation of query keys to ensure consistency
 * and prevent typos. Using factories makes it easy to manage complex
 * keys and invalidate queries from anywhere in the application.
 * 
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (page: number) => [...userKeys.lists(), { page }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  profile: (userId: string) => [...userKeys.details(), userId] as const,
};

export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (agentId: string) => [...agentKeys.details(), agentId] as const,
};

// Add factories for other data domains as needed...
// export const reportKeys = { ... }
