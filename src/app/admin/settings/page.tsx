'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, Building, Globe, Loader2, PlusCircle, Save, Settings, Smartphone, Trash2 } from 'lucide-react';
import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast } from '@/hooks';
import { usePublicSettings } from '@/modules/admin/adapters/hooks/use-settings';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type SettingsProperties as AppSettings } from '@/modules/admin/domain/entities/Settings';
import { settingsKeys } from '@/infrastructure/api/query-keys';
import { SettingsApiClient } from '@/modules/admin/adapters/api-client/SettingsApiClient';
import { container } from '@/infrastructure/di/container';


// Schemas for validation
const bankTransferDetailsSchema = z.object({
    iban: z.string().optional(),
    accountNumber: z.string().optional(),
    swiftCode: z.string().optional(),
    bankAddress: z.string().optional(),
});

const walletDetailsSchema = z.object({
    provider: z.enum(['cac-bank', 'mobi-cash', 'yemen-mobile', 'mtn-mobile-money', 'you-telecom', 'aljazira-bank', 'tadhamon-bank', 'other']),
    accountNumber: z.string().min(1, "Account number is required."),
    accountName: z.string().min(1, "Account name is required."),
    phoneNumber: z.string().optional(),
    notes: z.string().optional(),
});

const paymentMethodSchema = z.object({
    id: z.string(),
    type: z.enum(['bank', 'e-wallet', 'local-transfer', 'international-transfer']),
    name: z.string().min(1, "Internal name is required."),
    displayName: z.string().min(1, "Display name is required."),
    icon: z.string().optional(),
    isActive: z.boolean(),
    accountHolder: z.string().optional(),
    currencies: z.object({
        SAR: bankTransferDetailsSchema.optional(),
        USD: bankTransferDetailsSchema.optional(),
        YER: bankTransferDetailsSchema.optional(),
    }).optional(),
    wallet: walletDetailsSchema.optional(),
    instructions: z.string().optional(),
    processingTime: z.string().optional(),
});

const settingsSchema = z.object({
    newUserCredits: z.coerce.number().int().min(0, "Credits cannot be negative."),
    paymentMethods: z.array(paymentMethodSchema).optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

async function updateSettings(data: AppSettings): Promise<AppSettings> {
    const client = container.resolve(SettingsApiClient);
    const result = await client.updateSettings(data);
    if (result.isFailure) throw result.error;
    return result.getValue();
}

function getPaymentMethodIcon(type: string) {
    switch (type) {
        case 'e-wallet': return <Smartphone className="h-5 w-5" />;
        case 'bank': return <Building className="h-5 w-5" />;
        case 'local-transfer': return <Banknote className="h-5 w-5" />;
        case 'international-transfer': return <Globe className="h-5 w-5" />;
        default: return <Banknote className="h-5 w-5" />;
    }
}

// Main Settings Page Component
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
            <div className="container mx-auto max-w-4xl px-4 py-12">
                <div className="text-center mb-12"><Skeleton className="h-12 w-48 mx-auto" /><Skeleton className="h-6 w-64 mx-auto mt-2" /></div>
                <Skeleton className="h-32 w-full mb-8" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
                    <Settings className="w-10 h-10" /> {t('header.adminSettings')}
                </h1>
                <p className="text-lg text-muted-foreground mt-2">{t('adminSettings.pageSubtitle')}</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('adminSettings.defaultSettingsTitle')}</CardTitle>
                            <CardDescription>{t('adminSettings.defaultSettingsDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField control={form.control} name="newUserCredits" render={({ field }) => (
                                <FormItem><FormLabel>{t('adminSettings.newUserCreditsLabel')}</FormLabel><FormControl><Input type="number" {...field} disabled={mutation.isPending} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Banknote className="w-6 h-6" /> Payment Methods</CardTitle>
                            <CardDescription>Manage all available payment methods for users to purchase credits.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {fields.map((field, index) => {
                                const methodType = watchedMethods?.[index]?.type;
                                return (
                                <Card key={field.id} className="p-4 space-y-4 relative bg-muted/50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 text-lg font-semibold">{getPaymentMethodIcon(methodType || 'bank')} {watchedMethods?.[index]?.displayName || 'New Method'}</div>
                                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`paymentMethods.${index}.displayName`} render={({ field }) => (
                                            <FormItem><FormLabel>Display Name</FormLabel><FormControl><Input {...field} placeholder="e.g., بنك الكريمي" /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`paymentMethods.${index}.name`} render={({ field }) => (
                                            <FormItem><FormLabel>Internal Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Al-Kuraimi Bank" /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <FormField control={form.control} name={`paymentMethods.${index}.type`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="e-wallet">E-Wallet</SelectItem>
                                                        <SelectItem value="bank">Bank</SelectItem>
                                                        <SelectItem value="local-transfer">Local Transfer</SelectItem>
                                                        <SelectItem value="international-transfer">International Transfer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name={`paymentMethods.${index}.isActive`} render={({ field }) => (
                                            <FormItem className="flex items-end">
                                                <div className="flex items-center gap-2 p-2 border rounded-md bg-background h-10 w-full"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Active</FormLabel></div>
                                            </FormItem>
                                        )} />
                                    </div>

                                    {(methodType === 'bank' || methodType === 'international-transfer') && (
                                        <div className="space-y-3 pt-2 border-t mt-4">
                                            <FormField control={form.control} name={`paymentMethods.${index}.accountHolder`} render={({ field }) => (
                                                <FormItem><FormLabel>Account Holder</FormLabel><FormControl><Input {...field} placeholder="Account Holder Name"/></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <Label>Currencies</Label>
                                            <div className="pl-4 space-y-2">
                                                <FormField control={form.control} name={`paymentMethods.${index}.currencies.SAR.iban`} render={({ field }) => (<FormItem className="flex items-center gap-2"><FormLabel className="w-12">SAR</FormLabel><FormControl><Input {...field} placeholder="SAR IBAN"/></FormControl></FormItem>)}/>
                                                <FormField control={form.control} name={`paymentMethods.${index}.currencies.USD.iban`} render={({ field }) => (<FormItem className="flex items-center gap-2"><FormLabel className="w-12">USD</FormLabel><FormControl><Input {...field} placeholder="USD IBAN"/></FormControl></FormItem>)}/>
                                                <FormField control={form.control} name={`paymentMethods.${index}.currencies.YER.iban`} render={({ field }) => (<FormItem className="flex items-center gap-2"><FormLabel className="w-12">YER</FormLabel><FormControl><Input {...field} placeholder="YER IBAN/Account No."/></FormControl></FormItem>)}/>
                                            </div>
                                        </div>
                                    )}

                                    {(methodType === 'e-wallet' || methodType === 'local-transfer') && (
                                        <div className="space-y-3 pt-2 border-t mt-4">
                                            <Label>Wallet Details</Label>
                                            <div className="pl-4 space-y-4">
                                                <FormField control={form.control} name={`paymentMethods.${index}.wallet.provider`} render={({ field }) => (
                                                    <FormItem><FormLabel>Provider</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="cac-bank">CAC Bank</SelectItem>
                                                                <SelectItem value="mobi-cash">Mobi Cash</SelectItem>
                                                                <SelectItem value="yemen-mobile">Yemen Mobile</SelectItem>
                                                                <SelectItem value="mtn-mobile-money">MTN Mobile Money</SelectItem>
                                                                <SelectItem value="you-telecom">YOU Telecom</SelectItem>
                                                                <SelectItem value="aljazira-bank">Aljazira Bank</SelectItem>
                                                                <SelectItem value="tadhamon-bank">Tadhamon Bank</SelectItem>
                                                                <SelectItem value="other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    <FormMessage/></FormItem>
                                                )}/>
                                                <FormField control={form.control} name={`paymentMethods.${index}.wallet.accountName`} render={({ field }) => (<FormItem><FormLabel>Account Name</FormLabel><FormControl><Input {...field} placeholder="Wallet account name"/></FormControl><FormMessage/></FormItem>)}/>
                                                <FormField control={form.control} name={`paymentMethods.${index}.wallet.accountNumber`} render={({ field }) => (<FormItem><FormLabel>Account/Phone Number</FormLabel><FormControl><Input {...field} placeholder="Wallet number"/></FormControl><FormMessage/></FormItem>)}/>
                                            </div>
                                        </div>
                                    )}

                                    <FormField control={form.control} name={`paymentMethods.${index}.instructions`} render={({ field }) => (
                                        <FormItem><FormLabel>Instructions (Optional)</FormLabel><FormControl><Textarea {...field} placeholder="e.g., Include your user ID in the transfer reference." rows={2} /></FormControl></FormItem>
                                    )}/>
                                </Card>
                            )})}
                            <Button type="button" variant="outline" onClick={addNewMethod} className="w-full">
                                <PlusCircle className="me-2 h-4 w-4" /> Add Payment Method
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {t('adminSettings.saveButton')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
