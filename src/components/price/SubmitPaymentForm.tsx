
'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast } from '@/hooks';
import type { PublicSettings } from '@/lib/settings';
import { fetchPublicSettings, submitPaymentProof } from '@/services';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, Banknote, Check, CheckCircle, Clock, Copy, CreditCard, Loader2, Shield, UploadCloud } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

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

function BankDetailsSkeleton() {
  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card variant="glass" className="backdrop-blur-md shadow-soft">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
              <Banknote className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </AnimatedContainer>
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
    <AnimatedContainer animation="fade-in-up" delay={100}>
      <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-background/50 to-primary/5 border border-border/50 hover:shadow-soft transition-all duration-200 group">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-primary/10 group-hover:scale-110 transition-transform">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm">{label}:</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            {value}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={handleCopy}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </AnimatedContainer>
  )
}

export default function SubmitPaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const { t } = useLocalization();

  const { data: settings, isLoading: isLoadingSettings, isError: isSettingsError } = useQuery<PublicSettings>({
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
      {/* Bank Details Section */}
      {isLoadingSettings ? (
        <BankDetailsSkeleton />
      ) : isSettingsError ? (
        <AnimatedContainer animation="fade-in-up" delay={200}>
          <Card variant="glass" className="border-destructive/50 bg-destructive/10 backdrop-blur-md">
            <CardHeader className="bg-gradient-to-r from-destructive/5 to-red-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-destructive to-red-600">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-destructive">Error Loading Payment Information</CardTitle>
                  <CardDescription>Could not load payment information. Please try again later.</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </AnimatedContainer>
      ) : (
        <AnimatedContainer animation="fade-in-up" delay={200}>
          <Card variant="glass" className="backdrop-blur-md shadow-soft">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                  <Banknote className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="font-headline">{t('submitPayment.bankDetailsTitle')}</CardTitle>
                  <CardDescription>{t('submitPayment.bankDetailsDescription')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="multiple" className="w-full">
                {settings?.bankAccounts?.map((account, index) => (
                  <AnimatedContainer key={index} animation="fade-in-up" delay={300 + index * 100}>
                    <AccordionItem value={`item-${index}`} className="border border-border/50 rounded-lg mb-2">
                      <AccordionTrigger className="px-4 py-3 hover:bg-primary/5 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-primary/10">
                            <Shield className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-semibold">{account.bankName}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 space-y-3">
                        <AccountDetail label={t('submitPayment.accountHolderLabel')} value={account.accountHolder} />
                        <AccountDetail label="SAR IBAN" value={account.currencies.SAR?.iban} />
                        <AccountDetail label="USD IBAN" value={account.currencies.USD?.iban} />
                        <AccountDetail label="YER Account" value={account.currencies.YER?.iban} />
                      </AccordionContent>
                    </AccordionItem>
                  </AnimatedContainer>
                ))}
              </Accordion>

              <AnimatedContainer animation="fade-in-up" delay={400}>
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">{t('submitPayment.referenceLabel')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>{t('submitPayment.yourUserIdLabel')}:</strong> {firebaseUser?.uid || t('submitPayment.pleaseLogin')}
                  </p>
                </div>
              </AnimatedContainer>
            </CardContent>
          </Card>
        </AnimatedContainer>
      )}

      {/* Upload Receipt Section */}
      <AnimatedContainer animation="fade-in-up" delay={400}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card variant="glass" className="backdrop-blur-md shadow-soft">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                  <UploadCloud className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="font-headline">{t('submitPayment.uploadReceiptTitle')}</CardTitle>
                  {planName && (
                    <CardDescription>
                      {t('submitPayment.selectedPlanDescription').replace('{planName}', planName)}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {t('submitPayment.proofLabel')}
                </Label>
                <Controller
                  name="file"
                  control={form.control}
                  render={({ field: { onChange, onBlur, name, ref } }) => (
                    <div className="relative">
                      <Input
                        id="file"
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        onBlur={onBlur}
                        name={name}
                        ref={ref}
                        className="file:text-primary file:font-semibold hover:shadow-soft transition-all duration-200"
                        disabled={mutation.isPending}
                      />
                    </div>
                  )}
                />
                {form.formState.errors.file && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive">{form.formState.errors.file.message}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={mutation.isPending || isLoadingSettings}
                variant="gradient"
                className="w-full hover:shadow-glow transition-all duration-200"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UploadCloud className="me-2 h-4 w-4" />
                    {t('submitPayment.submitButton')}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </AnimatedContainer>
    </div>
  );
}
