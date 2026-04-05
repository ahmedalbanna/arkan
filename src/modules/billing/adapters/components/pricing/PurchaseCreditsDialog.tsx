'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState, useMemo, useCallback } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
    Gem, 
    ShoppingCart, 
    ArrowLeft, 
    Upload, 
    CheckCircle2, 
    Loader2, 
    ShieldCheck, 
    AlertCircle, 
    Banknote,
    CreditCard,
    Smartphone
} from 'lucide-react';
import { usePublicSettings } from '@/modules/admin/adapters/hooks/use-settings';
import { useSubmitPaymentProof } from '@/modules/billing/adapters/hooks/use-transactions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks';
import { cn } from '@/infrastructure/utils/cn';
import { type PaymentMethod } from '@/modules/billing/domain/entities/PaymentMethod';

/**
 * PurchaseCreditsDialog — High-fidelity acquisition manifest for neural quotas.
 * Orchestrates the multi-step protocol for credit procurement and proof submission.
 * 
 * DEFENSIVE MEASURES:
 * 1. Step Validation: Guards against invalid state transitions during the acquisition lifecycle.
 * 2. Proof Ingestion: Implements strict file type and size validation via schema.
 * 3. Atomic Submission: Wraps FormData synthesis and mutation in try-catch containment.
 * 4. UX Integrity: Handles missing payment methods and loading states with high-fidelity fallbacks.
 */

const CREDIT_PRICE = 0.10; // $0.10 per credit
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const fileSchema = z.object({
  file: z.instanceof(File, { message: 'A valid transmission snapshot is required.' })
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Snapshot volume exceeds 5MB limit.')
    .refine((file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), 'Invalid file vector. Use PDF or high-res images.'),
});

type FileFormValues = z.infer<typeof fileSchema>;

function getPaymentMethodIcon(type: string) {
  switch (type) {
    case 'bank': return <Banknote className="h-5 w-5" />;
    case 'crypto': return <Gem className="h-5 w-5" />;
    case 'wallet': return <Smartphone className="h-5 w-5" />;
    default: return <CreditCard className="h-5 w-5" />;
  }
}

// ── Payment Method Sub-components ──────────────────────────────────────────────

function PaymentMethodCard({ method, onSelect }: { method: PaymentMethod; onSelect: (method: PaymentMethod) => void }) {
  return (
    <button
      onClick={() => onSelect(method)}
      className="w-full flex items-center justify-between p-6 rounded-3xl border border-border/60 bg-background/60 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group text-left"
    >
      <div className="flex items-center gap-5">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
          {getPaymentMethodIcon(method.type)}
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-tight text-foreground/80">{method.name}</h4>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-60">{method.type} node</p>
        </div>
      </div>
      <div className="h-8 w-8 rounded-full bg-muted/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
        <ArrowLeft className="h-4 w-4 rotate-180" />
      </div>
    </button>
  );
}

function PaymentMethodDetails({ method }: { method: PaymentMethod }) {
  return (
    <div className="p-8 bg-muted/5 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Node Parameters</span>
      </div>
      <div className="grid gap-4">
        {method.accountHolder && (
          <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-background border border-border/40 shadow-sm group/detail">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Account Holder</span>
            <span className="text-[12px] font-bold text-foreground/80">{method.accountHolder}</span>
          </div>
        )}
        
        {method.wallet && (
          <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-background border border-border/40 shadow-sm">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Wallet Details</span>
            <div className="space-y-2">
              {method.wallet.provider && <p className="text-[11px] font-medium uppercase tracking-tight">Provider: {method.wallet.provider}</p>}
              {method.wallet.number && <p className="text-[12px] font-black font-mono tracking-tight text-primary">Number: {method.wallet.number}</p>}
              {method.wallet.phoneNumber && <p className="text-[12px] font-black font-mono tracking-tight text-primary">Phone: {method.wallet.phoneNumber}</p>}
            </div>
          </div>
        )}

        {method.currencies && Object.entries(method.currencies).map(([currency, details]) => (
          <div key={currency} className="flex flex-col gap-2 p-4 rounded-2xl bg-background border border-border/40 shadow-sm">
            <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{currency} Parameters</span>
                <Badge variant="outline" className="h-4 text-[8px] font-black border-primary/20 text-primary">{currency}</Badge>
            </div>
            <div className="space-y-1 text-[11px] font-bold text-foreground/80 tabular-nums">
                {details?.iban && <p className="break-all opacity-80">IBAN: {details.iban}</p>}
                {details?.accountNumber && <p>Account: {details.accountNumber}</p>}
                {details?.swiftCode && <p>SWIFT: {details.swiftCode}</p>}
            </div>
          </div>
        ))}

        {method.instructions && (
          <div className="p-4 rounded-2xl border border-dashed border-primary/20 bg-primary/5">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Instructions</span>
            <p className="text-[11px] mt-1 text-muted-foreground italic font-medium leading-relaxed">{method.instructions}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Controller ────────────────────────────────────────────────────────────

export function PurchaseCreditsDialog({ trigger }: { trigger: React.ReactNode }) {
  const { t } = useLocalization();
  const { userProfile: user } = useAuth();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [credits, setCredits] = useState(100);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  
  const price = credits * CREDIT_PRICE;

  const { data: settings, isLoading: isLoadingSettings } = usePublicSettings();
  const paymentMethods = useMemo(() => 
    settings?.paymentMethods?.filter(m => m.isActive) || [], 
  [settings]);

  const form = useForm<FileFormValues>({
    resolver: zodResolver(fileSchema),
  });

  const mutation = useSubmitPaymentProof({
    onSuccess: () => {
      setStep(3);
      form.reset();
    },
  });

  const handleCloseAndReset = useCallback(() => {
    setIsOpen(false);
    // Latency for exit animation
    setTimeout(() => {
        setStep(1);
        setCredits(100);
        setSelectedPaymentMethod(null);
        form.reset();
    }, 300);
  }, [form]);

  const onSubmit = async (data: FileFormValues) => {
    if (!user || !selectedPaymentMethod) return;
    
    try {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('userId', user.id);
        formData.append('credits', credits.toString());
        formData.append('price', price.toFixed(2));
        formData.append('planId', `custom-${credits}`);
        formData.append('planName', `${credits} Credits`);
        formData.append('userName', user.name || 'Anonymous Node');
        formData.append('userEmail', user.email || 'N/A');
        formData.append('methodId', selectedPaymentMethod.id);
        
        mutation.mutate(formData);
    } catch (error) {
        console.error('[PurchaseCredits] Manifest synthesis failed:', error);
        toast({ title: 'System Error', description: 'Failed to initialize settlement vector.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !mutation.isPending && setIsOpen(v)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl p-0 overflow-hidden flex flex-col gap-0 border-primary/10 shadow-2xl rounded-[32px] bg-background/80 backdrop-blur-3xl">
        <header className="px-10 py-8 border-b border-primary/10 bg-primary/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner relative group/logo">
                <Gem className="h-5 w-5 text-primary group-hover/logo:scale-110 transition-transform duration-500" />
            </div>
            <div>
                <DialogTitle className="text-[16px] font-black uppercase tracking-tight">Neural Quota Acquisition</DialogTitle>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold mt-0.5">Vector Procurement Pipeline</p>
            </div>
          </div>
          <Badge variant="outline" className="h-6 text-[10px] uppercase tracking-[0.2em] font-black border-primary/20 text-primary bg-primary/5 px-3 rounded-full">
            Protocol Step {step} / 3
          </Badge>
        </header>

        <div className="flex-1 overflow-hidden relative min-h-0 bg-background/20">
            {/* Dot-grid atmosphere — Standardized alignment (28px) */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />
            
            <ScrollArea className="h-full custom-scrollbar">
                <div className="p-10 pb-24 relative z-10">
                    {/* Depth architectural line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

                    {step === 1 && (
                        <div className="max-w-xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="space-y-8 p-10 rounded-[40px] bg-background/60 backdrop-blur-md border border-primary/10 shadow-2xl relative group overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.05),transparent_50%)]" />

                                <div className="relative z-10 space-y-10">
                                    <div className="text-center space-y-2">
                                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Yield Projection</div>
                                        <div className="text-7xl font-black font-headline text-primary tracking-tighter tabular-nums">{credits}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Neural Energy Units</div>
                                    </div>

                                    <div className="space-y-4">
                                        <Slider
                                            value={[credits]}
                                            onValueChange={(value) => setCredits(value[0])}
                                            min={50}
                                            max={5000}
                                            step={50}
                                            className="cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 px-1">
                                            <span>MIN_NODE: 50</span>
                                            <span>MAX_NODE: 5000</span>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-primary/10 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Estimated Settlement</span>
                                            <span className="text-3xl font-black tabular-nums tracking-tighter">${price.toFixed(2)}</span>
                                        </div>
                                        <Badge variant="outline" className="h-7 text-[10px] px-3 font-black tracking-tighter bg-primary/5 border-primary/20 text-primary rounded-lg shadow-inner">
                                            ${CREDIT_PRICE.toFixed(2)} / UNIT
                                        </Badge>
                                    </div>

                                    <Button onClick={() => setStep(2)} className="w-full h-14 font-black shadow-2xl shadow-primary/30 rounded-2xl gap-3 text-[11px] uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 ring-1 ring-inset ring-white/20">
                                        <ShoppingCart className="h-5 w-5" />
                                        Initialize Protocol
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center justify-between px-1">
                                <Button variant="ghost" size="sm" onClick={selectedPaymentMethod ? () => setSelectedPaymentMethod(null) : () => setStep(1)} className="h-10 gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 rounded-xl transition-all">
                                    <ArrowLeft className="h-4 w-4" />
                                    Abort Level
                                </Button>
                                <div className="text-right">
                                    <h2 className="text-lg font-black uppercase tracking-tight text-foreground/90">{selectedPaymentMethod ? 'Verification Hub' : 'Settlement Matrix'}</h2>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">{selectedPaymentMethod ? `Finalizing transmission: $${price.toFixed(2)}` : 'Select authorized entry node'}</p>
                                </div>
                            </div>

                            {selectedPaymentMethod ? (
                                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                                    <div className="rounded-[32px] overflow-hidden shadow-2xl border border-primary/10 bg-background/60 backdrop-blur-md">
                                        <PaymentMethodDetails method={selectedPaymentMethod} />
                                    </div>

                                    <div className="p-8 rounded-[32px] border border-primary/10 bg-background/40 shadow-xl space-y-8 relative overflow-hidden">
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Digital Proof Ingestion</Label>
                                        </div>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                                                <FormField
                                                    control={form.control}
                                                    name="file"
                                                    render={({ field: { value, onChange, ...fieldProps } }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <div className={cn(
                                                                    "border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-500 group bg-muted/5 shadow-inner relative",
                                                                    form.watch('file') ? "border-primary/40 bg-primary/[0.03]" : "border-primary/10 hover:border-primary/30"
                                                                )}>
                                                                    <Input
                                                                        {...fieldProps}
                                                                        type="file"
                                                                        accept="image/*,.pdf"
                                                                        onChange={(e) => onChange(e.target.files?.[0])}
                                                                        disabled={mutation.isPending}
                                                                        className="hidden"
                                                                        id="proof-upload"
                                                                    />
                                                                    <label htmlFor="proof-upload" className="cursor-pointer space-y-5 block">
                                                                        <div className="h-16 w-16 rounded-[22px] bg-primary/10 flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner">
                                                                            <Upload className="h-7 w-7" />
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            <p className="text-[11px] font-black uppercase tracking-widest text-foreground/80">{form.watch('file')?.name || "Select Transmission Snapshot"}</p>
                                                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-40">PDF or High-Res Image • MAX 5MB</p>
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="text-[9px] font-bold uppercase mt-3 px-2 text-destructive/80 italic text-center" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button type="submit" className="w-full h-14 font-black shadow-2xl shadow-primary/30 rounded-2xl gap-3 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-[11px] ring-1 ring-inset ring-white/20" disabled={mutation.isPending || !form.watch('file')}>
                                                    {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                                                    Authorize Quota Settlement
                                                </Button>
                                            </form>
                                        </Form>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {paymentMethods.map((method) => (
                                        <PaymentMethodCard key={method.id} method={method} onSelect={setSelectedPaymentMethod} />
                                    ))}
                                    {paymentMethods.length === 0 && !isLoadingSettings && (
                                        <div className="text-center py-20 border-2 border-dashed border-primary/10 rounded-3xl bg-muted/5 opacity-40">
                                            <AlertCircle className="h-10 w-10 mx-auto mb-4 text-primary/40" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Settlement Nodes</p>
                                        </div>
                                    )}
                                    {isLoadingSettings && (
                                        <div className="space-y-4">
                                            <Skeleton className="h-24 w-full rounded-[28px]" />
                                            <Skeleton className="h-24 w-full rounded-[28px]" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="max-w-md mx-auto py-20 text-center space-y-12 animate-in zoom-in-95 duration-1000">
                            <div className="relative inline-block">
                                <div className="h-28 w-28 bg-primary/10 rounded-[44px] flex items-center justify-center mx-auto shadow-2xl animate-pulse relative">
                                    <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                                    <CheckCircle2 className="h-14 w-14 text-primary relative z-10" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-background border border-primary/20 shadow-lg rounded-2xl p-2 animate-bounce">
                                    <div className="h-4 w-4 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl font-black uppercase tracking-tight text-foreground/90">Audit Pending</h2>
                                <p className="text-[13px] text-muted-foreground italic leading-relaxed font-serif px-6 font-medium">
                                    Your settlement manifest has been transmitted. A system administrator will validate the transaction within standard processing cycles (24h).
                                </p>
                            </div>

                            <div className="pt-8">
                                <Button onClick={handleCloseAndReset} className="w-full h-14 font-black shadow-2xl shadow-primary/20 rounded-2xl active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-[11px] ring-1 ring-inset ring-white/20">
                                    Continue to Workspace
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>

        <footer className="px-10 py-6 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className="h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">
                    Financial Engine • Secure Node V2.4
                </p>
            </div>
            <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary/30" />
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20">Transmission Secured</span>
            </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
