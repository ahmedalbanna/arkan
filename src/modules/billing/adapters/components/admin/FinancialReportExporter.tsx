'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/infrastructure/utils/cn';
import { useAuth } from '@/context/AuthContext';
import { container } from '@/infrastructure/di/container';
import { TransactionApiClient } from '@/modules/billing/adapters/api-client/TransactionApiClient';
import { useToast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { convertMarkdownToPdf } from '@/modules/ai-content/infrastructure/utils/pdf-utils';
import { type TransactionProperties } from '@/modules/billing/domain/entities/Transaction';
import { runAuthenticatedResultCall } from '@/infrastructure/api/authenticated-client-call';

function formatTransactionsToMarkdown(transactions: TransactionProperties[], dateRange: DateRange): string {
  let markdown = `# Financial Report\n\n`;
  if (dateRange.from && dateRange.to) markdown += `**Date Range:** ${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}\n\n`;
  markdown += `| Transaction ID | User Name | Plan | Amount | Status | Date |\n|---|---|---|---|---|---|\n`;
  let totalVerified = 0;
  transactions.forEach((t) => {
    markdown += `| ${t.id.slice(0, 8)} | ${t.userName} | ${t.planName} | $${t.price.toFixed(2)} | ${t.status} | ${new Date(t.createdAt).toLocaleDateString()} |\n`;
    if (t.status === 'verified') totalVerified += t.price;
  });
  markdown += `\n## Summary\n\n- **Total Transactions:** ${transactions.length}\n- **Total Verified Revenue:** $${totalVerified.toFixed(2)}\n`;
  return markdown;
}

export function FinancialReportExporter() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLocalization();

  async function handleExport() {
    if (!dateRange?.from || !dateRange?.to || !user) {
      toast({ title: t('adminFinancialReport.missingInfoError'), description: t('adminFinancialReport.missingInfoDesc'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const client = container.resolve(TransactionApiClient);
      const result = await client.fetchTransactionsForReport({ 
        startDate: dateRange.from!.toISOString(), 
        endDate: dateRange.to!.toISOString() 
      });
      if (result.isFailure) throw result.error;
      const transactions = result.getValue();

      if (transactions.length === 0) {
        toast({ title: t('adminFinancialReport.noData'), description: t('adminFinancialReport.noDataDesc') });
        return;
      }

      const markdownReport = formatTransactionsToMarkdown(transactions, dateRange);
      await convertMarkdownToPdf(markdownReport, `Financial_Report_${format(new Date(), 'yyyy-MM-dd')}`);
    } catch (error: any) {
      toast({ title: t('adminFinancialReport.exportFailed'), description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>{t('adminFinancialReport.title')}</CardTitle><CardDescription>{t('adminFinancialReport.description')}</CardDescription></CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button id="date" variant="outline" className={cn('w-full sm:w-[300px] justify-start text-left font-normal', !dateRange && 'text-muted-foreground')}>
              <CalendarIcon className="me-2 h-4 w-4" />
              {dateRange?.from ? dateRange.to ? <>{format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}</> : format(dateRange.from, 'LLL dd, y') : <span>{t('adminFinancialReport.datePlaceholder')}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} /></PopoverContent>
        </Popover>
        <Button onClick={handleExport} disabled={isLoading}>{isLoading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Download className="me-2 h-4 w-4" />}{t('adminFinancialReport.exportButton')}</Button>
      </CardContent>
    </Card>
  );
}
