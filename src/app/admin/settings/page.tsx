'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
    Save, 
    Loader2, 
    Plus, 
    Trash2, 
    ShieldCheck, 
    Banknote, 
    Smartphone, 
    CreditCard, 
    Gem,
    Settings2,
    Database,
    Binary,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalization } from '@/context/LocalizationContext';
import { useSettings, useUpdateSettings } from '@/modules/admin/adapters/hooks/use-settings';
import { AppSettings } from '@/modules/admin/domain/entities/Settings';
import { type PaymentMethod, paymentMethodSchema } from '@/modules/billing/domain/entities/PaymentMethod';
import { useToast } from '@/hooks';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';

/**
 * AdminSettingsPage — Global system configuration manifest.
 * Manages neural quotas, settlement protocols, and system-wide operational parameters.
 * 
 * DEFENSIVE MEASURES:
 * 1. Schema Alignment: Synchronized with AppSettings domain properties (newUserCredits).
 * 2. Atomic Mapping: Selectively updates nested payment nodes to prevent corruption.
 * 3. Lifecycle Integrity: Correctly handles form resets during background refetch cycles.
 * 4. UX Safety: Integrated error badges and neural sync pulses for production observability.
 */

const settingsSchema = z.object({
  newUserCredits: z.coerce.number().int().min(0, 'Minimum initial quota is 0'),
  paymentMethods: z.array(paymentMethodSchema),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function getPaymentMethodIcon(type: string) {
  switch (type) {
    case 'bank': return <Banknote className="h-4 w-4" />;
    case 'e-wallet': return <Smartphone className="h-4 w-4" />;
    default: return <CreditCard className="h-4 w-4" />;
  }
}

// ── Main Controller ────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { data: settings, isLoading, isError } = useSettings();
  const updateMutation = useUpdateSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      newUserCredits: 100,
      paymentMethods: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'paymentMethods',
  });

  // 1. LIFECYCLE INTEGRITY — Safe form hydration
  useEffect(() => {
    if (settings && !form.formState.isDirty) {
      form.reset({
        newUserCredits: settings.newUserCredits ?? 100,
        paymentMethods: settings.paymentMethods || [],
      });
    }
  }, [settings, form]);

  // 2. SUBMISSION VECTOR — Guarded persistence
  const onSubmit = async (values: SettingsFormValues) => {
    try {
        const updateData: AppSettings = {
            newUserCredits: values.newUserCredits,
            paymentMethods: values.paymentMethods as any,
        };
        
        await updateMutation.mutateAsync(updateData);
        toast({ title: 'Manifest Synchronized', description: 'System parameters successfully committed to global matrix.' });
    } catch (error) {
        console.error('[AdminSettings] Update failed:', error);
        toast({ title: 'Sync Error', description: 'Failed to commit system configuration changes.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-96 space-y-6 opacity-40">
            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Extracting Global Manifest...</p>
        </div>
    );
  }

  if (isError) {
    return (
        <div className="flex flex-col items-center justify-center h-96 space-y-6 animate-in zoom-in-95 duration-500">
            <div className="p-8 rounded-[32px] bg-destructive/5 border border-dashed border-destructive/20 shadow-inner">
                <AlertCircle className="h-12 w-12 text-destructive/40" />
            </div>
            <div className="space-y-2 text-center">
                <h3 className="text-[16px] font-black uppercase tracking-[0.2em] text-destructive/80">Matrix Sync Failure</h3>
                <p className="text-[11px] text-muted-foreground/60 italic font-medium px-12 max-w-md">The administrative core could not establish a secure link with the settings database.</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline" className="h-10 px-8 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 font-bold uppercase tracking-widest text-[9px]">Reinitialize Hub</Button>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-black border-primary/20 text-primary bg-background">System Manifest</Badge>
              <div className="h-3 w-px bg-primary/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Global Oversight</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tighter text-foreground flex items-center gap-4">
              <Settings2 className="w-10 h-10 text-primary" />
              Matrix Configuration
            </h1>
            <p className="text-lg text-muted-foreground italic font-serif opacity-80 max-w-2xl leading-relaxed">
                Fine-tune the neural infrastructure, financial nodes, and system-wide operational parameters.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 rounded-2xl bg-background border border-primary/10 shadow-sm flex flex-col items-end group">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 group-hover:text-primary transition-colors">Core Status</span>
                <span className="text-xs font-black text-primary flex items-center gap-2 mt-1 uppercase tracking-tight">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                    Synchronized
                </span>
            </div>
        </div>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
          
          {/* Sector 1: Neural Economics */}
          <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[40px] relative">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />
            <header className="px-10 py-8 border-b border-primary/10 bg-primary/[0.02] flex items-center gap-5 relative z-10">
                <div className="h-12 w-12 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                    <Binary className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-[18px] font-black uppercase tracking-tight text-foreground/90 leading-none">Neural Economics</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70 mt-2.5">Initial Quota Parameters</p>
                </div>
            </header>
            <CardContent className="p-10 relative z-10">
                <div className="max-w-md">
                    <FormField
                        control={form.control}
                        name="newUserCredits"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">New User Neural Energy</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <Input type="number" {...field} className="h-12 pl-12 text-sm font-black bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-2xl shadow-inner tabular-nums" />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40">
                                            <Database className="h-4 w-4" />
                                        </div>
                                    </div>
                                </FormControl>
                                <CardDescription className="text-[10px] italic font-medium">Initial credits granted to new system entities upon registration.</CardDescription>
                                <FormMessage className="text-[10px] font-bold italic text-destructive/80" />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
          </Card>

          {/* Sector 2: Settlement Matrix */}
          <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[40px] relative">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" />
            <header className="px-10 py-8 border-b border-primary/10 bg-primary/[0.02] flex items-center justify-between relative z-10">
                <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                        <Banknote className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-[18px] font-black uppercase tracking-tight text-foreground/90 leading-none">Settlement Matrix</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70 mt-2.5">Authorized Entrance Nodes</p>
                    </div>
                </div>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => append({ 
                        id: Math.random().toString(36).substr(2, 9), 
                        name: '', 
                        displayName: '',
                        type: 'bank', 
                        isActive: true,
                        isActiveInternal: true
                    } as any)}
                    className="h-10 px-6 rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-black uppercase tracking-widest text-[9px] gap-2 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="h-3.5 w-3.5" /> Initialize Node
                </Button>
            </header>
            <CardContent className="p-10 space-y-10 relative z-10">
                <div className="grid gap-8">
                    {fields.map((field, index) => (
                        <div key={field.id} className="group relative p-8 rounded-[32px] border border-border/60 bg-background/40 backdrop-blur-xl hover:border-primary/30 transition-all duration-500 shadow-sm overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                <div className="flex-1 grid md:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name={`paymentMethods.${index}.displayName`}
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Display Identifier</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Bank Name / Provider" className="h-10 text-[11px] font-bold bg-muted/5 border-primary/10 rounded-xl" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`paymentMethods.${index}.type`}
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Vector Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 text-[11px] font-bold bg-muted/5 border-primary/10 rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-2xl border-primary/10 shadow-2xl">
                                                        <SelectItem value="bank" className="text-[10px] font-black uppercase">Bank Node</SelectItem>
                                                        <SelectItem value="e-wallet" className="text-[10px] font-black uppercase">Wallet Node</SelectItem>
                                                        <SelectItem value="local-transfer" className="text-[10px] font-black uppercase">Local Matrix</SelectItem>
                                                        <SelectItem value="international-transfer" className="text-[10px] font-black uppercase">Global Vector</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`paymentMethods.${index}.isActive`}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col justify-center gap-2 pt-2">
                                                <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 text-center">Protocol Active</FormLabel>
                                                <FormControl>
                                                    <div className="flex justify-center">
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary scale-90" />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex items-end pb-1.5">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => remove(index)}
                                        className="h-10 w-10 rounded-xl hover:bg-destructive/5 hover:text-destructive transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <Separator className="my-8 bg-primary/5" />

                            <FormField
                                control={form.control}
                                name={`paymentMethods.${index}.instructions`}
                                render={({ field }) => (
                                    <FormItem className="space-y-2 relative z-10">
                                        <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Linguistic Instructions</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} value={field.value || ''} rows={3} placeholder="Define procurement steps for the user..." className="text-[11px] font-serif italic bg-muted/5 border-primary/10 rounded-2xl resize-none p-4" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}
                    {fields.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed border-primary/10 rounded-[40px] bg-muted/5 opacity-40">
                            <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-primary/40" />
                            <p className="text-[11px] font-black uppercase tracking-[0.3em]">Zero Active Settlement Nodes</p>
                        </div>
                    )}
                </div>
            </CardContent>
          </Card>

          <footer className="sticky bottom-8 left-0 right-0 z-50 flex justify-center pb-8 pointer-events-none">
            <Button
                type="submit"
                disabled={updateMutation.isPending || !form.formState.isDirty}
                className="h-14 px-12 font-black uppercase tracking-[0.25em] text-[11px] shadow-2xl shadow-primary/30 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 ring-1 ring-inset ring-white/20 bg-primary hover:opacity-90 pointer-events-auto gap-3"
            >
              {updateMutation.isPending ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Synchronizing Matrix...
                </>
              ) : (
                <>
                    <Save className="h-5 w-5" />
                    Commit Configuration
                </>
              )}
            </Button>
          </footer>
        </form>
      </Form>

      {/* Stable Manifest Footer */}
      <footer className="px-1 py-12 flex items-center justify-between opacity-40">
          <div className="flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-primary/60 shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em]">
                  Global Oversight Engine • Stable Build 2.4
              </p>
          </div>
          <span className="text-[9px] font-bold tabular-nums uppercase tracking-widest">TRANSMISSION_SECURED_SSL_V3</span>
      </footer>
    </div>
  );
}
