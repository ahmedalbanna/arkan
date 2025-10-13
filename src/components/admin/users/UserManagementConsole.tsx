
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { useUserManagementConsole } from '@/hooks';
import { User } from '@/lib/models/user';
import { AlertCircle, Loader2, Users } from 'lucide-react';
import { CreateUserDialog } from './CreateUserDialog';
import { UserTable } from './UserTable';
import { UserTableSkeleton } from './UserTableSkeleton';

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
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg font-headline font-semibold flex items-center gap-2">
                    <span>{t('manageUsers.cardTitle')}</span>
                     {isFetching && !isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                </CardTitle>
              </div>
              <CreateUserDialog />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
              <UserTableSkeleton />
          ) : isError ? (
              <AnimatedContainer animation="fade-in-up" delay={200}>
                <Card variant="glass" className="p-8 text-center backdrop-blur-md shadow-soft">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-gradient-to-br from-destructive to-destructive/80 shadow-glow">
                      <AlertCircle className="h-12 w-12 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-headline font-semibold mb-2">Error Loading Users</h2>
                      <p className="text-muted-foreground">
                        {t('manageUsers.errorLoading')}: {error?.message}
                      </p>
                    </div>
                  </div>
                </Card>
              </AnimatedContainer>
          ) : (
              <>
                  <UserTable users={allUsers as User[]} />
                  <div className="flex items-center justify-center pt-8">
                      <Button
                          onClick={() => fetchNextPage()}
                          disabled={!hasNextPage || isFetchingNextPage}
                          variant="gradient"
                          className="hover:shadow-glow transition-all duration-200"
                      >
                          {isFetchingNextPage ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
                          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                      </Button>
                  </div>
              </>
          )}
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}
