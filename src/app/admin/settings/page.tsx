
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getAuthenticatedToken } from '@/lib/authUtils';

import { Settings, Loader2, Save, Banknote } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import React from 'react';
import { Separator } from '@/components/ui/separator';

// --- Type Definition ---
interface AppSettings {
  newUserCredits: number;
  bankName?: string;
  accountHolder?: string;
  iban?: string;
}

// --- Zod Schema for Validation ---
const settingsSchema = z.object({
  newUserCredits: z.coerce.number().int().min(0, "Credits cannot be negative."),
  bankName: z.string().min(1, 'Bank name is required.'),
  accountHolder: z.string().min(1, 'Account holder name is required.'),
  iban: z.string().min(1, 'IBAN is required.'),
});
type SettingsFormValues = z.infer<typeof settingsSchema>;

// --- API Service Functions ---
async function fetchSettings(token: string): Promise<AppSettings> {
    const response = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
}

async function updateSettings(variables: { data: AppSettings, token: string }): Promise<AppSettings> {
    const response = await fetch('/api/settings', {
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
    queryFn: async () => {
        const token = await getAuthenticatedToken(firebaseUser);
        return fetchSettings(token);
    },
    enabled: !!firebaseUser,
  });
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
        newUserCredits: 10,
        bankName: '',
        accountHolder: '',
        iban: '',
    }
  });

  // Use useEffect to reset the form when the data is fetched
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                <Separator className="my-6" />
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Banknote className="w-6 h-6"/> {t('adminSettings.bankPaymentTitle')}</CardTitle>
                    <CardDescription>
                        {t('adminSettings.bankPaymentDesc')}
                    </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('adminSettings.bankNameLabel')}</FormLabel>
                                <FormControl><Input {...field} disabled={mutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="accountHolder"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('adminSettings.accountHolderLabel')}</FormLabel>
                                <FormControl><Input {...field} disabled={mutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="iban"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('adminSettings.ibanLabel')}</FormLabel>
                                <FormControl><Input {...field} disabled={mutation.isPending} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {t('adminSettings.saveButton')}
                    </Button>
                </CardFooter>
            </Card>
        </form>
      </Form>
    </div>
  );
}
