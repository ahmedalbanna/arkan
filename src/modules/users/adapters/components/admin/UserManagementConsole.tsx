
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { CreateUserDialog } from './CreateUserDialog';
import { UserTable } from './UserTable';
import { UserTableSkeleton } from './UserTableSkeleton';
import { useUserManagementConsole } from '@/modules/admin/adapters/hooks/use-user-management-console';
import { User } from '@/modules/users/domain/entities/User';

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
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                {t('manageUsers.cardTitle')}
            </h3>
            {isFetching && !isFetchingNextPage && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary/40" />}
        </div>
        <CreateUserDialog />
      </header>
      
      <CardContent className="p-8 md:p-10">
        {isLoading ? (
            <UserTableSkeleton />
        ) : isError ? (
            <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-destructive/5 text-destructive border-destructive/20 max-w-md mx-auto">
                 <AlertCircle className="mx-auto h-10 w-10 mb-4 opacity-40" />
                 <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Directory Error</h4>
                 <p className="text-[11px] italic leading-relaxed px-8 opacity-80">{t('manageUsers.errorLoading')}: {error?.message}</p>
            </div>
        ) : (
            <div className="space-y-10">
                <div className="rounded-2xl border bg-background overflow-hidden shadow-sm shadow-black/[0.02]">
                    <UserTable users={allUsers as User[]} />
                </div>
                
                {hasNextPage && (
                    <div className="flex items-center justify-center">
                        <Button
                            variant="outline"
                            onClick={() => fetchNextPage()}
                            disabled={!hasNextPage || isFetchingNextPage}
                            className="font-bold h-10 px-8 gap-2 rounded-xl shadow-lg shadow-black/[0.03] transition-all hover:bg-primary/5 hover:text-primary active:scale-95"
                        >
                            {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isFetchingNextPage ? 'Synchronizing...' : 'Load Additional Records'}
                        </Button>
                    </div>
                )}
            </div>
        )}
      </CardContent>
      
      <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
              Arkan User Directory • Auth Node V1.0
          </p>
          <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-4 text-[8px] uppercase tracking-tighter text-muted-foreground/60 border-border/60">
                  {allUsers.length} active records
              </Badge>
          </div>
      </footer>
    </Card>
  );
}
