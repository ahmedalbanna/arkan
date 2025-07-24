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

export const featureKeys = {
  all: ['features'] as const,
  lists: () => [...featureKeys.all, 'list'] as const,
  details: () => [...featureKeys.all, 'detail'] as const,
  detail: (featureId: string) => [...featureKeys.details(), featureId] as const,
};

export const teamKeys = {
    all: ['teams'] as const,
    lists: () => [...teamKeys.all, 'list'] as const,
    list: (filters: { userId: string }) => [...teamKeys.lists(), filters] as const,
    details: () => [...teamKeys.all, 'detail'] as const,
    detail: (teamId: string) => [...teamKeys.details(), teamId] as const,
}

export const transactionKeys = {
    all: ['transactions'] as const,
    lists: () => [...transactionKeys.all, 'list'] as const,
    pending: () => [...transactionKeys.lists(), 'pending'] as const,
}

export const generationLogKeys = {
    all: ['generation-logs'] as const,
    lists: () => [...generationLogKeys.all, 'list'] as const,
    list: (filters: { page: number; limit: number; agentId?: string; userId?: string; }) => [...generationLogKeys.lists(), filters] as const,
}

export const adminKeys = {
  all: ['admin'] as const,
  dashboardStats: () => [...adminKeys.all, 'dashboard-stats'] as const,
}

export const templateKeys = {
    all: ['templates'] as const,
    proposals: () => [...templateKeys.all, 'proposal'] as const,
    reports: () => [...templateKeys.all, 'report'] as const,
    presentations: () => [...templateKeys.all, 'presentation'] as const,
}

export const projectKeys = {
    all: ['projects'] as const,
    lists: () => [...projectKeys.all, 'list'] as const,
    details: () => [...projectKeys.all, 'detail'] as const,
    detail: (projectId: string) => [...projectKeys.details(), projectId] as const,
}

export const homeworkKeys = {
    all: ['homework'] as const,
    history: (userId?: string) => [...homeworkKeys.all, 'history', userId] as const,
};
