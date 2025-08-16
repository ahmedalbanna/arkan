
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { generationLogKeys } from '@/lib/query-keys';
import { fetchGenerationLogs } from '@/services/generation-log-service';
import type { GenerationLog } from '@/services/generation-log-service';
import { AlertCircle, Eye, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { useTheme } from 'next-themes';
import { useDebounce } from '@/hooks/use-debounce';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useLocalization } from '@/context/LocalizationContext';

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

function LogDetailView({ log }: { log: GenerationLog }) {
    const { resolvedTheme } = useTheme();

    return (
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Generation Details</DialogTitle>
                <DialogDescription>
                    Agent: {log.agentId} | User: {log.userId}
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh]">
                <div className="space-y-2">
                    <h4 className="font-semibold">Input</h4>
                    <ScrollArea className="h-full max-h-[60vh] border rounded-md">
                        <ReactJson 
                            src={log.input} 
                            theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'} 
                            collapsed={2}
                            displayDataTypes={false}
                            name={false}
                        />
                    </ScrollArea>
                </div>
                <div className="space-y-2">
                    <h4 className="font-semibold">Output</h4>
                     <ScrollArea className="h-full max-h-[60vh] border rounded-md">
                        <ReactJson 
                            src={log.output} 
                            theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'} 
                            collapsed={2}
                            displayDataTypes={false}
                            name={false}
                        />
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

    const { firebaseUser, isLoading: authLoading } = useAuth();
    
    const { 
      data, 
      error, 
      fetchNextPage, 
      hasNextPage, 
      isFetching,
      isFetchingNextPage, 
      status,
    } = useInfiniteQuery({
        queryKey: generationLogKeys.list({ agentId: debouncedAgentId, userId: debouncedUserId }),
        queryFn: async ({ pageParam }) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return fetchGenerationLogs({ token, limit: LOGS_PER_PAGE, agentId: debouncedAgentId, userId: debouncedUserId, lastVisibleId: pageParam });
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.lastVisibleId : undefined,
        enabled: !!firebaseUser,
        staleTime: 1000 * 60, // 1 minute
    });

    const allLogs = data?.pages.flatMap(page => page.logs) ?? [];

    if (status === 'pending' || authLoading) {
        return (
            <Card>
                <CardHeader><CardTitle>{t('manageGenerations.cardTitle')}</CardTitle></CardHeader>
                <CardContent><LogTableSkeleton /></CardContent>
            </Card>
        );
    }

    if (status === 'error') {
        return (
            <Card>
                <CardContent className="p-8 text-center text-destructive">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <p>{t('manageGenerations.errorLoading')}: {error?.message}</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{t('manageGenerations.cardTitle')}</span>
                    {isFetching && !isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                </CardTitle>
                <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder={t('manageGenerations.filterAgentPlaceholder')}
                            value={agentIdFilter} 
                            onChange={(e) => setAgentIdFilter(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                     <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder={t('manageGenerations.filterUserPlaceholder')}
                            value={userIdFilter} 
                            onChange={(e) => setUserIdFilter(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('manageGenerations.agent')}</TableHead>
                                <TableHead>{t('manageGenerations.user')}</TableHead>
                                <TableHead>{t('manageGenerations.date')}</TableHead>
                                <TableHead className="text-right">{t('manageGenerations.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allLogs && allLogs.length > 0 ? (
                                allLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">{log.agentId}</TableCell>
                                        <TableCell className="truncate max-w-[200px]">{log.userId}</TableCell>
                                        <TableCell>
                                            <span title={new Date(log.createdAt).toLocaleString()}>
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <LogDetailView log={log} />
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">{t('manageGenerations.noResults')}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-center pt-8">
                     <Button
                        onClick={() => fetchNextPage()}
                        disabled={!hasNextPage || isFetchingNextPage}
                    >
                        {isFetchingNextPage ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isFetchingNextPage ? t('manageGenerations.loadingMore') : t('manageGenerations.loadMore')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
