
'use client';

import { PaymentVerificationConsole } from "@/components/admin/payments/PaymentVerificationConsole";
import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { useLocalization } from "@/context/LocalizationContext";
import { CheckCircle, CreditCard, Shield } from 'lucide-react';

export default function ManagePaymentsPage() {
  const { t } = useLocalization();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 container mx-auto max-w-7xl px-4 py-12">
        <AnimatedContainer animation="fade-in-down" delay={200}>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary-600 shadow-glow">
                <CreditCard className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {t('managePayments.pageTitle')}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Payment Security
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verification Console
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('managePayments.pageSubtitle')}
            </p>
          </div>
        </AnimatedContainer>

        <AnimatedContainer animation="fade-in-up" delay={400}>
          <PaymentVerificationConsole />
        </AnimatedContainer>
      </div>
    </div>
  );
}
