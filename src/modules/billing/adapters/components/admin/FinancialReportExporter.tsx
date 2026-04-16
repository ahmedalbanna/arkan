'use client';

import React, { useState, useCallback } from 'react';
import { 
    Calendar as CalendarIcon, 
    Loader2, 
    FileDown, 
    ShieldCheck, 
    AlertCircle, 
    Banknote, 
    Binary, 
    Database,
    Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast } from '@/hooks';
import { container } from '@/infrastructure/di/container';
import { cn } from '@/infrastructure/utils/cn';
import { convertMarkdownToPdf } from '@/infrastructure/exporters/pdf-utils';
import { TransactionApiClient } from '@/modules/billing/adapters/api-client/TransactionApiClient';
import { type TransactionProperties } from '@/modules/billing/domain/entities/Transaction';

/**
 * FinancialReportExporter — High-fidelity manifest for fiscal data extraction.
 * Orchestrates the synthesis of transactional vectors into professional PDF audits.
 * 
 * DEFENSIVE MEASURES:
 * 1. Data Mapping: Safe formatting handling null/undefined ledger nodes.
 * 2. Containment: Robust try-catch wrapper around the PDF production pipeline.
 * 3. Existence Guards: Prevents execution without valid identity or temporal range.
 * 4. Technical Aesthetic: Standardized 28px dot-grids and technical typography.
 */

function formatTransactionsToMarkdown(transactions: TransactionProperties[], dateRange: DateRange): string {
  try {
    let markdown = `# Arkan Financial Report\n\n`;
    
    if (dateRange.from && dateRange.to) {
        markdown += `**Operational Window:** ${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}\n\n`;
    }
    
    markdown += `| Vector ID | Registry Name | Plan Node | Price | Status | Timestamp |\n|---|---|---|---|---|---|\n`;
    
    let totalVerified = 0;
    (transactions || []).forEach((t) => {
        const safeId = t.id ? t.id.slice(0, 8) : 'UNK_NODE';
        const safeName = t.userName || 'Anonymous Entity';
        const safePlan = t.planName || 'N/A';
        const safePrice = typeof t.price === 'number' ? t.price.toFixed(2) : '0.00';
        const safeDate = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Pending';
        
        markdown += `| ${safeId} | ${safeName} | ${safePlan} | $${safePrice} | ${t.status || 'unknown'} | ${safeDate} |\n`;
        
        if (t.status === 'verified' && typeof t.price === 'number') {
            totalVerified += t.price;
        }
    });
    
    markdown += `\n## Spectral Summary\n\n`;
    markdown += `- **Total Ingress Vectors:** ${transactions?.length || 0}\n`;
    markdown += `- **Aggregated Verified Revenue:** $${totalVerified.toFixed(2)}\n`;
    markdown += `\n*System-generated audit node · Stable Manifest V2.4*\n`;
    
    return markdown;
  } catch (e) {
    console.error('[FinancialReport] Markdown formatting failed:', e);
    return '# System Error\n\nFailed to synthesize financial markdown manifest.';
  }
}

export function FinancialReportExporter() {
  const { t } = useLocalization();
  const { userProfile: user } = useAuth();
  const { toast } = useToast();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // 1. PRODUCTION EXECUTION — Guarded PDF synthesis
  const handleExport = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to || !user) {
      toast({ 
        title: 'Information Incomplete', 
        description: 'Please define a valid temporal range and verify identity node status.', 
        variant: 'destructive' 
      });
      return;
    }

    setIsLoading(true);
    try {
      const client = container.resolve(TransactionApiClient);
      const result = await client.fetchTransactionsForReport({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      });

      if (result.isFailure) throw result.error;
      const transactions = result.getValue();

      if (!transactions || transactions.length === 0) {
        toast({ 
            title: 'Zero Result Matrix', 
            description: 'The ledger scan completed with no matching transactional nodes.' 
        });
        return;
      }

      const markdownReport = formatTransactionsToMarkdown(transactions, dateRange);
      
      // AST Transformation Vector
      await convertMarkdownToPdf(
        markdownReport, 
        `Fiscal_Audit_${format(new Date(), 'yyyyMMdd_HHmm')}`
      );

      toast({ title: 'Audit Successful', description: 'Financial manifest successfully synthesized and transmitted.' });
    } catch (error: any) {
      console.error('[FinancialReport] Production pipeline failure:', error);
      toast({ 
        title: 'System Error', 
        description: error.message || 'An unexpected failure occurred during audit synthesis.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, user, toast]);

  return (
    <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[40px] relative animate-in fade-in duration-700">
      {/* 28px Dot-grid Atmosphere — Standardized alignment */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" 
        style={{ backgroundSize: '28px 28px' }}
      />

      <header className="px-10 py-8 border-b border-primary/10 bg-primary/[0.02] flex items-center justify-between relative z-10">
        <div className="flex items-center gap-5">
          <div className="h-12 w-12 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group/logo relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 blur-lg group-hover:blur-xl transition-all" />
            <Database className="h-6 w-6 text-primary relative z-10 transition-transform duration-500 group-hover:rotate-12" />
          </div>
          <div>
            <h3 className="text-[18px] font-black uppercase tracking-tight text-foreground/90 leading-none">
                Fiscal Audit Hub
            </h3>
            <div className="flex items-center gap-2 mt-2.5">
                <div className={cn(
                    "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.6)]",
                    isLoading ? "bg-primary animate-pulse" : "bg-primary/40"
                )} />
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
                    {isLoading ? 'Neural Pipeline Compiling...' : 'Reporting Node Operational'}
                </p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="h-7 text-[10px] uppercase tracking-[0.3em] font-black border-primary/20 text-primary bg-primary/5 px-4 rounded-full shadow-inner ring-1 ring-inset ring-primary/10">
          Level 4 Access
        </Badge>
      </header>

      <CardContent className="p-10 space-y-10 relative z-10">
        <div className="space-y-2 text-center px-1">
          <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-foreground/80">Ledger Vector Extraction</h4>
          <p className="text-[11px] text-muted-foreground italic leading-relaxed max-w-lg mx-auto font-medium opacity-70">
            Synthesize a comprehensive financial manifest for specified temporal windows. All data is verified against the secure registry.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-10 rounded-[32px] border border-dashed border-primary/10 bg-muted/5 shadow-inner relative group">
          {/* Depth architectural line */}
          <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

          <div className="space-y-4 w-full md:w-auto">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-1">Temporal Window</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    'w-full md:w-[360px] h-14 justify-start text-left font-black rounded-2xl bg-background/60 backdrop-blur-md shadow-xl border-primary/10 hover:border-primary/20 transition-all duration-500 ring-1 ring-inset ring-primary/5',
                    !dateRange && 'text-muted-foreground/40'
                  )}
                >
                  <CalendarIcon className="mr-3 h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
                  <span className="text-[11px] uppercase tracking-widest tabular-nums">
                    {dateRange?.from ? dateRange.to ? <>{format(dateRange.from, 'MMM d, yyyy')} — {format(dateRange.to, 'MMM d, yyyy')}</> : format(dateRange.from, 'MMM d, yyyy') : 'SELECT_TEMPORAL_RANGE'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-3xl border-primary/10 shadow-2xl bg-background/95 backdrop-blur-3xl overflow-hidden" align="center">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="p-6"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="pt-6 md:pt-7">
            <Button
              onClick={handleExport}
              disabled={isLoading || !dateRange?.from || !dateRange?.to}
              className="h-14 px-12 font-black shadow-2xl shadow-primary/30 rounded-2xl gap-3 transition-all hover:scale-[1.02] active:scale-95 ring-1 ring-inset ring-white/20 uppercase tracking-[0.25em] text-[11px] bg-primary relative overflow-hidden group/btn"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileDown className="h-5 w-5 transition-transform group-hover/btn:translate-y-0.5" />}
              Initialize Audit
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
            </Button>
          </div>
        </div>
      </CardContent>

      <footer className="px-10 py-6 border-t border-primary/10 bg-muted/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
          <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">
            Arkan Fiscal Ledger • Audit Node V2.4 Stable
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-primary/30" />
          <span className="text-[8px] text-muted-foreground/20 font-black uppercase tracking-widest">
            Data Accuracy Invariant
          </span>
        </div>
      </footer>
    </Card>
  );
}
