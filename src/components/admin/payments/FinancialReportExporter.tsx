
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast } from '@/hooks';
import { generateFinancialReportPdf } from '@/lib/pdf-utils';
import { cn } from '@/lib/utils';
import { fetchTransactionsForReport } from '@/services';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

export function FinancialReportExporter() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const { firebaseUser } = useAuth();
    const { toast } = useToast();
    const { t } = useLocalization();

    const handleExport = async () => {
        if (!dateRange?.from || !dateRange?.to || !firebaseUser) {
            toast({
                title: t('adminFinancialReport.missingInfoError'),
                description: t('adminFinancialReport.missingInfoDesc'),
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            const token = await firebaseUser.getIdToken();
            const transactions = await fetchTransactionsForReport({
                startDate: dateRange.from.toISOString(),
                endDate: dateRange.to.toISOString(),
                token,
            });

            if (transactions.length === 0) {
                 toast({
                    title: t('adminFinancialReport.noData'),
                    description: t('adminFinancialReport.noDataDesc'),
                });
                return;
            }

            await generateFinancialReportPdf(transactions, dateRange);

        } catch (error: any) {
            toast({
                title: t('adminFinancialReport.exportFailed'),
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-headline font-semibold">{t('adminFinancialReport.title')}</CardTitle>
                            <CardDescription>{t('adminFinancialReport.description')}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant="outline"
                                className={cn(
                                    "w-full sm:w-[300px] justify-start text-left font-normal hover:shadow-soft transition-all duration-200",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="me-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>{t('adminFinancialReport.datePlaceholder')}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button
                        onClick={handleExport}
                        disabled={isLoading}
                        variant="gradient"
                        className="hover:shadow-glow transition-all duration-200"
                    >
                        {isLoading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Download className="me-2 h-4 w-4" />}
                        {t('adminFinancialReport.exportButton')}
                    </Button>
                </CardContent>
            </Card>
        </AnimatedContainer>
    );
}
