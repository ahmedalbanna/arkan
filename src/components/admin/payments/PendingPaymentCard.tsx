
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLocalization } from "@/context/LocalizationContext";
import { useVerifyPayment } from "@/hooks";
import { Transaction } from "@/lib/models/transaction";
import { format } from 'date-fns';
import { Check, CreditCard, DollarSign, ExternalLink, Loader2, ThumbsDown, User } from "lucide-react";
import { useState } from "react";

interface PendingPaymentCardProps {
    transaction: Transaction;
}

export function PendingPaymentCard({ transaction }: PendingPaymentCardProps) {
    const [adminNotes, setAdminNotes] = useState(transaction.adminNotes || '');
    const { mutate, isPending } = useVerifyPayment();
    const { t } = useLocalization();

    const handleVerification = (status: 'verified' | 'rejected') => {
        mutate({
            transactionId: transaction.id,
            userId: transaction.userId,
            creditsToGrant: transaction.credits,
            status,
            adminNotes: adminNotes || (status === 'verified' ? t('managePayments.defaultApproveNote') : t('managePayments.defaultDeclineNote')),
        });
    }

    return (
        <AnimatedContainer animation="fade-in-up" delay={100}>
            <Card variant="glass" className="flex flex-col backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200 group">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow group-hover:scale-105 transition-transform duration-200">
                                <CreditCard className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="font-headline text-lg group-hover:text-primary transition-colors duration-200">
                                    {transaction.planName}
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    {transaction.getFormattedDate()}
                                </CardDescription>
                            </div>
                        </div>
                        <Badge
                            variant={transaction.status === 'verified' ? 'default' : transaction.status === 'rejected' ? 'destructive' : 'secondary'}
                            className="shadow-soft"
                        >
                            {transaction.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4 text-sm">
                    <div className="grid gap-3">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-background/50 to-primary/5 hover:shadow-soft transition-all duration-200">
                            <User className="h-4 w-4 text-primary" />
                            <div>
                                <p className="font-medium">{transaction.userName}</p>
                                <p className="text-xs text-muted-foreground">{transaction.userEmail}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-background/50 to-green-500/5 hover:shadow-soft transition-all duration-200">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <div>
                                <p className="font-medium">{transaction.getFormattedPrice()}</p>
                                <p className="text-xs text-muted-foreground">{transaction.credits} credits</p>
                            </div>
                        </div>
                    </div>

                    <Button asChild size="sm" variant="outline" className="hover:shadow-glow hover:scale-105 transition-all duration-200">
                        <a href={transaction.proofUrl} target="_blank" rel="noopener noreferrer">
                            {t('managePayments.viewProofButton')} <ExternalLink className="mx-2 h-4 w-4" />
                        </a>
                    </Button>

                    <div className="space-y-2">
                        <Textarea
                            placeholder={t('managePayments.notesPlaceholder')}
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="text-xs hover:shadow-soft transition-all duration-200 resize-none"
                            rows={2}
                            disabled={isPending || transaction.status !== 'pending'}
                        />
                    </div>

                    {transaction.verifiedBy && transaction.verifiedAt && (
                        <div className="p-2 rounded-lg bg-gradient-to-r from-muted/50 to-primary/5 border-t">
                            <p className="text-xs text-muted-foreground">
                                {t('managePayments.processedOn', {date: format(new Date(transaction.verifiedAt), 'd MMM yyyy')})}
                            </p>
                        </div>
                    )}
                </CardContent>
                {transaction.status === 'pending' && (
                    <CardFooter className="gap-2 justify-end bg-gradient-to-r from-background/50 to-primary/5">
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleVerification('rejected')}
                            disabled={isPending}
                            className="hover:shadow-glow transition-all duration-200"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="me-2 h-4 w-4" />}
                            {t('managePayments.declineButton')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleVerification('verified')}
                            disabled={isPending}
                            variant="gradient"
                            className="hover:shadow-glow transition-all duration-200"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="me-2 h-4 w-4" />}
                            {t('managePayments.approveButton')}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </AnimatedContainer>
    );
}
