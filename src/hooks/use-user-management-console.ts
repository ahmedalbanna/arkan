
'use client';

import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/hooks';
import { User } from '@/lib/models/user';

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

  const allUsers: User[] = data?.pages.flatMap(page => (page as any).users) ?? [];

  const isLoading = isFetching || authIsLoading;
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
