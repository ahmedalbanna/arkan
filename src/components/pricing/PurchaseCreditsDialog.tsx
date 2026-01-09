
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Gem, ShoppingCart, ArrowLeft, Banknote, AlertCircle, Copy, Check, UploadCloud, Loader2, PartyPopper } from 'lucide-react';
import { useSubmitPaymentProof, usePublicSettings } from '@/hooks';
import type { BankAccount } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Skeleton } from '../ui/skeleton';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { fileSchema } from '@/lib/types';

const CREDIT_PRICE = 0.10; // $0.10 per credit

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

  function handleCopy() {
    navigator.clipboard.writeText(value as string);
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

type FileFormValues = z.infer<typeof fileSchema>;

export function PurchaseCreditsDialog({ trigger }: { trigger: React.ReactNode }) {
  const { t } = useLocalization();
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [credits, setCredits] = useState(100);
  const price = credits * CREDIT_PRICE;

  const { data: settings, isLoading: isLoadingSettings, isError: isSettingsError } = usePublicSettings();
  
  const form = useForm<FileFormValues>({
    resolver: zodResolver(fileSchema),
  });

  const mutation = useSubmitPaymentProof({
    onSuccess: () => {
      setStep(3); // Go to success step
      form.reset();
    },
  });

  function handleContinue() {
    setStep(2);
  }

  function handleCloseAndReset() {
    setIsOpen(false);
    // Reset state after a short delay to allow the dialog to close smoothly
    setTimeout(() => {
        setStep(1);
        setCredits(100);
        form.reset();
    }, 300);
  }

  async function onSubmit(data: FileFormValues) {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const formData = new FormData();
    formData.append('file', data.file[0]);
    formData.append('userId', firebaseUser.uid);
    formData.append('planId', `custom-${credits}`);
    formData.append('planName', `${credits} Credits`);
    formData.append('credits', credits.toString());
    formData.append('price', price.toFixed(2));
    formData.append('userName', firebaseUser.displayName || 'N/A');
    formData.append('userEmail', firebaseUser.email || 'N/A');

    // @ts-expect-error - FormData object literal property mismatch
    mutation.mutate({ formData: formData as any, token });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Gem className="w-6 h-6 text-primary" />{t('pricing.pageTitle')}</DialogTitle>
              <DialogDescription>{t('pricing.pageSubtitle')}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-8">
              <div className="text-center">
                <div className="text-6xl font-bold font-headline text-primary">{credits}</div>
                <div className="text-muted-foreground">Credits</div>
              </div>
              <Slider
                value={[credits]}
                onValueChange={(value) => setCredits(value[0])}
                min={50}
                max={5000}
                step={50}
              />
              <div className="text-center">
                <div className="text-3xl font-semibold">${price.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">(${CREDIT_PRICE.toFixed(2)} per credit)</div>
              </div>
              <Button onClick={handleContinue} className="w-full font-headline text-lg" size="lg">
                <ShoppingCart className="me-2 h-5 w-5" />
                Continue to Payment
              </Button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <DialogHeader>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="absolute top-3 left-3 flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <DialogTitle className="flex items-center gap-2 pt-8"><Banknote className="w-6 h-6 text-primary" />{t('submitPayment.pageTitle')}</DialogTitle>
              <DialogDescription>{t('submitPayment.pageSubtitle')}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto px-1">
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
                    <Accordion type="multiple" className="w-full" defaultValue={settings?.bankAccounts.length === 1 ? ['item-0'] : []}>
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
                    <CardDescription>{t('submitPayment.selectedPlanDescription').replace('{planName}', `${credits} Credits`)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="file">{t('submitPayment.proofLabel')}</Label>
                      <Input
                        id="file"
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        className="file:text-primary file:font-semibold"
                        disabled={mutation.isPending}
                        {...form.register("file")}
                      />
                      {form.formState.errors.file && <p className="text-sm text-destructive">{form.formState.errors.file.message as string}</p>}
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
          </>
        )}
        {step === 3 && (
            <>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><PartyPopper className="w-6 h-6 text-primary" />{t('submitPayment.successTitle')}</DialogTitle>
                </DialogHeader>
                <div className="py-8 text-center space-y-4">
                    <p>{t('submitPayment.successDescription')}</p>
                    <p className="text-sm text-muted-foreground">You will receive a notification once your credits have been added to your account.</p>
                    <Button onClick={handleCloseAndReset} className="mt-4">Done</Button>
                </div>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
