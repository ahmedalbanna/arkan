'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/AuthContext';
import { Gem, ShoppingCart, ArrowLeft, Loader2, Send, CheckCircle, Upload, AlertCircle, ArrowRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePublicSettings, useSubmitPaymentProof, useToast } from '@/hooks';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';
import { ShieldCheck, Zap, Wallet, Banknote, Globe, Smartphone, CheckCircle2 } from 'lucide-react';
import { PaymentMethod } from '@/modules/billing/domain/entities/PaymentMethod';
import { Label } from '@/components/ui/label';

const CREDIT_PRICE = 0.10; // $0.10 per credit

const fileSchema = z.object({
  file: z.any().refine((file) => file instanceof File, 'Please upload a valid proof file.'),
});

function getPaymentMethodIcon(type: string) {
  switch (type) {
    case 'e-wallet': return <Smartphone className="h-5 w-5" />;
    case 'bank': return <Banknote className="h-5 w-5" />;
    case 'local-transfer': return <Wallet className="h-5 w-5" />;
    case 'international-transfer': return <Globe className="h-5 w-5" />;
    default: return <Banknote className="h-5 w-5" />;
  }
}

function BankDetailsSkeleton() {
  return (
    <div className="space-y-3 p-4 border rounded-xl animate-pulse bg-muted/10">
      <div className="h-4 w-32 bg-muted rounded"></div>
      <div className="h-3 w-48 bg-muted rounded"></div>
      <div className="h-10 w-full bg-muted rounded"></div>
    </div>
  );
}

function AccountDetail({ label, value }: { label: string, value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</span>
      <div className="flex items-center justify-between gap-4 p-2.5 rounded-lg border bg-muted/5 group/detail">
        <span className="text-xs font-mono font-bold truncate">{value}</span>
        <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[8px] font-bold uppercase tracking-tighter opacity-0 group-hover/detail:opacity-100 transition-all"
            onClick={() => {
                navigator.clipboard.writeText(value);
            }}
        >
            Copy
        </Button>
      </div>
    </div>
  );
}

// Payment Method Card Component
function PaymentMethodCard({ method, onSelect }: { method: PaymentMethod; onSelect: (method: PaymentMethod) => void }) {
  return (
    <div
      className="group relative flex items-center justify-between p-5 rounded-2xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer active:scale-[0.98]"
      onClick={() => onSelect(method)}
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          {getPaymentMethodIcon(method.type)}
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold tracking-tight">{method.displayName}</h4>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">{method.type}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Selected Payment Details Component
function PaymentMethodDetails({ method }: { method: PaymentMethod }) {
  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          {getPaymentMethodIcon(method.type)}
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight">{method.displayName}</h3>
          <Badge variant="secondary" className="h-4.5 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none bg-primary/5 text-primary">
            Secure Settlement Node
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {method.accountHolder && <AccountDetail label="Settlement Holder" value={method.accountHolder} />}

        {method.currencies && Object.entries(method.currencies).map(([currency, details]: [string, any]) => (
          <AccountDetail key={currency} label={`${currency} IBAN Matrix`} value={details.iban} />
        ))}

        {method.wallet && (
          <>
            <AccountDetail label="Wallet Provider" value={method.wallet.provider} />
            <AccountDetail label="Network Identifier" value={method.wallet.accountNumber} />
          </>
        )}

        {method.instructions && (
          <div className="space-y-2 p-4 rounded-xl border border-dashed bg-muted/5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Execution Instructions</span>
            <p className="text-[11px] text-muted-foreground italic leading-relaxed">{method.instructions}</p>
          </div>
        )}
      </div>
    </div>
  );
}

type FileFormValues = z.infer<typeof fileSchema>;

export function PurchaseCreditsDialog({ trigger }: { trigger: React.ReactNode }) {
  const { t } = useLocalization();
  const { userProfile: user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [credits, setCredits] = useState(100);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const price = credits * CREDIT_PRICE;

  const { data: settings, isLoading: isLoadingSettings, isError: isSettingsError } = usePublicSettings();
  const paymentMethods = settings?.paymentMethods?.filter(m => m.isActive) || [];

  const form = useForm<FileFormValues>({
    resolver: zodResolver(fileSchema),
  });

  const mutation = useSubmitPaymentProof({
    onSuccess: () => {
      setStep(3);
      form.reset();
    },
  });

  function handleContinue() {
    setStep(2);
  }

  function handleCloseAndReset() {
    setIsOpen(false);
    setTimeout(() => {
        setStep(1);
        setCredits(100);
        setSelectedPaymentMethod(null);
        form.reset();
    }, 300);
  }

  function handleSelectPaymentMethod(method: PaymentMethod) {
    setSelectedPaymentMethod(method);
  }

  function handleBackToMethods() {
    setSelectedPaymentMethod(null);
  }

  async function onSubmit(data: FileFormValues) {
    if (!user) return;
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('userId', user.id);
    formData.append('credits', credits.toString());
    formData.append('price', price.toFixed(2));
    formData.append('planId', `custom-${credits}`);
    formData.append('planName', `${credits} Credits`);
    formData.append('userName', user.name || 'N/A');
    formData.append('userEmail', user.email || 'N/A');
    mutation.mutate(formData);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl p-0 overflow-hidden flex flex-col gap-0 border-none shadow-2xl rounded-[32px] bg-background">
        <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <DialogTitle className="text-xl font-bold font-headline tracking-tight leading-none">Neural Quota Acquisition Manifest</DialogTitle>
          </div>
          <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
            Step {step} of 3
          </Badge>
        </header>

        <div className="flex-1 overflow-hidden relative min-h-0 bg-[#f8fafc] dark:bg-black/20 shadow-inner">
            <ScrollArea className="h-full">
                <div className="p-10 pb-20">
                    {step === 1 && (
                        <div className="max-w-xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="text-center space-y-4">
                                <div className="h-20 w-20 rounded-[32px] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-inner group">
                                    <Gem className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold font-headline tracking-tight uppercase tracking-[0.1em]">{t('pricing.pageTitle')}</h2>
                                    <p className="text-xs text-muted-foreground italic leading-relaxed">{t('pricing.pageSubtitle')}</p>
                                </div>
                            </div>

                            <div className="space-y-8 p-10 rounded-[40px] bg-background border border-border/40 shadow-2xl shadow-primary/5 relative group">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.02),transparent_50%)]" />

                                <div className="relative z-10 space-y-10">
                                    <div className="text-center space-y-2">
                                        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Acquisition Yield</div>
                                        <div className="text-7xl font-black font-headline text-primary tracking-tighter tabular-nums">{credits}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Neural Units</div>
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
                                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">
                                            <span>Min Node: 50</span>
                                            <span>Max Node: 5000</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border/40 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Estimated Settlement</span>
                                            <span className="text-3xl font-black tabular-nums tracking-tighter">${price.toFixed(2)}</span>
                                        </div>
                                        <Badge variant="secondary" className="h-6 text-[10px] px-2 font-bold tracking-tighter bg-primary/5 text-primary border-none">
                                            ${CREDIT_PRICE.toFixed(2)} / UNIT
                                        </Badge>
                                    </div>

                                    <Button onClick={handleContinue} className="w-full h-14 font-bold shadow-2xl shadow-primary/30 rounded-2xl gap-3 text-base active:scale-[0.98] transition-all">
                                        <ShoppingCart className="h-5 w-5" />
                                        Initialize Acquisition Protocol
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center justify-between">
                                <Button variant="ghost" size="sm" onClick={selectedPaymentMethod ? handleBackToMethods : () => setStep(1)} className="h-10 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-background/50 rounded-xl">
                                    <ArrowLeft className="h-4 w-4" />
                                    {t('common.back')}
                                </Button>
                                <div className="text-center flex-1 pr-10">
                                    <h2 className="text-xl font-bold font-headline tracking-tight uppercase tracking-widest">{selectedPaymentMethod ? 'Settlement Confirmation' : 'Linguistic Settlement'}</h2>
                                    <p className="text-[10px] text-muted-foreground italic">{selectedPaymentMethod ? `Finalize transmission of $${price.toFixed(2)}` : 'Select your authorized settlement node.'}</p>
                                </div>
                            </div>

                            {selectedPaymentMethod ? (
                                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                                    <div className="rounded-[32px] overflow-hidden shadow-2xl border bg-card">
                                        <PaymentMethodDetails method={selectedPaymentMethod} />
                                    </div>

                                    <div className="p-8 rounded-[32px] border bg-background shadow-xl shadow-primary/5 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                            <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Digital Proof of Transmission</Label>
                                        </div>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                                <FormField
                                                    control={form.control}
                                                    name="file"
                                                    render={({ field: { value, onChange, ...fieldProps } }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <div className={cn(
                                                                    "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all hover:bg-muted/5 group",
                                                                    form.getValues('file') ? "border-primary/40 bg-primary/[0.02]" : "border-border/60 hover:border-primary/20"
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
                                                                    <label htmlFor="proof-upload" className="cursor-pointer space-y-4">
                                                                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform">
                                                                            <Upload className="h-6 w-6" />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <p className="text-[11px] font-bold uppercase tracking-widest">{form.getValues('file')?.name || "Select Transmission Snapshot"}</p>
                                                                            <p className="text-[10px] text-muted-foreground italic">PDF or High-Resolution Image (Max 5MB)</p>
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="text-[10px] font-bold uppercase mt-2 px-2" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button type="submit" className="w-full h-12 font-bold shadow-xl shadow-primary/30 rounded-xl gap-3 active:scale-[0.98] transition-all" disabled={mutation.isPending || !form.watch('file')}>
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
                                        <PaymentMethodCard key={method.id} method={method} onSelect={handleSelectPaymentMethod} />
                                    ))}
                                    {paymentMethods.length === 0 && !isLoadingSettings && (
                                        <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-muted/10 opacity-40">
                                            <AlertCircle className="h-10 w-10 mx-auto mb-3" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">No Settlement Nodes Active</p>
                                        </div>
                                    )}
                                    {isLoadingSettings && <div className="space-y-4"><Skeleton className="h-24 w-full rounded-2xl" /><Skeleton className="h-24 w-full rounded-2xl" /></div>}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="max-w-md mx-auto py-20 text-center space-y-10 animate-in zoom-in-95 duration-1000">
                            <div className="relative inline-block">
                                <div className="h-24 w-24 bg-primary/10 rounded-[40px] flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                                    <CheckCircle2 className="h-12 w-12 text-primary" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-background border shadow-lg rounded-xl p-1.5 animate-bounce">
                                    <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold font-headline tracking-tight uppercase tracking-widest">Audit Pending</h2>
                                <p className="text-sm text-muted-foreground italic leading-relaxed font-serif px-6">
                                    Your settlement manifest has been transmitted successfully. A system administrator will validate the transaction within standard processing cycles (24h).
                                </p>
                            </div>

                            <div className="pt-6">
                                <Button onClick={handleCloseAndReset} className="w-full h-12 font-bold shadow-xl shadow-primary/20 rounded-xl active:scale-[0.98] transition-all">
                                    Continue to Workspace
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>

        <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                Arkan Financial Engine • Settlement Node V1.0 Stable
            </p>
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary/40" />
                <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground/40">Secured Transmission Active</span>
            </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
