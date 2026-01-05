
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { userKeys } from '@/lib/query-keys';
import { listUsersAction } from '@/app/actions/userActions';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/lib/models/user';

const USERS_PER_PAGE = 10;

export function useUserManagementConsole() {
  const { firebaseUser, isLoading: authLoading } = useAuth();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading: usersLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: userKeys.lists(),
    queryFn: async ({ pageParam }) => {
      // Server actions handle authentication, no need to pass a token
      const result = await listUsersAction({ limit: USERS_PER_PAGE, lastVisibleId: pageParam });
      // Instantiate User objects to ensure class methods are available
      return {
          ...result,
          users: result.users.map(u => new User(u)),
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.lastVisibleId : undefined,
    enabled: !authLoading && !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const allUsers = data?.pages.flatMap(page => page.users) ?? [];

  return {
    allUsers,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading: usersLoading || authLoading,
    isError,
  };
}
