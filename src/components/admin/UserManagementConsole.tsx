
'use client';

import { useState } from 'react';
import type { UserProfile } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/lib/query-keys';
import { fetchUsers, type UserListResponse } from '@/services/user-service';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/AuthContext';
import { CreateUserDialog } from './users/CreateUserDialog';
import { UserTable } from './users/UserTable';
import { UserTableSkeleton } from './users/UserTableSkeleton';

const USERS_PER_PAGE = 10;

export default function UserManagementConsole() {
  const { t } = useLocalization();
  const { firebaseUser, isLoading: authIsLoading } = useAuth();
  
  const { 
    data, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetching, 
    isFetchingNextPage, 
    status 
  } = useInfiniteQuery<UserListResponse>({
      queryKey: userKeys.lists(),
      queryFn: async ({ pageParam }) => {
          if (!firebaseUser) throw new Error("User not authenticated");
          const token = await firebaseUser.getIdToken();
          return fetchUsers(USERS_PER_PAGE, pageParam, token);
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.lastVisibleId : undefined,
      enabled: !!firebaseUser
  });

  const allUsers = data?.pages.flatMap(page => page.users) ?? [];

  const isLoading = status === 'pending' || authIsLoading;
  const isError = status === 'error';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
                <span>{t('manageUsers.cardTitle')}</span>
                 {isFetching && !isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            </CardTitle>
            <CreateUserDialog />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <UserTableSkeleton />
        ) : isError ? (
            <div className="p-8 text-center text-destructive">
                 <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>{t('manageUsers.errorLoading')}: {error?.message}</p>
            </div>
        ) : (
            <>
                <UserTable users={allUsers} />
                <div className="flex items-center justify-center pt-8">
                    <Button
                        onClick={() => fetchNextPage()}
                        disabled={!hasNextPage || isFetchingNextPage}
                    >
                        {isFetchingNextPage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                    </Button>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
