
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialReportExporter } from './FinancialReportExporter';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TransactionList } from './TransactionList';

import { Badge } from '@/components/ui/badge';
import { CreditCard, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';

export function PaymentVerificationConsole() {
    const { t } = useLocalization();
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="rounded-[32px] overflow-hidden border-none shadow-2xl shadow-primary/5 bg-card">
                <FinancialReportExporter />
            </div>

            <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
                <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                            {t('managePayments.historyTitle')}
                        </h3>
                    </div>
                    <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
                        Live Ledger
                    </Badge>
                </header>

                <CardContent className="p-8 md:p-10">
                    <Tabs defaultValue="pending" className="w-full">
                        <div className="flex justify-center mb-10">
                            <TabsList className="h-11 rounded-xl bg-muted/30 p-1 gap-1 min-w-[400px]">
                                <TabsTrigger value="pending" className="flex-1 gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary transition-all">
                                    <Clock className="h-3.5 w-3.5" />
                                    {t('managePayments.tabs.pending')}
                                </TabsTrigger>
                                <TabsTrigger value="verified" className="flex-1 gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-green-500 transition-all">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {t('managePayments.tabs.verified')}
                                </TabsTrigger>
                                <TabsTrigger value="rejected" className="flex-1 gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-destructive transition-all">
                                    <XCircle className="h-3.5 w-3.5" />
                                    {t('managePayments.tabs.rejected')}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="rounded-2xl border bg-background overflow-hidden shadow-sm shadow-black/[0.02]">
                            <TabsContent value="pending" className="m-0 focus-visible:ring-0">
                                <TransactionList status="pending" />
                            </TabsContent>
                            <TabsContent value="verified" className="m-0 focus-visible:ring-0">
                                <TransactionList status="verified" />
                            </TabsContent>
                            <TabsContent value="rejected" className="m-0 focus-visible:ring-0">
                                <TransactionList status="rejected" />
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>

                <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                        Arkan Financial Console • Gateway V1.0
                    </p>
                    <p className="text-[9px] text-muted-foreground/40 italic">
                        {t('managePayments.historyDescription')}
                    </p>
                </footer>
            </Card>
        </div>
    );
}
