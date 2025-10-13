
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalization } from '@/context/LocalizationContext';
import { CheckCircle, Clock, CreditCard, DollarSign, Shield } from 'lucide-react';
import { FinancialReportExporter } from './FinancialReportExporter';
import { TransactionList } from './TransactionList';

export function PaymentVerificationConsole() {
    const { t } = useLocalization();

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 container mx-auto px-4 py-8 space-y-8">
                <AnimatedContainer animation="fade-in-down" delay={200}>
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                                <CreditCard className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-headline font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                    Payment Verification Console
                                </h1>
                                <p className="text-muted-foreground text-lg mt-2">
                                    Secure payment verification and management
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Payment Security
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Verification Console
                            </Badge>
                        </div>
                    </div>
                </AnimatedContainer>

                <AnimatedContainer animation="fade-in-up" delay={400}>
                    <FinancialReportExporter />
                </AnimatedContainer>

                <AnimatedContainer animation="fade-in-up" delay={600}>
                    <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                                    <DollarSign className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-headline">{t('managePayments.historyTitle')}</CardTitle>
                                    <CardDescription className="text-sm">{t('managePayments.historyDescription')}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="pending" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm">
                                    <TabsTrigger
                                        value="pending"
                                        className="hover:shadow-soft hover:scale-105 transition-all duration-200 data-[state=active]:shadow-glow"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span className="hidden sm:inline">{t('managePayments.tabs.pending')}</span>
                                        </div>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="verified"
                                        className="hover:shadow-soft hover:scale-105 transition-all duration-200 data-[state=active]:shadow-glow"
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="hidden sm:inline">{t('managePayments.tabs.verified')}</span>
                                        </div>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="rejected"
                                        className="hover:shadow-soft hover:scale-105 transition-all duration-200 data-[state=active]:shadow-glow"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            <span className="hidden sm:inline">{t('managePayments.tabs.rejected')}</span>
                                        </div>
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="pending">
                                    <TransactionList status="pending" />
                                </TabsContent>
                                <TabsContent value="verified">
                                    <TransactionList status="verified" />
                                </TabsContent>
                                <TabsContent value="rejected">
                                    <TransactionList status="rejected" />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </AnimatedContainer>
            </div>
        </div>
    );
}
