
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useDebounce } from '@/hooks';
import type { GenerationLog } from '@/services';
import { fetchGenerationLogs } from '@/services';
import { useInfiniteQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Activity, AlertCircle, Eye, History, Loader2, Search, TrendingUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });

const LOGS_PER_PAGE = 15;

function LogTableSkeleton() {
    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card variant="glass" className="backdrop-blur-md shadow-soft">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                            <History className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32 mt-2" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
        </AnimatedContainer>
    );
}

function LogDetailView({ log }: { log: GenerationLog }) {
    const { resolvedTheme } = useTheme();

    return (
        <DialogContent className="max-w-4xl backdrop-blur-md">
            <DialogHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5 p-6 rounded-t-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-headline">Generation Details</DialogTitle>
                        <DialogDescription className="text-sm">
                            Agent: {log.agentId} | User: {log.userName} ({log.userId})
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] p-6">
                <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                        <div className="p-1 rounded bg-gradient-to-br from-primary/10 to-blue-500/10">
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        Input
                    </h4>
                    <ScrollArea className="h-full max-h-[60vh] border rounded-md bg-gradient-to-br from-background/50 to-primary/5">
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
                    <h4 className="font-semibold flex items-center gap-2">
                        <div className="p-1 rounded bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                            <Activity className="h-4 w-4 text-green-600" />
                        </div>
                        Output
                    </h4>
                    <ScrollArea className="h-full max-h-[60vh] border rounded-md bg-gradient-to-br from-background/50 to-green-500/5">
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
        queryKey: ['generation-logs', { agentId: debouncedAgentId, userId: debouncedUserId }],
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
            <div className="relative min-h-screen w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

                <div className="relative z-10 container mx-auto px-4 py-8">
                    <LogTableSkeleton />
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="relative min-h-screen w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

                <AnimatedContainer animation="fade-in-up" delay={200}>
                    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
                        <Card variant="glass" className="p-8 text-center max-w-md backdrop-blur-md shadow-soft">
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 rounded-full bg-gradient-to-br from-destructive to-destructive/80 shadow-glow">
                                    <AlertCircle className="h-12 w-12 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-headline font-semibold mb-2">Error Loading Logs</h2>
                                    <p className="text-muted-foreground">
                                        {t('manageGenerations.errorLoading')}: {error?.message}
                                    </p>
                                </div>
                                <Badge variant="destructive" className="flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Error
                                </Badge>
                            </div>
                        </Card>
                    </div>
                </AnimatedContainer>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 container mx-auto px-4 py-8">
                <AnimatedContainer animation="fade-in-down" delay={200}>
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                                <History className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-headline font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                    Generation Log Viewer
                                </h1>
                                <p className="text-muted-foreground text-lg mt-2">
                                    Monitor and analyze AI generation activities
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                Activity Log
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Analytics
                            </Badge>
                        </div>
                    </div>
                </AnimatedContainer>

                <AnimatedContainer animation="fade-in-up" delay={400}>
                    <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                                        <History className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-headline">{t('manageGenerations.cardTitle')}</CardTitle>
                                        <Badge variant="secondary" className="flex items-center gap-1 mt-1">
                                            <Activity className="h-3 w-3" />
                                            Live Activity
                                        </Badge>
                                    </div>
                                </div>
                                {isFetching && !isFetchingNextPage && (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        <span className="text-sm text-muted-foreground">Loading...</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 pt-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t('manageGenerations.filterAgentPlaceholder')}
                                        value={agentIdFilter}
                                        onChange={(e) => setAgentIdFilter(e.target.value)}
                                        className="pl-10 hover:shadow-soft transition-all duration-200"
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t('manageGenerations.filterUserPlaceholder')}
                                        value={userIdFilter}
                                        onChange={(e) => setUserIdFilter(e.target.value)}
                                        className="pl-10 hover:shadow-soft transition-all duration-200"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg bg-gradient-to-br from-background/50 to-primary/5">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                                            <TableHead className="font-headline">{t('manageGenerations.agent')}</TableHead>
                                            <TableHead className="font-headline">{t('manageGenerations.user')}</TableHead>
                                            <TableHead className="font-headline">{t('manageGenerations.date')}</TableHead>
                                            <TableHead className="text-right font-headline">{t('manageGenerations.actions')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allLogs && allLogs.length > 0 ? (
                                            allLogs.map((log, index) => (
                                                <TableRow key={log.id} className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-200 group">
                                                    <TableCell className="font-medium group-hover:text-primary transition-colors duration-200">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1 rounded bg-gradient-to-br from-primary/10 to-blue-500/10">
                                                                <Activity className="h-3 w-3 text-primary" />
                                                            </div>
                                                            {log.agentId}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="truncate max-w-[200px] group-hover:text-primary transition-colors duration-200">
                                                        {log.userName}
                                                    </TableCell>
                                                    <TableCell className="group-hover:text-primary transition-colors duration-200">
                                                        <span title={log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Unknown'}>
                                                            {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : 'Unknown'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="hover:shadow-glow hover:scale-105 transition-all duration-200">
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
                                                <TableCell colSpan={4} className="text-center h-24">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="p-2 rounded-full bg-gradient-to-br from-muted/50 to-primary/10">
                                                            <History className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                        <p className="text-muted-foreground">{t('manageGenerations.noResults')}</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex items-center justify-center pt-8">
                                <Button
                                    onClick={() => fetchNextPage()}
                                    disabled={!hasNextPage || isFetchingNextPage}
                                    variant="gradient"
                                    className="hover:shadow-glow transition-all duration-200"
                                >
                                    {isFetchingNextPage ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
                                    {isFetchingNextPage ? t('manageGenerations.loadingMore') : t('manageGenerations.loadMore')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </AnimatedContainer>
            </div>
        </div>
    );
}
