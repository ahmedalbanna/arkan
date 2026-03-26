
'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { TransactionCard } from './TransactionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks';
type TransactionStatus = 'pending' | 'verified' | 'rejected';
import { Transaction } from '@/modules/billing/domain/entities/Transaction';


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

export function TransactionList({ status }: { status: TransactionStatus }) {
    const { t } = useLocalization();
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useTransactions(status);


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

    const allTransactions = (data as any)?.pages?.flatMap((page: any) => page.transactions) ?? [];

    if (allTransactions.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <p>{t('managePayments.noTransactionsFound', {status: status})}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTransactions.filter((t: Transaction) => t && t.id).map((transaction: Transaction) => (
                    <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
            </div>
            {hasNextPage && (
                <div className="mt-8 text-center">
                    <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
                        {isFetchingNextPage ? t('managePayments.loadingMore') : t('managePayments.loadMore')}
                    </Button>
                </div>
            )}
        </div>
    )
}
