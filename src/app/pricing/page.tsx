
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, ShoppingCart } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

const CREDIT_PRICE = 0.10; // $0.10 per credit

export default function PricingPage() {
  const { t } = useLocalization();
  const router = useRouter();
  const [credits, setCredits] = useState(100);

  const price = credits * CREDIT_PRICE;

  const handlePurchase = () => {
    const params = new URLSearchParams({
      planId: `custom-${credits}`,
      planName: `${credits} Credits`,
      credits: credits.toString(),
      price: price.toFixed(2),
    });
    router.push(`/payment/submit?${params.toString()}`);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Gem className="w-10 h-10" />
          {t('pricing.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('pricing.pageSubtitle')}
        </p>
      </div>

      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Top Up Your Credits</CardTitle>
          <CardDescription>
            Add credits to your account to continue using AI features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
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
          <Button onClick={handlePurchase} className="w-full font-headline text-lg" size="lg">
            <ShoppingCart className="me-2 h-5 w-5" />
            Purchase {credits} Credits
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
