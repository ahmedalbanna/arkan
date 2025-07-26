
'use client';

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { transactionKeys } from '@/lib/query-keys';
import { getTransactions } from '@/services/transaction-service';
import { AlertCircle, Loader2 } from 'lucide-react';
import { PendingPaymentCard } from './PendingPaymentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TransactionData } from '@/lib/db/queries';

const TRANSACTIONS_PER_PAGE = 6;
type TransactionStatus = 'pending' | 'verified' | 'rejected';

function ConsoleSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-2/5" />
                        <Skeleton className="h-5 w-1/5" />
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function TransactionList({ status }: { status: TransactionStatus }) {
    const { firebaseUser } = useAuth();
    const { t } = useLocalization();
    const queryClient = useQueryClient();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery({
        queryKey: transactionKeys.list(status),
        queryFn: ({ pageParam }) => getTransactions({ status, limit: TRANSACTIONS_PER_PAGE, lastVisibleId: pageParam, token: firebaseUser!.getIdToken() }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => {
            if (!lastPage.hasNextPage) return undefined;
            const lastTransaction = lastPage.transactions[lastPage.transactions.length - 1];
            return lastTransaction?.id;
        },
        enabled: !!firebaseUser,
        staleTime: 1000 * 60, // 1 minute
    });

    useEffect(() => {
        // Invalidate other tabs when this one becomes active to refetch data
        queryClient.invalidateQueries({ queryKey: transactionKeys.list(status) });
    }, [status, queryClient]);


    if (isLoading) {
        return <ConsoleSkeleton />;
    }

    if (isError) {
        return (
            <div className="p-8 text-center text-destructive border rounded-lg">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>{t('managePayments.errorLoading')}: {error.message}</p>
            </div>
        );
    }

    const allTransactions = data?.pages.flatMap(page => page.transactions) ?? [];

    if (allTransactions.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No {status} transactions found.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTransactions.map(transaction => (
                    <PendingPaymentCard key={transaction.id} transaction={transaction} />
                ))}
            </div>
            {hasNextPage && (
                <div className="mt-8 text-center">
                    <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                    </Button>
                </div>
            )}
        </div>
    )
}

export function PaymentVerificationConsole() {
    return (
        <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
                <TransactionList status="pending" />
            </TabsContent>
            <TabsContent value="verified">
                <TransactionList status="verified" />
            </TabsContent>
            <TabsContent value="rejected">
                <TransactionList status="rejected" />
            </TabsContent>
        </Tabs>
    );
}
