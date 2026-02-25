
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { userKeys } from '@/lib/query-keys';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/modules/users/domain/entities/User';
import { container } from '@/infrastructure/di/container';
import { UserApiClient } from '@/modules/users/adapters/api-client/UserApiClient';

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
      if (!firebaseUser) throw new Error("User not authenticated");
      const token = await firebaseUser.getIdToken();
      const client = container.resolve(UserApiClient);
      const result = await client.getPaginatedUsers({ limit: USERS_PER_PAGE, lastVisibleId: pageParam }, token);
      // Instantiate User objects
      return {
          ...result,
          users: result.users.map((u: any) => new User(u)),
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
