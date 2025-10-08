
'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { useVerifyPayment } from "@/hooks/use-transactions";
import type { TransactionData } from "@/lib/db/queries";
import { format } from 'date-fns';
import { Check, ExternalLink, Loader2, ThumbsDown } from "lucide-react";
import { useState } from "react";
import { Textarea } from "../ui/textarea";

interface PendingPaymentCardProps {
    transaction: TransactionData;
}

export function PendingPaymentCard({ transaction }: PendingPaymentCardProps) {
    const [adminNotes, setAdminNotes] = useState(transaction.adminNotes || '');
    const { mutate, isPending } = useVerifyPayment();
    const { t } = useLocalization();

    const handleVerification = (status: 'verified' | 'rejected') => {
        mutate({
            transactionId: transaction.id,
            userId: transaction.userId,
            status,
            adminNotes: adminNotes || (status === 'verified' ? 'Payment approved.' : 'Payment rejected.'),
        });
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="font-headline text-lg">{transaction.planName}</CardTitle>
                    <Badge variant={transaction.status === 'verified' ? 'default' : transaction.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {transaction.status}
                    </Badge>
                </div>
                <CardDescription>
                    {format(new Date(transaction.createdAt), 'd MMM yyyy, h:mm a')}
                </CardDescription>
            </CardHeader>
            <CardContent className="grow space-y-3 text-sm">
                <p><strong>{t('managePayments.userLabel')}:</strong> {transaction.userName} ({transaction.userEmail})</p>
                <p><strong>{t('managePayments.amountLabel')}:</strong> ${transaction.price.toFixed(2)}</p>
                <p><strong>{t('managePayments.creditsLabel')}:</strong> {transaction.credits}</p>
                <Button asChild size="sm" variant="outline">
                    <a href={transaction.proofUrl} target="_blank" rel="noopener noreferrer">
                        {t('managePayments.viewProofButton')} <ExternalLink className="mx-2 h-4 w-4" />
                    </a>
                </Button>
                <div>
                    <Textarea
                        placeholder={t('managePayments.notesPlaceholder')}
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="text-xs mt-2"
                        rows={2}
                        disabled={isPending || transaction.status !== 'pending'}
                    />
                </div>
                {transaction.verifiedBy && transaction.verifiedAt && (
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                        Processed on {format(new Date(transaction.verifiedAt), 'd MMM yyyy')}
                    </p>
                )}
            </CardContent>
            {transaction.status === 'pending' && (
                <CardFooter className="gap-2 justify-end">
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVerification('rejected')}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="me-2 h-4 w-4" />}
                        {t('managePayments.declineButton')}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => handleVerification('verified')}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="me-2 h-4 w-4" />}
                        {t('managePayments.approveButton')}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
