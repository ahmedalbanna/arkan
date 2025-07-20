
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { generationLogKeys } from '@/lib/query-keys';
import { fetchGenerationLogs } from '@/services/generation-log-service';
import type { GenerationLog } from '@/services/generation-log-service';
import { AlertCircle, ChevronLeft, ChevronRight, Eye, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useLocalization } from '@/context/LocalizationContext';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import ReactJson from 'react-json-view';
import { useTheme } from 'next-themes';
import { AGENTS } from '@/lib/agents';

const LOGS_PER_PAGE = 15;

function LogTableSkeleton() {
    const { t } = useLocalization();
    return (
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
                {Array.from({ length: 10 }).map((_, i) => (
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
    const { t } = useLocalization();
    const [page, setPage] = useState(1);
    const [agentIdFilter, setAgentIdFilter] = useState('');
    const [userIdFilter, setUserIdFilter] = useState('');
    const { firebaseUser, isLoading: authLoading } = useAuth();
    
    const { data, isLoading, isError, error, isFetching } = useQuery({
        queryKey: generationLogKeys.list({ page, limit: LOGS_PER_PAGE, agentId: agentIdFilter, userId: userIdFilter }),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return fetchGenerationLogs({ token, page, limit: LOGS_PER_PAGE, agentId: agentIdFilter, userId: userIdFilter });
        },
        enabled: !!firebaseUser,
        placeholderData: (previousData) => previousData,
    });

    const agentOptions = AGENTS.map(agent => ({ value: agent.id, label: agent.name }));

    const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        setPage(1); // Reset to first page on filter change
    };

    if (authLoading || isLoading) {
        return (
            <Card>
                <CardHeader><CardTitle>{t('manageGenerations.cardTitle')}</CardTitle></CardHeader>
                <CardContent><LogTableSkeleton /></CardContent>
            </Card>
        );
    }

    if (isError) {
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
                    {isFetching && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                </CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder={t('manageGenerations.filterAgentPlaceholder')} 
                            value={agentIdFilter} 
                            onChange={handleFilterChange(setAgentIdFilter)}
                            className="pl-10"
                        />
                    </div>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder={t('manageGenerations.filterUserPlaceholder')}
                            value={userIdFilter} 
                            onChange={handleFilterChange(setUserIdFilter)}
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
                            {data?.logs && data.logs.length > 0 ? (
                                data.logs.map((log) => (
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
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4" />
                        {t('manageUsers.previousButton')}
                    </Button>
                    <span className="text-sm font-medium">{t('manageUsers.pageLabel')} {page}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={!data?.hasNextPage}
                    >
                        {t('manageUsers.nextButton')}
                        <ChevronRight className="ml-2 rtl:ml-0 rtl:mr-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
