
'use client';

import { useSession } from "next-auth/react";
import { useToast } from '@/hooks';
import type { AppSettings } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { AlertTriangle, Banknote, Loader2, PlusCircle, Save, Settings, Trash2 } from 'lucide-react';
import React from 'react';

// --- Zod Schema for Validation ---
const bankAccountSchema = z.object({
    bankName: z.string().min(1, 'Bank name is required.'),
    accountHolder: z.string().min(1, 'Account holder name is required.'),
    currencies: z.object({
        YER: z.object({ iban: z.string().optional() }).optional(),
        SAR: z.object({ iban: z.string().optional() }).optional(),
        USD: z.object({ iban: z.string().optional() }).optional(),
    }),
});

const settingsSchema = z.object({
    newUserCredits: z.coerce.number().int().min(0, "Credits cannot be negative."),
    bankAccounts: z.array(bankAccountSchema),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

// --- API Service Functions ---
async function fetchSettings(): Promise<AppSettings> {
    const response = await fetch('/api/admin/settings');
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
}

async function updateSettings(variables: { data: AppSettings, token: string }): Promise<AppSettings> {
    const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`
        },
        body: JSON.stringify(variables.data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update settings');
    }
    return response.json();
}

// --- Main Settings Page Component ---
export default function AdminSettingsPage() {
    const { t } = useLocalization();
    const { data: session } = useSession();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery<AppSettings>({
        queryKey: ['settings'],
        queryFn: fetchSettings,
    });

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            newUserCredits: 10,
            bankAccounts: [],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "bankAccounts"
    });

    React.useEffect(() => {
        if (settings) {
            form.reset(settings);
        }
    }, [settings, form]);

    const mutation = useMutation({
        mutationFn: updateSettings,
        onSuccess: (data) => {
            queryClient.setQueryData(['settings'], data);
            toast({ title: t('adminSettings.successToastTitle'), description: t('adminSettings.successToastDesc') });
        },
        onError: (error: Error) => {
            toast({ title: t('adminSettings.errorToastTitle'), description: error.message, variant: "destructive" });
        }
    });

    const onSubmit = async (data: SettingsFormValues) => {
        if (!session?.user?.id) throw new Error("Admin not authenticated.");
        mutation.mutate({ data, token: session.user.id });
    };

    const addNewAccount = () => {
        append({
            bankName: '',
            accountHolder: '',
            currencies: { SAR: { iban: '' }, USD: { iban: '' }, YER: { iban: '' } }
        });
    }

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-12">
                <div className="text-center mb-12">
                    <Skeleton className="h-12 w-48 mx-auto" />
                    <Skeleton className="h-6 w-64 mx-auto mt-2" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                        <Separator />
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-32" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
                    <Settings className="w-10 h-10" />
                    {t('header.adminSettings')}
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                    {t('adminSettings.pageSubtitle')}
                </p>
            </div>

            {!settings || settings.bankAccounts.length === 0 ? (
                <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        No settings found in the database. Please run the seed script to populate default settings, or configure and save them below.
                    </AlertDescription>
                </Alert>
            ) : null}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('adminSettings.defaultSettingsTitle')}</CardTitle>
                            <CardDescription>
                                {t('adminSettings.defaultSettingsDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="newUserCredits"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('adminSettings.newUserCreditsLabel')}</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} disabled={mutation.isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Banknote className="w-6 h-6" /> {t('adminSettings.bankPaymentTitle')}</CardTitle>
                            <CardDescription>
                                {t('adminSettings.bankPaymentDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <FormField
                                        control={form.control}
                                        name={`bankAccounts.${index}.bankName`}
                                        render={({ field }) => (
                                            <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Al-Amal Microfinance Bank" /></FormControl><FormMessage /></FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`bankAccounts.${index}.accountHolder`}
                                        render={({ field }) => (
                                            <FormItem><FormLabel>Account Holder Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Arkan Platform LLC" /></FormControl><FormMessage /></FormItem>
                                        )}
                                    />
                                    <div className="space-y-3 pt-2">
                                        <Label>IBANs per Currency</Label>
                                        <FormField control={form.control} name={`bankAccounts.${index}.currencies.SAR.iban`} render={({ field }) => (
                                            <FormItem className="flex items-center gap-2"><FormLabel className="w-12">SAR</FormLabel><FormControl><Input {...field} placeholder="Saudi Riyal IBAN" /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`bankAccounts.${index}.currencies.USD.iban`} render={({ field }) => (
                                            <FormItem className="flex items-center gap-2"><FormLabel className="w-12">USD</FormLabel><FormControl><Input {...field} placeholder="US Dollar IBAN" /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`bankAccounts.${index}.currencies.YER.iban`} render={({ field }) => (
                                            <FormItem className="flex items-center gap-2"><FormLabel className="w-12">YER</FormLabel><FormControl><Input {...field} placeholder="Yemeni Rial IBAN/Account No." /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={addNewAccount}>
                                <PlusCircle className="me-2 h-4 w-4" /> Add Another Bank Account
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
