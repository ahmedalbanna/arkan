
'use client';

import { useUserTransactions } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CreditCard, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/lib/models/transaction';

function PaymentHistorySkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-16" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

export default function PaymentHistoryPage() {
    const { data: transactions, isLoading, isError, error } = useUserTransactions();

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
                    <History className="w-10 h-10" />
                    Payment History
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Review all your past transactions and credit purchases.
                </p>
            </div>

            {isLoading ? (
                <PaymentHistorySkeleton />
            ) : isError ? (
                <Card>
                    <CardContent className="p-8 text-center text-destructive">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                        <p>Failed to load payment history: {error.message}</p>
                    </CardContent>
                </Card>
            ) : transactions && transactions.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Transactions</CardTitle>
                        <CardDescription>A complete log of your payment history.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((t: Transaction) => (
                                        <TableRow key={t.id}>
                                            <TableCell>{t.getFormattedDate()}</TableCell>
                                            <TableCell className="font-medium">{t.planName} (+{t.credits} credits)</TableCell>
                                            <TableCell>{t.getFormattedPrice()}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    t.status === 'verified' ? 'default'
                                                    : t.status === 'rejected' ? 'destructive'
                                                    : 'secondary'
                                                }>
                                                    {t.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-12 text-center text-muted-foreground">
                        <CreditCard className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="text-lg font-semibold">No Transactions Yet</h3>
                        <p>You haven't made any payments or credit purchases.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
