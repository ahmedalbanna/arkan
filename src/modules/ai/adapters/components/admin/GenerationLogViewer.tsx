'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { generationLogKeys } from '@/infrastructure/api/query-keys';
import { GenerationLogApiClient } from '@/modules/ai/adapters/api-client/GenerationLogApiClient';
import { AlertCircle, Eye, Loader2, Search, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from 'next-themes';
import { useDebounce } from '@/hooks';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { container } from '@/infrastructure/di/container';
import { Badge } from '@/components/ui/badge';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });
const LOGS_PER_PAGE = 15;

function LogTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Agent</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: LOGS_PER_PAGE }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function LogDetailView({ log }: { log: any }) {
  const { resolvedTheme } = useTheme();

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Generation Details</DialogTitle>
        <DialogDescription>
          Agent: {log.agentId} | User: {log.userName} ({log.userId})
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh]">
        <div className="space-y-2">
          <h4 className="font-semibold">Input</h4>
          <ScrollArea className="h-full max-h-[60vh] border rounded-md">
            <ReactJson src={log.input as object} theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'} collapsed={2} displayDataTypes={false} name={false} />
          </ScrollArea>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Output</h4>
          <ScrollArea className="h-full max-h-[60vh] border rounded-md">
            <ReactJson src={log.output as object} theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'} collapsed={2} displayDataTypes={false} name={false} />
          </ScrollArea>
        </div>
      </div>
    </DialogContent>
  );
}

export default function GenerationLogViewer() {
  const [agentIdFilter, setAgentIdFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const debouncedAgentId = useDebounce(agentIdFilter, 500);
  const debouncedUserId = useDebounce(userIdFilter, 500);
  const { t } = useLocalization();
  const { user, isLoading: authLoading } = useAuth();

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: generationLogKeys.list({ agentId: debouncedAgentId, userId: debouncedUserId }),
    queryFn: async ({ pageParam }) => {
      const client = container.resolve(GenerationLogApiClient);
      const result = await client.fetchGenerationLogs({
        limit: LOGS_PER_PAGE,
        userId: debouncedUserId,
        lastVisibleId: pageParam,
      });
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: any) => (lastPage.hasNextPage ? lastPage.lastVisibleId ?? undefined : undefined),
    enabled: Boolean(user),
    staleTime: 1000 * 60,
  });

  const allLogs = data?.pages.flatMap((page) => page.logs) ?? [];

  if (status === 'pending' || authLoading) {
    return <Card><CardHeader><CardTitle>{t('manageGenerations.cardTitle')}</CardTitle></CardHeader><CardContent><LogTableSkeleton /></CardContent></Card>;
  }

  if (status === 'error') {
    return <Card><CardContent className="p-8 text-center text-destructive"><AlertCircle className="mx-auto h-8 w-8 mb-2" /><p>{t('manageGenerations.errorLoading')}: {error?.message}</p></CardContent></Card>;
  }

  return (
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Generation Stream Archive
            </h3>
            {isFetching && !isFetchingNextPage && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary/40" />}
        </div>
        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
            Audit Ready
        </Badge>
      </header>

      <CardContent className="p-8 md:p-10 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-muted/5 border border-dashed border-border/60">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
                placeholder={t('manageGenerations.filterAgentPlaceholder')}
                value={agentIdFilter}
                onChange={(e) => setAgentIdFilter(e.target.value)}
                className="pl-9 h-9 text-xs bg-background border-none shadow-sm focus-visible:ring-1 rounded-lg"
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
                placeholder={t('manageGenerations.filterUserPlaceholder')}
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                className="pl-9 h-9 text-xs bg-background border-none shadow-sm focus-visible:ring-1 rounded-lg"
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-background overflow-hidden shadow-sm shadow-black/[0.02]">
          <Table>
            <TableHeader className="bg-muted/20">
                <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">{t('manageGenerations.agent')}</TableHead>
                    <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">{t('manageGenerations.user')}</TableHead>
                    <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">{t('manageGenerations.date')}</TableHead>
                    <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6 text-right">{t('manageGenerations.actions')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {allLogs.length > 0 ? allLogs.map((log) => (
                <TableRow key={log.id} className="group hover:bg-muted/5 transition-colors border-border/40">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                        <span className="text-[11px] font-bold uppercase tracking-tighter text-primary/80">{log.agentId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 truncate max-w-[200px] text-xs font-medium text-muted-foreground">{log.userName}</TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest" title={new Date(log.createdAt).toLocaleString()}>
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <Eye className="h-3.5 w-3.5" />
                            </Button>
                        </DialogTrigger>
                        <LogDetailView log={log} />
                    </Dialog>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-32 opacity-40">
                        <History className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">{t('manageGenerations.noResults')}</p>
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            className="font-bold h-10 px-10 gap-3 rounded-xl shadow-lg shadow-black/[0.03] transition-all hover:bg-primary/5 hover:text-primary active:scale-95"
          >
            {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : <History className="h-4 w-4" />}
            {isFetchingNextPage ? t('manageGenerations.loadingMore') : "Load Previous Stream"}
          </Button>
        </div>
      </CardContent>

      <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
              Arkan Audit Engine • Log Node V1.0
          </p>
          <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-4 text-[8px] uppercase tracking-tighter text-muted-foreground/60 border-border/60">
                  {allLogs.length} interactions logged
              </Badge>
          </div>
      </footer>
    </Card>
  );
}
