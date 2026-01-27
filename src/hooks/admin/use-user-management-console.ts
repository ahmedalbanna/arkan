
'use client';

import { useAuth } from '@/context/AuthContext';
import { User } from '@/lib/models/user';
import { userKeys } from '@/lib/query-keys';
import { fetchUsersApi } from '@/services/api/userService';
import { getFirebaseAuthToken } from '@/lib/utils/authUtils';
import { useInfiniteQuery } from '@tanstack/react-query';

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
      const token = await getFirebaseAuthToken();
      const result = await fetchUsersApi(USERS_PER_PAGE, pageParam, token);
      // Instantiate User objects
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
