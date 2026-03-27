'use client';

import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Settings,
    Save,
    Loader2,
    PlusCircle,
    Trash2,
    Banknote,
    Smartphone,
    Building,
    Globe,
    Zap,
    ShieldCheck,
    Cpu
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/AuthContext';
import { usePublicSettings, useToast } from '@/hooks';

import { settingsKeys } from '@/infrastructure/api/query-keys';
import { apiService } from '@/infrastructure/api/ApiService';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/infrastructure/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';
import { AppSettings } from '@/modules/admin/domain/entities/Settings';
import { Label } from '@/components/ui/label';

// Schemas for validation
const bankTransferDetailsSchema = z.object({
    accountHolder: z.string().min(1, 'Account holder name is required.'),
    currencies: z.record(z.object({
        iban: z.string().min(1, 'IBAN/Account number is required.'),
    })),
});

const walletDetailsSchema = z.object({
    provider: z.string().min(1, 'Wallet provider is required.'),
    accountName: z.string().min(1, 'Account name is required.'),
    accountNumber: z.string().min(1, 'Account number is required.'),
});

const paymentMethodSchema = z.object({
    id: z.string(),
    type: z.enum(['e-wallet', 'bank', 'local-transfer', 'international-transfer']),
    name: z.string().min(1, 'Internal name is required.'),
    displayName: z.string().min(1, 'Display name is required.'),
    isActive: z.boolean(),
    instructions: z.string().optional(),
    accountHolder: z.string().optional(),
    currencies: z.record(z.object({
        iban: z.string().optional(),
    })).optional(),
    wallet: z.object({
        provider: z.string().optional(),
        accountName: z.string().optional(),
        accountNumber: z.string().optional(),
    }).optional(),
});

const settingsSchema = z.object({
    newUserCredits: z.coerce.number().min(0),
    paymentMethods: z.array(paymentMethodSchema),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

async function updateSettings(data: AppSettings): Promise<AppSettings> {
    return apiService<AppSettings, AppSettings>({
        endpoint: '/api/admin/settings',
        method: 'POST',
        data,
    });
}

function getPaymentMethodIcon(type: string) {
    switch (type) {
        case 'e-wallet': return <Smartphone className="h-4 w-4" />;
        case 'bank': return <Building className="h-4 w-4" />;
        case 'local-transfer': return <Banknote className="h-4 w-4" />;
        case 'international-transfer': return <Globe className="h-4 w-4" />;
        default: return <Banknote className="h-4 w-4" />;
    }
}

export default function AdminSettingsPage() {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = usePublicSettings();

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            newUserCredits: 10,
            paymentMethods: [],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "paymentMethods"
    });

    const watchedMethods = form.watch("paymentMethods");

    React.useEffect(() => {
        if (settings) {
            form.reset({
                newUserCredits: settings.newUserCredits || 10,
                paymentMethods: settings.paymentMethods || [],
            });
        }
    }, [settings, form]);

    const mutation = useMutation({
        mutationFn: updateSettings,
        onSuccess: (data) => {
            queryClient.setQueryData(settingsKeys.public(), data);
            toast({ title: t('adminSettings.successToastTitle'), description: t('adminSettings.successToastDesc') });
        },
        onError: (error: Error) => {
            toast({ title: t('adminSettings.errorToastTitle'), description: error.message, variant: "destructive" });
        }
    });

    const onSubmit = async (data: SettingsFormValues) => {
        if (!user) {
            toast({ title: t('adminSettings.errorToastTitle'), description: 'Admin not authenticated.', variant: 'destructive' });
            return;
        }
        mutation.mutate(data as AppSettings);
    };

    const addNewMethod = () => {
        append({
            id: uuidv4(),
            type: 'bank',
            name: '',
            displayName: '',
            isActive: true,
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col space-y-10">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32 rounded-full" />
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-6 w-full max-w-2xl" />
                </div>
                <Skeleton className="h-[600px] w-full rounded-[32px]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">System Core</Badge>
                        <div className="h-3 w-px bg-primary/20" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 flex items-center gap-1.5">
                            <Cpu className="h-3 w-3 fill-primary" />
                            Global Configuration
                        </span>
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter text-foreground flex items-center gap-4">
                            <Settings className="w-10 h-10 text-primary animate-pulse" />
                            System Settings
                        </h1>
                        <p className="text-lg text-muted-foreground italic font-serif opacity-80 max-w-2xl leading-relaxed">
                            Orchestrate the platform's core operational parameters and financial gateways from a unified manifest.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-background border shadow-sm flex flex-col items-end">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Config Node</span>
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5 mt-1 uppercase tracking-tighter">
                            Live Environment
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative">
                <div className="absolute -top-6 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
                            <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                                        Core Operational Matrix
                                    </h3>
                                </div>
                                <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
                                    Read/Write Active
                                </Badge>
                            </header>

                            <CardContent className="p-8 md:p-10 space-y-12">
                                {/* Default Incentives */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-primary" />
                                        <h4 className="text-sm font-bold uppercase tracking-widest">Incentive Architecture</h4>
                                    </div>
                                    <div className="max-w-md p-6 rounded-2xl border bg-muted/5 shadow-inner space-y-4">
                                        <FormField control={form.control} name="newUserCredits" render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sign-up Credit Yield</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type="number" {...field} disabled={mutation.isPending} className="h-10 pl-10 text-xs bg-background rounded-xl border-none ring-1 ring-border/40" />
                                                        <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                                                    </div>
                                                </FormControl>
                                                <FormDescription className="text-[10px] italic">Amount of operational credits granted to new system identities.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                <Separator className="bg-border/40" />

                                {/* Payment Gateways */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Banknote className="h-4 w-4 text-primary" />
                                            <h4 className="text-sm font-bold uppercase tracking-widest">Financial Gateway Nodes</h4>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={addNewMethod} className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest rounded-lg border-primary/20 hover:bg-primary/5">
                                            <PlusCircle className="h-3.5 w-3.5" />
                                            Add Node
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        {fields.map((field, index) => {
                                            const methodType = watchedMethods?.[index]?.type;
                                            const isActive = watchedMethods?.[index]?.isActive;
                                            return (
                                                <div key={field.id} className={cn(
                                                    "group relative flex flex-col p-6 rounded-3xl border transition-all duration-500 shadow-sm",
                                                    isActive ? "bg-background border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5" : "bg-muted/10 opacity-60 border-dashed grayscale"
                                                )}>
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                                                {getPaymentMethodIcon(methodType || 'bank')}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold tracking-tight">{watchedMethods?.[index]?.displayName || 'New Gateway Node'}</span>
                                                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{methodType}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => remove(index)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField control={form.control} name={`paymentMethods.${index}.displayName`} render={({ field }) => (
                                                                <FormItem className="space-y-1.5"><FormLabel className="text-[9px] font-bold uppercase opacity-40">Identity</FormLabel><FormControl><Input {...field} placeholder="Display Name" className="h-8 text-[11px] bg-muted/5 border-none shadow-inner" /></FormControl></FormItem>
                                                            )} />
                                                            <FormField control={form.control} name={`paymentMethods.${index}.name`} render={({ field }) => (
                                                                <FormItem className="space-y-1.5"><FormLabel className="text-[9px] font-bold uppercase opacity-40">System Alias</FormLabel><FormControl><Input {...field} placeholder="Internal Key" className="h-8 text-[11px] bg-muted/5 border-none shadow-inner" /></FormControl></FormItem>
                                                            )} />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField control={form.control} name={`paymentMethods.${index}.type`} render={({ field }) => (
                                                                <FormItem className="space-y-1.5">
                                                                    <FormLabel className="text-[9px] font-bold uppercase opacity-40">Protocol</FormLabel>
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                        <FormControl><SelectTrigger className="h-8 text-[11px] bg-muted/5 border-none shadow-inner"><SelectValue /></SelectTrigger></FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="e-wallet" className="text-xs">E-Wallet</SelectItem>
                                                                            <SelectItem value="bank" className="text-xs">Bank Transfer</SelectItem>
                                                                            <SelectItem value="local-transfer" className="text-xs">Local Transfer</SelectItem>
                                                                            <SelectItem value="international-transfer" className="text-xs">Intl Transfer</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                            <FormField control={form.control} name={`paymentMethods.${index}.isActive`} render={({ field }) => (
                                                                <FormItem className="space-y-1.5 flex flex-col justify-end">
                                                                    <div className={cn(
                                                                        "flex items-center justify-between px-3 h-8 rounded-lg border transition-colors",
                                                                        field.value ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border/40"
                                                                    )}>
                                                                        <span className="text-[9px] font-bold uppercase tracking-tighter">{field.value ? "Online" : "Offline"}</span>
                                                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="scale-75" /></FormControl>
                                                                    </div>
                                                                </FormItem>
                                                            )} />
                                                        </div>

                                                        {/* Dynamic Sub-forms */}
                                                        {(methodType === 'bank' || methodType === 'international-transfer') && (
                                                            <div className="p-4 rounded-2xl border bg-muted/5 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                                                <FormField control={form.control} name={`paymentMethods.${index}.accountHolder`} render={({ field }) => (
                                                                    <FormItem className="space-y-1.5"><FormLabel className="text-[9px] font-bold uppercase">Settlement Holder</FormLabel><FormControl><Input {...field} className="h-8 text-xs bg-background border-none shadow-sm" /></FormControl></FormItem>
                                                                )}/>
                                                                <div className="space-y-2">
                                                                    <Label className="text-[9px] font-bold uppercase opacity-40">Currency IBAN Matrix</Label>
                                                                    <div className="space-y-2 pl-2">
                                                                        <FormField control={form.control} name={`paymentMethods.${index}.currencies.SAR.iban`} render={({ field }) => (<FormItem className="flex items-center gap-3 space-y-0"><FormLabel className="text-[10px] font-bold w-8 text-primary/60">SAR</FormLabel><FormControl><Input {...field} className="h-7 text-[10px] bg-background border-none shadow-sm" /></FormControl></FormItem>)}/>
                                                                        <FormField control={form.control} name={`paymentMethods.${index}.currencies.USD.iban`} render={({ field }) => (<FormItem className="flex items-center gap-3 space-y-0"><FormLabel className="text-[10px] font-bold w-8 text-primary/60">USD</FormLabel><FormControl><Input {...field} className="h-7 text-[10px] bg-background border-none shadow-sm" /></FormControl></FormItem>)}/>
                                                                        <FormField control={form.control} name={`paymentMethods.${index}.currencies.YER.iban`} render={({ field }) => (<FormItem className="flex items-center gap-3 space-y-0"><FormLabel className="text-[10px] font-bold w-8 text-primary/60">YER</FormLabel><FormControl><Input {...field} className="h-7 text-[10px] bg-background border-none shadow-sm" /></FormControl></FormItem>)}/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {(methodType === 'e-wallet' || methodType === 'local-transfer') && (
                                                            <div className="p-4 rounded-2xl border bg-muted/5 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                                                <div className="grid gap-4">
                                                                    <FormField control={form.control} name={`paymentMethods.${index}.wallet.provider`} render={({ field }) => (
                                                                        <FormItem className="space-y-1.5"><FormLabel className="text-[9px] font-bold uppercase">Provider</FormLabel>
                                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                <FormControl><SelectTrigger className="h-8 text-[11px] bg-background border-none shadow-sm"><SelectValue /></SelectTrigger></FormControl>
                                                                                <SelectContent>
                                                                                    <SelectItem value="yemen-mobile" className="text-xs">Yemen Mobile</SelectItem>
                                                                                    <SelectItem value="mobi-cash" className="text-xs">Mobi Cash</SelectItem>
                                                                                    <SelectItem value="mtn-mobile-money" className="text-xs">MTN Money</SelectItem>
                                                                                    <SelectItem value="other" className="text-xs">Specialized Other</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </FormItem>
                                                                    )}/>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <FormField control={form.control} name={`paymentMethods.${index}.wallet.accountName`} render={({ field }) => (<FormItem className="space-y-1.5"><FormLabel className="text-[9px] font-bold uppercase">Account</FormLabel><FormControl><Input {...field} className="h-8 text-xs bg-background border-none shadow-sm" /></FormControl></FormItem>)}/>
                                                                        <FormField control={form.control} name={`paymentMethods.${index}.wallet.accountNumber`} render={({ field }) => (<FormItem className="space-y-1.5"><FormLabel className="text-[9px] font-bold uppercase">Identifier</FormLabel><FormControl><Input {...field} className="h-8 text-xs bg-background border-none shadow-sm" /></FormControl></FormItem>)}/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <FormField control={form.control} name={`paymentMethods.${index}.instructions`} render={({ field }) => (
                                                            <FormItem className="space-y-1.5"><FormLabel className="text-[9px] font-bold uppercase opacity-40">User Instructions</FormLabel><FormControl><Textarea {...field} rows={2} className="text-[11px] bg-muted/5 border-none shadow-inner resize-none p-3 italic leading-relaxed" /></FormControl></FormItem>
                                                        )}/>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </CardContent>

                            <footer className="px-8 py-6 border-t bg-muted/5 flex items-center justify-between">
                                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                                    System Parameters Engine • Config Node V1.0
                                </p>
                                <Button type="submit" disabled={mutation.isPending} className="font-bold h-11 px-10 gap-3 shadow-xl shadow-primary/20 rounded-xl active:scale-[0.98] transition-all">
                                    {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                                    Commit Configuration
                                </Button>
                            </footer>
                        </Card>
                    </form>
                </Form>
            </div>
        </div>
    );
}
