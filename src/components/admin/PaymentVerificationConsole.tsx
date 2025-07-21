
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { transactionKeys } from '@/lib/query-keys';
import { getPendingTransactions } from '@/services/transaction-service';
import { AlertCircle, Loader2 } from 'lucide-react';
import { PendingPaymentCard } from './PendingPaymentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { Button } from '@/components/ui/button';

const PENDING_TRANSACTIONS_PER_PAGE = 6;

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

export function PaymentVerificationConsole() {
    const { firebaseUser } = useAuth();
    const { t } = useLocalization();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            if (firebaseUser) {
                const idToken = await firebaseUser.getIdToken();
                setToken(idToken);
            }
        };
        fetchToken();
    }, [firebaseUser]);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: transactionKeys.pending(),
        queryFn: ({ pageParam }) => getPendingTransactions({ token: token!, limit: PENDING_TRANSACTIONS_PER_PAGE, lastVisibleId: pageParam }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => {
            if (!lastPage.hasNextPage) return undefined;
            const lastTransaction = lastPage.transactions[lastPage.transactions.length - 1];
            return lastTransaction?.id;
        },
        enabled: !!token,
        staleTime: 1000 * 60, // 1 minute
    });

    if (status === 'pending') {
        return <ConsoleSkeleton />;
    }

    if (status === 'error') {
        return (
            <div className="p-8 text-center text-destructive border rounded-lg">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>{t('managePayments.errorLoading')}: {error.message}</p>
            </div>
        );
    }
    
    const allTransactions = data.pages.flatMap(page => page.transactions);

    if (allTransactions.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground border rounded-lg">
                <p>{t('managePayments.noPending')}</p>
            </div>
        )
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTransactions.map(transaction => (
                    <PendingPaymentCard key={transaction.id} transaction={transaction} />
                ))}
            </div>
            {hasNextPage && (
                <div className="mt-8 text-center">
                    <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                    </Button>
                </div>
            )}
        </div>
    );
}
