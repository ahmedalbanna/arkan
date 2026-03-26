
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialReportExporter } from './FinancialReportExporter';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TransactionList } from './TransactionList';

export function PaymentVerificationConsole() {
    const { t } = useLocalization();
    return (
        <div className="space-y-8">
            <FinancialReportExporter />
            <Card>
                <CardHeader>
                    <CardTitle>{t('managePayments.historyTitle')}</CardTitle>
                    <CardDescription>{t('managePayments.historyDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="pending" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="pending">{t('managePayments.tabs.pending')}</TabsTrigger>
                            <TabsTrigger value="verified">{t('managePayments.tabs.verified')}</TabsTrigger>
                            <TabsTrigger value="rejected">{t('managePayments.tabs.rejected')}</TabsTrigger>
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
        </div>
    );
}
