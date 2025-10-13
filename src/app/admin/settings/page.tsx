
'use client';

import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/core/utils/authUtils';
import { useToast } from '@/hooks';
import type { AppSettings } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { AlertTriangle, Banknote, DollarSign, Loader2, PlusCircle, Save, Settings, Shield, Trash2 } from 'lucide-react';
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
  const { firebaseUser } = useAuth();
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
    const token = await getAuthenticatedToken(firebaseUser);
    mutation.mutate({ data, token });
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
                    <Separator/>
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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 container mx-auto max-w-2xl px-4 py-12">
        <AnimatedContainer animation="fade-in-down" delay={200}>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                <Settings className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {t('header.adminSettings')}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    System Configuration
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    Admin Control
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('adminSettings.pageSubtitle')}
            </p>
          </div>
        </AnimatedContainer>

        <AnimatedContainer animation="fade-in-up" delay={400}>
          <div className="space-y-8">
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
                <Card variant="glass" className="backdrop-blur-md shadow-soft">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                        <Settings className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="font-headline">{t('adminSettings.defaultSettingsTitle')}</CardTitle>
                        <CardDescription className="mt-1">
                          {t('adminSettings.defaultSettingsDesc')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="newUserCredits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold">
                            <DollarSign className="h-4 w-4 text-primary" />
                            {t('adminSettings.newUserCreditsLabel')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              disabled={mutation.isPending}
                              className="hover:shadow-soft transition-all duration-200"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card variant="glass" className="backdrop-blur-md shadow-soft">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                        <Banknote className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="font-headline">{t('adminSettings.bankPaymentTitle')}</CardTitle>
                        <CardDescription className="mt-1">
                          {t('adminSettings.bankPaymentDesc')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-4 relative bg-gradient-to-r from-background/50 to-primary/5">
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 hover:shadow-glow transition-all duration-200" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <FormField
                          control={form.control}
                          name={`bankAccounts.${index}.bankName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Al-Amal Microfinance Bank" className="hover:shadow-soft transition-all duration-200" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`bankAccounts.${index}.accountHolder`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Holder Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Arkan Platform LLC" className="hover:shadow-soft transition-all duration-200" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="space-y-3 pt-2">
                          <Label>IBANs per Currency</Label>
                          <FormField control={form.control} name={`bankAccounts.${index}.currencies.SAR.iban`} render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormLabel className="w-12">SAR</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Saudi Riyal IBAN" className="hover:shadow-soft transition-all duration-200" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`bankAccounts.${index}.currencies.USD.iban`} render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormLabel className="w-12">USD</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="US Dollar IBAN" className="hover:shadow-soft transition-all duration-200" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`bankAccounts.${index}.currencies.YER.iban`} render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormLabel className="w-12">YER</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Yemeni Rial IBAN/Account No." className="hover:shadow-soft transition-all duration-200" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addNewAccount} className="hover:shadow-soft transition-all duration-200">
                      <PlusCircle className="me-2 h-4 w-4" /> Add Another Bank Account
                    </Button>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" disabled={mutation.isPending} variant="gradient" className="hover:shadow-glow transition-all duration-200">
                    {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {t('adminSettings.saveButton')}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </AnimatedContainer>
      </div>
    </div>
  );
}
