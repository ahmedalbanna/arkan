
'use client';

import SubmitPaymentForm from '@/components/pricing/SubmitPaymentForm';
import { useLocalization } from '@/context/LocalizationContext';
import { Banknote } from 'lucide-react';

export default function SubmitPaymentPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Banknote className="w-10 h-10" />
          {t('submitPayment.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('submitPayment.pageSubtitle')}
        </p>
      </div>
      <SubmitPaymentForm />
    </div>
  );
}
