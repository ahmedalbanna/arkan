'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { userKeys } from '@/infrastructure/api/query-keys';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/modules/users/domain/entities/User';
import { UserApiClient } from '@/modules/users/adapters/api-client/UserApiClient';
import { container } from '@/infrastructure/di/container';

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
      const client = container.resolve(UserApiClient);
      const result = await client.getPaginatedUsers({ limit: USERS_PER_PAGE, lastVisibleId: pageParam });
      if (result.isFailure) throw result.error;
      const data = result.getValue();

      return {
        ...data,
        users: data.users.map((user) => new User(user)),
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.lastVisibleId ?? undefined : undefined),
    enabled: !authLoading && Boolean(firebaseUser),
    staleTime: 1000 * 60 * 5,
  });

  const allUsers = data?.pages.flatMap((page) => page.users) ?? [];

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
