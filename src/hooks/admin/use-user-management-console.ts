
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { userKeys } from '@/lib/query-keys';
import { fetchUsersApi } from '@/services/api/userService';
import { useAuth } from '@/context/NextAuthContext';
import { User } from '@/lib/models/user';

const USERS_PER_PAGE = 10;

export function useUserManagementConsole() {
  const { data: session, status: sessionStatus } = useSession();

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
      if (!session?.user?.id) throw new Error("User not authenticated");
      const token = session.user.id;
      const result = await fetchUsersApi(USERS_PER_PAGE, pageParam, token);
      // Instantiate User objects
      return {
          ...result,
          users: result.users.map(u => new User(u)),
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.lastVisibleId : undefined,
    enabled: sessionStatus === "authenticated",
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
