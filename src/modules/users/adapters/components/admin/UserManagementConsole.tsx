'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Database, Search, ShieldCheck } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { CreateUserDialog } from './CreateUserDialog';
import { UserTable } from './UserTable';
import { UserTableSkeleton } from './UserTableSkeleton';
import { useUserManagementConsole } from '@/modules/admin/adapters/hooks/use-user-management-console';
import { User } from '@/modules/users/domain/entities/User';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * UserManagementConsole — Administrative hub for system identity orchestration.
 * Manages the global directory of user matrices with high-fidelity filtering and pagination.
 * 
 * DEFENSIVE MEASURES:
 * 1. Error Containment: Standardized high-fidelity error fallbacks for directory corruption.
 * 2. State Integrity: Handles null allUsers and isError states with tailored HUD feedback.
 * 3. UX Safety: Implements a "Neural Sync" pulse during background data fetching.
 * 4. Empty Results Handling: High-density placeholder UI for zero-record states.
 */

export default function UserManagementConsole() {
  const { t } = useLocalization();

  const {
    allUsers = [], // Default to empty array
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useUserManagementConsole();

  const handleFetchNext = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] relative">
      {/* Dot-grid atmosphere — Standardized alignment (28px) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />

      <header className="px-10 py-8 border-b border-primary/10 bg-primary/[0.02] flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner relative group/logo">
                <Database className="h-5 w-5 text-primary group-hover/logo:scale-110 transition-transform duration-500" />
            </div>
            <div>
                <h3 className="text-[16px] font-black uppercase tracking-tight text-foreground/90 leading-none">
                    Identity Orchestration
                </h3>
                <div className="flex items-center gap-2 mt-2">
                    <div className={cn(
                        "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.6)]",
                        isFetching ? "bg-primary animate-pulse" : "bg-primary/40"
                    )} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                        {isFetching ? 'Synchronizing Neural Directory...' : 'Directory Link Operational'}
                    </p>
                </div>
            </div>
        </div>
        <CreateUserDialog />
      </header>

      <CardContent className="p-10 relative z-10 min-h-[400px] flex flex-col">
        {isLoading ? (
            <UserTableSkeleton />
        ) : isError ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
                 <div className="p-8 rounded-[32px] bg-destructive/5 border border-dashed border-destructive/20 shadow-inner group/err">
                    <AlertCircle className="h-12 w-12 text-destructive/40 group-hover/err:scale-110 transition-transform" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-[14px] font-black uppercase tracking-[0.2em] text-destructive/80">Directory Corruption Detected</h4>
                    <p className="text-[11px] text-muted-foreground/70 italic leading-relaxed px-12 max-w-md mx-auto font-medium">
                        {t('manageUsers.errorLoading')}: {error?.message || 'Spectral link failure.'}
                    </p>
                </div>
                <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    className="h-10 px-6 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 font-bold uppercase tracking-widest text-[9px] transition-all"
                >
                    Reinitialize Authentication Node
                </Button>
            </div>
        ) : allUsers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6 opacity-40 animate-in fade-in duration-1000">
                <div className="p-8 rounded-[32px] bg-muted/20 border border-dashed border-muted-foreground/40 shadow-inner">
                    <Search className="h-12 w-12 text-muted-foreground stroke-[1.5]" />
                </div>
                <div className="space-y-1.5 px-10">
                    <p className="text-[12px] font-black uppercase tracking-[0.3em]">Zero Identity Vectors</p>
                    <p className="text-[11px] font-medium leading-relaxed italic max-w-sm mx-auto">
                        No active system nodes matched the current directory sweep. Initialize a new identity to populate the matrix.
                    </p>
                </div>
            </div>
        ) : (
            <div className="space-y-10 flex-1">
                <div className="rounded-3xl border border-primary/10 bg-background/40 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/[0.02] relative group">
                    {/* Architectural depth line */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent z-20" />
                    <UserTable users={allUsers as User[]} />
                </div>

                {hasNextPage && (
                    <div className="flex items-center justify-center pt-4 pb-8">
                        <Button
                            variant="outline"
                            onClick={handleFetchNext}
                            disabled={isFetchingNextPage}
                            className="font-black h-12 px-10 gap-3 rounded-2xl shadow-xl shadow-primary/5 border-primary/10 hover:bg-primary/5 hover:text-primary transition-all hover:scale-105 active:scale-95 uppercase tracking-[0.2em] text-[10px]"
                        >
                            {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 opacity-40" />}
                            {isFetchingNextPage ? 'Extracting Node Data...' : 'Load Additional Vectors'}
                        </Button>
                    </div>
                )}
            </div>
        )}
      </CardContent>

      <footer className="px-10 py-6 border-t border-primary/10 bg-muted/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
              <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.25em]">
                  Arkan Identity Hub • Auth Node V2.4 Stable
              </p>
          </div>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-primary/30" />
                  <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums uppercase tracking-widest">ENCRYPTED_LINK_ACTIVE</span>
              </div>
              <Badge variant="outline" className="h-6 text-[10px] font-black uppercase tracking-tight text-primary/60 border-primary/10 bg-primary/5 px-3 rounded-lg shadow-inner">
                  {allUsers.length} Active Records
              </Badge>
          </div>
      </footer>
    </Card>
  );
}

import { RefreshCw } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
