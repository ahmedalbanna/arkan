
'use client';

import { useUserTransactions } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CreditCard, History, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/modules/billing/domain/entities/Transaction';
import { TransactionProperties } from '@/modules/billing/domain/entities/Transaction';

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
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Immersive Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% -20%, hsl(var(--primary) / 0.08), transparent 50%)'
                }}
            />
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="container relative z-10 mx-auto max-w-5xl px-6 py-20 md:py-32">
                <div className="flex flex-col items-center text-center mb-24 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">Financial Node</Badge>
                        <div className="h-3 w-px bg-primary/20" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Audit Stream</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-foreground leading-[0.9] flex items-center gap-6">
                        <History className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
                        Payment History
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl italic font-serif leading-relaxed opacity-80">
                        Review your secure financial interaction log and system credit acquisition history.
                    </p>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    {isLoading ? (
                        <PaymentHistorySkeleton />
                    ) : isError ? (
                        <div className="py-20 text-center border-2 border-dashed rounded-[32px] bg-destructive/5 text-destructive border-destructive/20 max-w-md mx-auto">
                            <AlertCircle className="mx-auto h-10 w-10 mb-4 opacity-40" />
                            <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Ledger Error</h4>
                            <p className="text-[11px] italic leading-relaxed px-8 opacity-80">Failed to synchronize transaction manifest. {error.message}</p>
                        </div>
                    ) : transactions && transactions.length > 0 ? (
                        <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
                            <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                                        Transaction Manifest
                                    </h3>
                                </div>
                                <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
                                    {transactions.length} Records Active
                                </Badge>
                            </header>

                            <CardContent className="p-8 md:p-10">
                                <div className="rounded-2xl border bg-background overflow-hidden shadow-sm shadow-black/[0.02]">
                                    <Table>
                                        <TableHeader className="bg-muted/20">
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">Date</TableHead>
                                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">Plan Identity</TableHead>
                                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6">Amount</TableHead>
                                                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-6 text-right">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(transactions as any[]).map((t: TransactionProperties) => {
                                                const trans = new Transaction(t);
                                                return (
                                                    <TableRow key={t.id} className="group hover:bg-muted/5 transition-colors border-border/40">
                                                        <TableCell className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                                    {trans.getFormattedDate()}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold tracking-tight">{t.planName}</span>
                                                                <span className="text-[9px] font-bold text-primary/60 uppercase tracking-tighter">+{t.credits} Neural Credits</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4">
                                                            <span className="text-xs font-bold">{trans.getFormattedPrice()}</span>
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4 text-right">
                                                            <Badge variant={
                                                                t.status === 'verified' ? 'default'
                                                                : t.status === 'rejected' ? 'destructive'
                                                                : 'secondary'
                                                            } className="h-4.5 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none">
                                                                {t.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>

                            <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
                                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                                    Arkan Financial Node • Ledger V1.0 Stable
                                </p>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-3.5 w-3.5 text-primary/40" />
                                    <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tighter">
                                        Audit Stream Encrypted
                                    </span>
                                </div>
                            </footer>
                        </Card>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40 space-y-4">
                            <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                                <CreditCard className="h-10 w-10 text-primary/60" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ledger Empty</h3>
                                <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">No financial interactions identified in your system registry.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
