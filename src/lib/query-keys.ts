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
  all: () => ['users'] as const,
  lists: () => [...userKeys.all(), 'list'] as const,
  list: (options: { limit: number; lastVisibleId?: string | null }) => [...userKeys.lists(), options] as const,
  details: () => [...userKeys.all(), 'detail'] as const,
  profile: (userId: string) => [...userKeys.details(), userId] as const,
  admins: () => [...userKeys.all(), 'admins'] as const,
};

export const featureKeys = {
  all: () => ['features'] as const,
  lists: () => [...featureKeys.all(), 'list'] as const,
  details: () => [...featureKeys.all(), 'detail'] as const,
  detail: (featureId: string) => [...featureKeys.details(), featureId] as const,
};

export const settingsKeys = {
  all: () => ['settings'] as const,
  public: () => [...settingsKeys.all(), 'public'] as const,
};

export const transactionKeys = {
  all: () => ['transactions'] as const,
  lists: () => [...transactionKeys.all(), 'list'] as const,
  list: (identifier: 'pending' | 'verified' | 'rejected' | string) => [...transactionKeys.lists(), { identifier }] as const,
};

export const generationLogKeys = {
  all: () => ['generation-logs'] as const,
  lists: () => [...generationLogKeys.all(), 'list'] as const,
  list: (filters: { agentId?: string; userId?: string }) => [...generationLogKeys.lists(), filters] as const,
};

export const adminKeys = {
  all: () => ['admin'] as const,
  dashboardStats: () => [...adminKeys.all(), 'dashboard-stats'] as const,
};

export const analyticsKeys = {
  all: () => ['analytics'] as const,
  userStats: (userId: string) => [...analyticsKeys.all(), 'user-stats', userId] as const,
};

export const projectKeys = {
  all: (userId: string) => ['projects', userId] as const,
  lists: (userId: string) => [...projectKeys.all(userId), 'list'] as const,
  details: (userId: string) => [...projectKeys.all(userId), 'detail'] as const,
  detail: (userId: string, projectId: string) => [...projectKeys.details(userId), projectId] as const,
};

export const homeworkKeys = {
  all: () => ['homework'] as const,
  history: (userId?: string) => [...homeworkKeys.all(), 'history', userId] as const,
};

export const notificationKeys = {
  all: () => ['notifications'] as const,
  lists: () => [...notificationKeys.all(), 'list'] as const,
};

export const sectionKeys = {
  all: () => ['sections'] as const,
  lists: () => [...sectionKeys.all(), 'list'] as const,
  detail: (id: string) => [...sectionKeys.all(), 'detail', id] as const,
};

export const agentKeys = {
  all: () => ['agents'] as const,
  categories: () => [...agentKeys.all(), 'categories'] as const,
};

export const templateKeys = {
  all: () => ['templates'] as const,
  docx: () => [...templateKeys.all(), 'docx'] as const,
  pptx: () => [...templateKeys.all(), 'pptx'] as const,
  report: () => [...templateKeys.all(), 'report'] as const,
  presentation: () => [...templateKeys.all(), 'presentation'] as const,
  lists: (type: 'docx' | 'pptx' | 'report' | 'presentation') => [...templateKeys.all(), type, 'list'] as const,
  details: (type: 'docx' | 'pptx' | 'report' | 'presentation') => [...templateKeys.all(), type, 'detail'] as const,
  detail: (type: 'docx' | 'pptx' | 'report' | 'presentation', id: string) => [...templateKeys.details(type), id] as const,
};

export const writingToolKeys = {
  all: () => ['writing-tools'] as const,
  tool: (name: string) => [...writingToolKeys.all(), name] as const,
};

export const ragKeys = {
  all: () => ['rag'] as const,
  documents: () => [...ragKeys.all(), 'documents'] as const,
};
