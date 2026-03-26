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
import { Gem, ShoppingCart, ArrowLeft, Banknote, AlertCircle, Copy, Check, UploadCloud, Loader2, PartyPopper, Wallet, Building, Globe, Smartphone, CreditCard } from 'lucide-react';
import { useSubmitPaymentProof, usePublicSettings } from '@/hooks';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { fileSchema, PaymentMethod } from '@/infrastructure/utils/types';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CREDIT_PRICE = 0.10; // $0.10 per credit

// Icon helper function
function getPaymentMethodIcon(type: string) {
  switch (type) {
    case 'e-wallet':
      return <Wallet className="h-5 w-5" />;
    case 'bank':
      return <Building className="h-5 w-5" />;
    case 'local-transfer':
      return <Banknote className="h-5 w-5" />;
    case 'international-transfer':
      return <Globe className="h-5 w-5" />;
    default:
      return <CreditCard className="h-5 w-5" />;
  }
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

// Payment Method Card Component
function PaymentMethodCard({ method, onSelect }: { method: PaymentMethod; onSelect: (method: PaymentMethod) => void }) {
  const { t } = useLocalization();
  
  return (
    <Card className="cursor-pointer hover:border-primary transition-all hover:shadow-md" onClick={() => onSelect(method)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {getPaymentMethodIcon(method.type)}
            </div>
            <div>
              <CardTitle className="text-base">{method.displayName}</CardTitle>
              <CardDescription className="text-xs">{method.name}</CardDescription>
            </div>
          </div>
          {method.processingTime && (
            <Badge variant="secondary" className="text-xs">
              {method.processingTime}
            </Badge>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}

// Selected Payment Details Component
function PaymentMethodDetails({ method }: { method: PaymentMethod }) {
  const { t } = useLocalization();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            {getPaymentMethodIcon(method.type)}
          </div>
          <div>
            <CardTitle className="text-lg">{method.displayName}</CardTitle>
            <CardDescription>{method.name}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* E-Wallet Details */}
        {method.wallet && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <AccountDetail label={t('payment.accountNumber')} value={method.wallet.accountNumber} />
            <AccountDetail label={t('payment.accountName')} value={method.wallet.accountName} />
            {method.wallet.phoneNumber && (
              <AccountDetail label={t('payment.phoneNumber')} value={method.wallet.phoneNumber} />
            )}
            {method.wallet.notes && (
              <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                💡 {method.wallet.notes}
              </p>
            )}
          </div>
        )}
        
        {/* Bank Transfer Details */}
        {method.currencies && (
          <div className="space-y-3">
            {Object.entries(method.currencies).map(([currency, details]) => (
              <div key={currency} className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Badge variant="outline">{currency}</Badge>
                </h4>
                {details.accountNumber && (
                  <AccountDetail label={t('payment.accountNumber')} value={details.accountNumber} />
                )}
                {details.iban && (
                  <AccountDetail label="IBAN" value={details.iban} />
                )}
                {details.swiftCode && (
                  <AccountDetail label="SWIFT Code" value={details.swiftCode} />
                )}
                {details.bankAddress && (
                  <p className="text-xs text-muted-foreground">{details.bankAddress}</p>
                )}
              </div>
            ))}
          </div>
        )}
        
        {method.accountHolder && (
          <div className="pt-2 border-t">
            <AccountDetail label={t('payment.accountHolder')} value={method.accountHolder} />
          </div>
        )}
        
        {/* Instructions */}
        {method.instructions && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              ℹ️ {method.instructions}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type FileFormValues = z.infer<typeof fileSchema>;

export function PurchaseCreditsDialog({ trigger }: { trigger: React.ReactNode }) {
  const { t } = useLocalization();
  const { userProfile: firebaseUser } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [credits, setCredits] = useState(100);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const price = credits * CREDIT_PRICE;

  const { data: settings, isLoading: isLoadingSettings, isError: isSettingsError } = usePublicSettings();
  
  // Get payment methods from settings (with fallback to legacy bankAccounts)
  const paymentMethods = settings?.paymentMethods?.filter(m => m.isActive) || [];
  
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
    if (!firebaseUser) return;
    
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('userId', firebaseUser.id);
    formData.append('credits', credits.toString());
    formData.append('price', price.toFixed(2));
    formData.append('planId', `custom-${credits}`);
    formData.append('planName', `${credits} Credits`);
    formData.append('userName', firebaseUser.name || 'N/A');
    formData.append('userEmail', firebaseUser.email || 'N/A');

    mutation.mutate(formData);
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
              <Button variant="ghost" size="sm" onClick={selectedPaymentMethod ? handleBackToMethods : () => setStep(1)} className="absolute top-3 left-3 flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> {t('common.back')}
              </Button>
              <DialogTitle className="flex items-center gap-2 pt-8"><Banknote className="w-6 h-6 text-primary" />{t('payment.selectMethod')}</DialogTitle>
              <DialogDescription>{t('payment.choosePreferred')}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto px-1">
              {isLoadingSettings ? (
                <BankDetailsSkeleton />
              ) : isSettingsError ? (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive"><AlertCircle /> {t('common.error')}</CardTitle>
                    <CardDescription>{t('payment.loadError')}</CardDescription>
                  </CardHeader>
                </Card>
              ) : !selectedPaymentMethod ? (
                // Payment Method Selection
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="all">{t('payment.all')}</TabsTrigger>
                    <TabsTrigger value="e-wallet">
                      <Wallet className="h-4 w-4 me-1" />
                      {t('payment.ewallets')}
                    </TabsTrigger>
                    <TabsTrigger value="bank">
                      <Building className="h-4 w-4 me-1" />
                      {t('payment.banks')}
                    </TabsTrigger>
                    <TabsTrigger value="transfer">
                      <Globe className="h-4 w-4 me-1" />
                      {t('payment.transfers')}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-3">
                    {paymentMethods.map((method) => (
                      <PaymentMethodCard key={method.id} method={method} onSelect={handleSelectPaymentMethod} />
                    ))}
                    {paymentMethods.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">{t('payment.noMethods')}</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="e-wallet" className="space-y-3">
                    {paymentMethods.filter(m => m.type === 'e-wallet').map((method) => (
                      <PaymentMethodCard key={method.id} method={method} onSelect={handleSelectPaymentMethod} />
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="bank" className="space-y-3">
                    {paymentMethods.filter(m => m.type === 'bank').map((method) => (
                      <PaymentMethodCard key={method.id} method={method} onSelect={handleSelectPaymentMethod} />
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="transfer" className="space-y-3">
                    {paymentMethods.filter(m => m.type === 'local-transfer' || m.type === 'international-transfer').map((method) => (
                      <PaymentMethodCard key={method.id} method={method} onSelect={handleSelectPaymentMethod} />
                    ))}
                  </TabsContent>
                </Tabs>
              ) : (
                // Selected Payment Method Details & Upload
                <>
                  <PaymentMethodDetails method={selectedPaymentMethod} />
                  
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-sm">{t('payment.reference')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-mono">{firebaseUser?.id || t('submitPayment.pleaseLogin')}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            if (firebaseUser?.id) {
                              navigator.clipboard.writeText(firebaseUser.id);
                              toast({ title: t('common.copied') });
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {t('payment.referenceNote')}
                      </p>
                    </CardContent>
                  </Card>

                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('submitPayment.uploadReceiptTitle')}</CardTitle>
                        <CardDescription>
                          {t('payment.uploadFor')} {credits} {t('payment.credits')} (${price.toFixed(2)})
                        </CardDescription>
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
                </>
              )}
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
