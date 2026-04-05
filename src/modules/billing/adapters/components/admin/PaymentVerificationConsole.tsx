'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialReportExporter } from './FinancialReportExporter';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TransactionList } from './TransactionList';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Clock, CheckCircle2, XCircle, Wallet, ShieldCheck, Binary } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';

/**
 * PaymentVerificationConsole — High-fidelity financial audit hub.
 * Orchestrates the verification lifecycle of system-wide transaction vectors.
 * 
 * DEFENSIVE MEASURES:
 * 1. Data Isolation: Uses strict tab-based filtering for transaction manifests.
 * 2. Visual Feedback: Implements active status indicators and neural pulses.
 * 3. Fallback Integrity: Ensures sub-components (TransactionList) receive consistent status props.
 * 4. Technical Aesthetic: Standardized dot grids and stable financial manifests.
 */

export function PaymentVerificationConsole() {
    const { t } = useLocalization();
    
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Sector 1: Spectral Data Export */}
            <div className="rounded-[40px] overflow-hidden border border-primary/5 shadow-2xl shadow-primary/5 bg-card relative">
                <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />
                <FinancialReportExporter />
            </div>

            {/* Sector 2: Transaction Matrix */}
            <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[40px] relative">
                {/* Dot-grid atmosphere — Standardized alignment (28px) */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />

                <header className="px-10 py-8 border-b border-primary/10 bg-primary/[0.02] flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group/logo">
                            <Wallet className="h-6 w-6 text-primary group-hover/logo:scale-110 transition-transform duration-500" />
                        </div>
                        <div>
                            <h3 className="text-[18px] font-black uppercase tracking-tight text-foreground/90 leading-none">
                                Financial Ledger
                            </h3>
                            <div className="flex items-center gap-2.5 mt-2.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70">
                                    Gateway Pipeline Operational
                                </p>
                            </div>
                        </div>
                    </div>
                    <Badge variant="outline" className="h-7 text-[10px] uppercase tracking-[0.3em] font-black border-primary/20 text-primary bg-primary/5 px-4 rounded-full shadow-inner ring-1 ring-inset ring-primary/10">
                        Live Stream
                    </Badge>
                </header>

                <CardContent className="p-10 relative z-10 min-h-[500px]">
                    <Tabs defaultValue="pending" className="w-full flex flex-col h-full">
                        <div className="flex justify-center mb-12">
                            <TabsList className="h-12 rounded-2xl bg-muted/20 p-1.5 gap-1.5 min-w-[480px] border border-border/40 backdrop-blur-md">
                                <TabsTrigger value="pending" className="flex-1 gap-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all rounded-xl">
                                    <Clock className="h-3.5 w-3.5" />
                                    {t('managePayments.tabs.pending')}
                                </TabsTrigger>
                                <TabsTrigger value="verified" className="flex-1 gap-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-green-500 data-[state=active]:shadow-lg transition-all rounded-xl">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {t('managePayments.tabs.verified')}
                                </TabsTrigger>
                                <TabsTrigger value="rejected" className="flex-1 gap-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-destructive data-[state=active]:shadow-lg transition-all rounded-xl">
                                    <XCircle className="h-3.5 w-3.5" />
                                    {t('managePayments.tabs.rejected')}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 rounded-[32px] border border-primary/5 bg-background/40 backdrop-blur-xl overflow-hidden shadow-inner relative group">
                            {/* Depth architectural line */}
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/5 to-transparent z-20" />
                            
                            <TabsContent value="pending" className="m-0 focus-visible:ring-0 animate-in fade-in duration-500">
                                <TransactionList status="pending" />
                            </TabsContent>
                            <TabsContent value="verified" className="m-0 focus-visible:ring-0 animate-in fade-in duration-500">
                                <TransactionList status="verified" />
                            </TabsContent>
                            <TabsContent value="rejected" className="m-0 focus-visible:ring-0 animate-in fade-in duration-500">
                                <TransactionList status="rejected" />
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>

                <footer className="px-10 py-6 border-t border-primary/10 bg-muted/5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                        <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.25em]">
                            Financial Oversight Console • Stable Manifest V2.4
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3 text-primary/30" />
                            <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums uppercase tracking-widest">ENCRYPTED_FINANCIAL_VECTOR</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Binary className="h-3 w-3 text-muted-foreground/20" />
                            <p className="text-[9px] text-muted-foreground/30 italic font-medium">
                                Tracking {t('managePayments.historyDescription')}
                            </p>
                        </div>
                    </div>
                </footer>
            </Card>
        </div>
    );
}
