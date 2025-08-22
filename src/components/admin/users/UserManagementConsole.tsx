
      
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
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, PlusCircle, MessageSquare } from 'lucide-react';
import { useUsers } from '@/hooks/use-user';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/AuthContext';
import { CreateUserDialog } from '@/components/admin/users/CreateUserDialog';
import { UserTable } from '@/components/admin/users/UserTable';
import { UserTableSkeleton } from '@/components/admin/users/UserTableSkeleton';

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
  } = useUsers();

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
                        {isFetchingNextPage ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
                        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                    </Button>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}

    