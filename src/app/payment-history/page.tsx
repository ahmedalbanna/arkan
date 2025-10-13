
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUserTransactions } from '@/hooks';
import type { Transaction } from '@/lib/models/transaction';
import { AlertCircle, CheckCircle, Clock, CreditCard, History, Shield } from 'lucide-react';

function PaymentHistorySkeleton() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 container mx-auto max-w-4xl px-4 py-12">
                <AnimatedContainer animation="fade-in-up" delay={200}>
                    <Card variant="glass" className="backdrop-blur-md shadow-soft">
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
                </AnimatedContainer>
            </div>
        </div>
    );
}

export default function PaymentHistoryPage() {
    const { data: transactions, isLoading, isError, error } = useUserTransactions();

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 container mx-auto max-w-4xl px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <AnimatedContainer animation="fade-in-down" delay={200}>
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-glow">
                                <History className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-headline font-bold bg-gradient-to-r from-emerald-500 via-primary to-blue-500 bg-clip-text text-transparent">
                            Payment History
                        </h1>
                        <p className="text-lg text-muted-foreground mt-2">
                            Review all your past transactions and credit purchases
                        </p>
                    </AnimatedContainer>
                </div>

                {isLoading ? (
                    <PaymentHistorySkeleton />
                ) : isError ? (
                    <AnimatedContainer animation="fade-in-up" delay={400}>
                        <Card variant="glass" className="backdrop-blur-md shadow-soft">
                            <CardContent className="p-8 text-center text-destructive">
                                <div className="p-3 rounded-full bg-destructive/10 mx-auto w-fit mb-4">
                                    <AlertCircle className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Failed to Load Payment History</h3>
                                <p>{error.message}</p>
                            </CardContent>
                        </Card>
                    </AnimatedContainer>
                ) : transactions && transactions.length > 0 ? (
                    <AnimatedContainer animation="fade-in-up" delay={400}>
                        <Card variant="glass" className="backdrop-blur-md shadow-soft">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                                        <CreditCard className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Your Transactions</CardTitle>
                                        <CardDescription>A complete log of your payment history</CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="ml-auto">
                                        {transactions.length} transactions
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="font-semibold">Date</TableHead>
                                                <TableHead className="font-semibold">Plan</TableHead>
                                                <TableHead className="font-semibold">Amount</TableHead>
                                                <TableHead className="font-semibold">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map((t: Transaction, index) => (
                                                <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            {t.getFormattedDate()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1 rounded bg-primary/10">
                                                                <CreditCard className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <span className="font-medium">{t.planName}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                +{t.credits} credits
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-primary">
                                                        {t.getFormattedPrice()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                t.status === 'verified' ? 'default'
                                                                    : t.status === 'rejected' ? 'destructive'
                                                                        : 'secondary'
                                                            }
                                                            className="flex items-center gap-1 w-fit"
                                                        >
                                                            {t.status === 'verified' && <CheckCircle className="h-3 w-3" />}
                                                            {t.status === 'rejected' && <AlertCircle className="h-3 w-3" />}
                                                            {t.status === 'pending' && <Clock className="h-3 w-3" />}
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
                    </AnimatedContainer>
                ) : (
                    <AnimatedContainer animation="fade-in-up" delay={400}>
                        <Card variant="glass" className="backdrop-blur-md shadow-soft">
                            <CardContent className="p-12 text-center text-muted-foreground">
                                <div className="p-4 rounded-full bg-gradient-to-br from-muted to-muted-foreground mx-auto w-fit mb-4">
                                    <CreditCard className="h-12 w-12 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                                <p className="mb-4">You haven't made any payments or credit purchases.</p>
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <Shield className="h-4 w-4" />
                                    <span>All transactions are secure and encrypted</span>
                                </div>
                            </CardContent>
                        </Card>
                    </AnimatedContainer>
                )}
            </div>
        </div>
    );
}
