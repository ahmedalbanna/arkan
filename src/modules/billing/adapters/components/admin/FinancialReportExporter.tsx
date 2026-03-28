'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast } from '@/hooks';
import { container } from '@/infrastructure/di/container';
import { cn } from '@/infrastructure/utils/cn';
import { convertMarkdownToPdf } from '@/modules/ai-content/infrastructure/utils/pdf-utils';
import { TransactionApiClient } from '@/modules/billing/adapters/api-client/TransactionApiClient';
import { type TransactionProperties } from '@/modules/billing/domain/entities/Transaction';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

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

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { FileDown, ShieldCheck } from 'lucide-react';

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
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] animate-in fade-in duration-700">
      <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Fiscal Inventory Manifest
          </h3>
        </div>
        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
          Reporting Node Active
        </Badge>
      </header>

      <CardContent className="p-8 md:p-10 space-y-8">
        <div className="space-y-1.5 text-center">
          <h4 className="text-sm font-semibold tracking-tight uppercase tracking-widest">{t('adminFinancialReport.title')}</h4>
          <p className="text-[11px] text-muted-foreground italic leading-relaxed max-w-lg mx-auto">
            {t('adminFinancialReport.description')}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-8 rounded-3xl border border-dashed border-border/60 bg-muted/5 shadow-inner">
          <div className="space-y-3 w-full md:w-auto">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Temporal Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    'w-full md:w-[320px] h-12 justify-start text-left font-bold rounded-xl bg-background shadow-sm border-none ring-1 ring-border/40 focus:ring-primary/40 transition-all',
                    !dateRange && 'text-muted-foreground font-medium'
                  )}
                >
                  <CalendarIcon className="me-3 h-4 w-4 text-primary/60" />
                  <span className="text-xs uppercase tracking-tighter">
                    {dateRange?.from ? dateRange.to ? <>{format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}</> : format(dateRange.from, 'MMM d, yyyy') : t('adminFinancialReport.datePlaceholder')}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="center">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="p-4"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="pt-6 md:pt-0">
            <Button
              onClick={handleExport}
              disabled={isLoading || !dateRange?.from || !dateRange?.to}
              className="h-12 px-10 font-bold shadow-xl shadow-primary/20 rounded-xl gap-3 active:scale-[0.98] transition-all"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileDown className="h-5 w-5" />}
              {t('adminFinancialReport.exportButton')}
            </Button>
          </div>
        </div>
      </CardContent>

      <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
          Arkan Fiscal Engine • Report Node V1.0 Stable
        </p>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-primary/40" />
          <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tighter">
            Data Accuracy Verified
          </span>
        </div>
      </footer>
    </Card>
  );
}
