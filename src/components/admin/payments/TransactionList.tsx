
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { useTransactions } from '@/hooks';
import { Transaction } from '@/lib/models/transaction';
import type { TransactionStatus } from '@/services';
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { PendingPaymentCard } from './PendingPaymentCard';

function ConsoleSkeleton() {
    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} variant="glass" className="backdrop-blur-md shadow-soft">
                        <div className="space-y-4 p-4">
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
                    </Card>
                ))}
            </div>
        </AnimatedContainer>
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
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <Card variant="glass" className="p-8 text-center backdrop-blur-md shadow-soft">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-gradient-to-br from-destructive to-destructive/80 shadow-glow">
                            <AlertCircle className="h-12 w-12 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-headline font-semibold mb-2">Error Loading Transactions</h2>
                            <p className="text-muted-foreground">
                                {t('managePayments.errorLoading')}: {error.message}
                            </p>
                        </div>
                        <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Error
                        </Badge>
                    </div>
                </Card>
            </AnimatedContainer>
        );
    }

    const allTransactions = data?.pages.flatMap(page => page.transactions) ?? [];

    if (allTransactions.length === 0) {
        return (
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <Card variant="glass" className="p-8 text-center backdrop-blur-md shadow-soft">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-gradient-to-br from-muted/50 to-primary/10 shadow-glow">
                            <CreditCard className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-headline font-semibold mb-2">No Transactions Found</h2>
                            <p className="text-muted-foreground">
                                {t('managePayments.noTransactionsFound', {status: status})}
                            </p>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            Empty
                        </Badge>
                    </div>
                </Card>
            </AnimatedContainer>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTransactions.map((transaction: Transaction, index: number) => (
                    <AnimatedContainer key={transaction.id} animation="fade-in-up" delay={100 + (index * 100)}>
                        <PendingPaymentCard transaction={transaction} />
                    </AnimatedContainer>
                ))}
            </div>
            {hasNextPage && (
                <div className="mt-8 text-center">
                    <Button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        variant="gradient"
                        className="hover:shadow-glow transition-all duration-200"
                    >
                        {isFetchingNextPage ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
                        {isFetchingNextPage ? t('managePayments.loadingMore') : t('managePayments.loadMore')}
                    </Button>
                </div>
            )}
        </div>
    )
}
