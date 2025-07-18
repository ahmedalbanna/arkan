
'use client';

import { useQuery } from '@tanstack/react-query';
import { transactionKeys } from '@/lib/query-keys';
import { getPendingTransactions } from '@/services/transaction-service';
import { AlertCircle, Loader2 } from 'lucide-react';
import { PendingPaymentCard } from './PendingPaymentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useLocalization } from '@/context/LocalizationContext';

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

    const { data: transactions, isLoading, isError, error } = useQuery({
        queryKey: transactionKeys.pending(),
        queryFn: () => getPendingTransactions(token!),
        enabled: !!token,
        staleTime: 1000 * 60, // 1 minute
    });

    if (isLoading || !token) {
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
    
    if (!transactions || transactions.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground border rounded-lg">
                <p>{t('managePayments.noPending')}</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transactions.map(transaction => (
                <PendingPaymentCard key={transaction.id} transaction={transaction} />
            ))}
        </div>
    );
}
