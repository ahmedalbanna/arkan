
'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, AlertCircle, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocalization } from '@/context/LocalizationContext';
import { Skeleton } from './ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const formSchema = z.object({
  file: z
    .instanceof(File, { message: 'A file is required.' })
    .refine((file) => file.size < 5 * 1024 * 1024, 'File size must be less than 5MB.')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type),
      'Invalid file type. Only JPG, PNG, and PDF are allowed.'
    ),
});

type FormValues = z.infer<typeof formSchema>;

// This function now fetches public settings, no token needed.
async function fetchPublicSettings() {
    const response = await fetch('/api/admin/settings');
    if (!response.ok) {
        throw new Error('Failed to fetch payment details');
    }
    return response.json();
}

async function submitPaymentProof({ formData, token }: { formData: FormData, token: string }) {
    if (!token) throw new Error("User not authenticated");

    const response = await fetch('/api/admin/purchase-request', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit request.');
    }
    return response.json();
}

function BankDetailsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
    )
}

function AccountDetail({ label, value }: { label: string, value?: string }) {
    const [isCopied, setIsCopied] = useState(false);

    if (!value) return null;
    
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="font-semibold">{label}:</span>
            <div className="flex items-center gap-2 font-mono text-muted-foreground">
                <span>{value}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}

export default function SubmitPaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const { t } = useLocalization();

  const { data: settings, isLoading: isLoadingSettings, isError: isSettingsError } = useQuery({
      queryKey: ['publicSettings'],
      queryFn: fetchPublicSettings,
      staleTime: 1000 * 60 * 60, // 1 hour
  });

  const planId = searchParams.get('planId');
  const planName = searchParams.get('planName');
  const planCredits = searchParams.get('credits');
  const planPrice = searchParams.get('price');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const mutation = useMutation({
    mutationFn: submitPaymentProof,
    onSuccess: () => {
      toast({
        title: t('submitPayment.successTitle'),
        description: t('submitPayment.successDescription'),
      });
      router.push('/generate');
    },
    onError: (error: Error) => {
        toast({
            title: t('submitPayment.errorTitle'),
            description: error.message,
            variant: 'destructive',
        });
    }
  });


  const onSubmit = async (data: FormValues) => {
    if (!planId || !planCredits || !planPrice || !firebaseUser) {
      toast({
        title: t('submitPayment.missingInfoErrorTitle'),
        description: t('submitPayment.missingInfoErrorDescription'),
        variant: 'destructive',
      });
      return;
    }

    const token = await firebaseUser.getIdToken();

    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('userId', firebaseUser.uid);
    formData.append('planId', planId);
    formData.append('planName', planName || 'Unknown Plan');
    formData.append('credits', planCredits);
    formData.append('price', planPrice);
    formData.append('userName', firebaseUser.displayName || 'N/A');
    formData.append('userEmail', firebaseUser.email || 'N/A');

    mutation.mutate({ formData, token });
  };

  return (
    <div className="space-y-8">
      {isLoadingSettings ? (
          <BankDetailsSkeleton />
      ) : isSettingsError ? (
          <Card className="border-destructive">
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive"><AlertCircle /> Error</CardTitle>
                <CardDescription>Could not load payment information. Please try again later.</CardDescription>
             </CardHeader>
          </Card>
      ) : (
        <Card>
            <CardHeader>
            <CardTitle className="font-headline">{t('submitPayment.bankDetailsTitle')}</CardTitle>
            <CardDescription>{t('submitPayment.bankDetailsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <Accordion type="multiple" className="w-full">
                    {settings?.bankAccounts?.map((account, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>{account.bankName}</AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-4">
                                <AccountDetail label={t('submitPayment.accountHolderLabel')} value={account.accountHolder} />
                                <AccountDetail label="SAR IBAN" value={account.currencies.SAR?.iban} />
                                <AccountDetail label="USD IBAN" value={account.currencies.USD?.iban} />
                                <AccountDetail label="YER Account" value={account.currencies.YER?.iban} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <p className="text-sm pt-4"><strong>{t('submitPayment.referenceLabel')}:</strong> {t('submitPayment.yourUserIdLabel')} ({firebaseUser?.uid || t('submitPayment.pleaseLogin')})</p>
            </CardContent>
        </Card>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{t('submitPayment.uploadReceiptTitle')}</CardTitle>
            {planName && <CardDescription>{t('submitPayment.selectedPlanDescription').replace('{planName}', planName)}</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="file">{t('submitPayment.proofLabel')}</Label>
              <Controller
                name="file"
                control={form.control}
                render={({ field: { onChange, onBlur, name, ref } }) => (
                  <Input
                    id="file"
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => onChange(e.target.files?.[0])}
                    onBlur={onBlur}
                    name={name}
                    ref={ref}
                    className="file:text-primary file:font-semibold"
                    disabled={mutation.isPending}
                  />
                )}
              />
              {form.formState.errors.file && <p className="text-sm text-destructive">{form.formState.errors.file.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={mutation.isPending || isLoadingSettings} className="w-full">
              {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <UploadCloud className="me-2 h-4 w-4" />}
              {t('submitPayment.submitButton')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
