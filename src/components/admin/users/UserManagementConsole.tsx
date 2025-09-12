
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { CreateUserDialog } from './CreateUserDialog';
import { UserTable } from './UserTable';
import { UserTableSkeleton } from './UserTableSkeleton';
import { useUserManagementConsole } from '@/hooks';
import { User } from '@/lib/models/user';

export default function UserManagementConsole() {
  const { t } = useLocalization();

  const {
    allUsers,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useUserManagementConsole();

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
                <UserTable users={allUsers as User[]} />
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
