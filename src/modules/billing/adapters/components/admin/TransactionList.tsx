
'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { TransactionCard } from './TransactionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks';
type TransactionStatus = 'pending' | 'verified' | 'rejected';
import { Transaction } from '@/modules/billing/domain/entities/Transaction';


import { CreditCard, History } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';

function ConsoleSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-8 rounded-[32px] border border-border/40 bg-muted/5 space-y-6 animate-pulse">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24 rounded-full" />
                            <Skeleton className="h-8 w-32 rounded-lg" />
                        </div>
                        <Skeleton className="h-5 w-12 rounded-sm" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-24 rounded-lg" />
                        <Skeleton className="h-6 w-24 rounded-lg" />
                    </div>
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <div className="flex gap-3 pt-2">
                        <Skeleton className="h-10 flex-1 rounded-xl" />
                        <Skeleton className="h-10 flex-1 rounded-xl" />
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
            <div className="py-20 text-center border-2 border-dashed rounded-[32px] bg-destructive/5 text-destructive border-destructive/20 max-w-md mx-auto animate-in fade-in duration-500">
                <AlertCircle className="mx-auto h-10 w-10 mb-4 opacity-40" />
                <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Ledger Sync Error</h4>
                <p className="text-[11px] italic leading-relaxed px-8 opacity-80">{t('managePayments.errorLoading')}: {error.message}</p>
            </div>
        );
    }

    const allTransactions = (data as any)?.pages?.flatMap((page: any) => page.transactions) ?? [];

    if (allTransactions.length === 0) {
        return (
            <div className="py-20 text-center border-2 border-dashed rounded-[32px] bg-muted/10 opacity-40 max-w-md mx-auto animate-in fade-in duration-500">
                <div className="relative inline-block mb-4">
                    <History className="h-12 w-12 text-primary/60" />
                    <div className="absolute -bottom-1 -right-1 bg-background border rounded-lg p-1 shadow-sm">
                        <CreditCard className="h-3 w-3 text-muted-foreground" />
                    </div>
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Manifest Empty</h3>
                <p className="text-[10px] italic mt-1">{t('managePayments.noTransactionsFound', {status: status})}</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allTransactions.filter((t: Transaction) => t && t.id).map((transaction: Transaction) => (
                    <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
            </div>
            {hasNextPage && (
                <div className="mt-12 text-center">
                    <Button 
                        variant="outline"
                        onClick={() => fetchNextPage()} 
                        disabled={isFetchingNextPage}
                        className="font-bold h-11 px-10 gap-3 rounded-xl shadow-lg shadow-black/[0.03] transition-all hover:bg-primary/5 hover:text-primary active:scale-95"
                    >
                        {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : <History className="h-4 w-4" />}
                        {isFetchingNextPage ? t('managePayments.loadingMore') : "Sync Previous Transactions"}
                    </Button>
                </div>
            )}
        </div>
    )
}
