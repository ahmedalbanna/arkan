
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Check, ExternalLink, Loader2, ThumbsDown } from "lucide-react";
import { useVerifyPayment } from "@/hooks";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useLocalization } from "@/context/LocalizationContext";
import { Transaction } from "@/modules/billing/domain/entities/Transaction";

interface TransactionCardProps {
    transaction: Transaction;
}

import { User, Wallet, History, ShieldCheck, ThumbsUp, XCircle, Info } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
import { Separator } from '@/components/ui/separator';
import { Label } from "@/components/ui/label";

export function TransactionCard({ transaction }: TransactionCardProps) {
    const [adminNotes, setAdminNotes] = useState(transaction.adminNotes || '');
    const { mutate, isPending } = useVerifyPayment();
    const { t } = useLocalization();

    const handleVerification = (status: 'verified' | 'rejected') => {
        mutate({
            transactionId: transaction.id,
            status,
            adminNotes: adminNotes || (status === 'verified' ? t('managePayments.defaultApproveNote') : t('managePayments.defaultDeclineNote')),
        } as any);
    }

    const isVerified = transaction.status === 'verified';
    const isRejected = transaction.status === 'rejected';
    const isPendingStatus = transaction.status === 'pending';

    return (
        <Card className={cn(
            "group flex flex-col p-6 rounded-[32px] border transition-all duration-500 shadow-sm",
            isVerified ? "bg-background border-border/60 hover:shadow-2xl hover:shadow-primary/5" :
            isRejected ? "bg-destructive/[0.02] border-destructive/20" :
            "bg-background border-primary/20 shadow-xl shadow-primary/5 hover:border-primary/40"
        )}>
            <header className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "h-1.5 w-1.5 rounded-full animate-pulse",
                            isVerified ? "bg-green-500" : isRejected ? "bg-destructive" : "bg-primary"
                        )} />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{transaction.planName}</h3>
                    </div>
                    <div className="text-2xl font-black tracking-tighter tabular-nums">{transaction.getFormattedPrice()}</div>
                </div>
                <Badge variant={isVerified ? 'default' : isRejected ? 'destructive' : 'secondary'} className="h-5 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none">
                    {transaction.status}
                </Badge>
            </header>

            <CardContent className="p-0 flex-grow space-y-6">
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/30 border border-border/40">
                        <User className="h-3 w-3 text-primary/60" />
                        <span className="text-[10px] font-bold tracking-tight truncate max-w-[120px]">{transaction.userName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/30 border border-border/40">
                        <Wallet className="h-3 w-3 text-primary/60" />
                        <span className="text-[10px] font-bold tracking-tight">+{transaction.credits} CREDITS</span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl border border-dashed bg-muted/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Settlement Proof</span>
                        <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-[9px] font-bold uppercase tracking-widest gap-1.5 hover:bg-primary/10 hover:text-primary">
                            <a href={transaction.proofUrl} target="_blank" rel="noopener noreferrer">
                                Open Logic <ExternalLink className="h-3 w-3" />
                            </a>
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Administrative Intelligence</Label>
                        <Textarea
                            placeholder={t('managePayments.notesPlaceholder')}
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="text-[11px] bg-background shadow-inner focus-visible:ring-1 resize-none p-3 italic leading-relaxed border-none ring-1 ring-border/40 rounded-xl"
                            rows={2}
                            disabled={isPending || !isPendingStatus}
                        />
                    </div>
                </div>

                {transaction.verifiedAt && (
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                        <div className="flex items-center gap-2">
                            <History className="h-3 w-3 text-muted-foreground/40" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">Audit Synchronized</span>
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">
                            {format(new Date(transaction.verifiedAt), 'd MMM yyyy')}
                        </span>
                    </div>
                )}
            </CardContent>

            {isPendingStatus && (
                 <CardFooter className="p-0 pt-6 gap-3 flex-row-reverse sm:flex-row-reverse">
                    <Button
                        size="sm"
                        className="flex-1 font-bold h-10 gap-2 shadow-lg shadow-primary/20 rounded-xl"
                        onClick={() => handleVerification('verified')}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                        Authorize
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 font-bold h-10 gap-2 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleVerification('rejected')}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        Decline
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
