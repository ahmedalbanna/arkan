'use client';

import { useUsers } from '@/hooks/use-user';
import { useAuth } from '@/context/AuthContext';

export function useUserManagementConsole() {
  const { isLoading: authIsLoading } = useAuth();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status
  } = useUsers();

  const allUsers = data?.pages.flatMap(page => page.users) ?? [];

  const isLoading = status === 'pending' || authIsLoading;
  const isError = status === 'error';

  return {
    allUsers,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
  };
}
