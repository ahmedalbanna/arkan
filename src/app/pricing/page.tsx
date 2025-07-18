
'use client';

import { PricingCard } from '@/components/PricingCard';
import type { PricingPlan } from '@/lib/types';
import { Gem } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 5,
    credits: 50,
    features: ['50 AI Credits', 'Basic Project Summaries', 'Standard DOCX Export', 'One-time payment'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 15,
    credits: 200,
    features: [
      '200 AI Credits',
      'Full Document Generation',
      'Diagram Generation',
      'Advanced DOCX Templates',
      'Priority Support',
      'One-time payment',
    ],
    isPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 45,
    credits: 1000,
    features: [
      '1000 AI Credits',
      'All Professional Features',
      'Team Collaboration (Coming Soon)',
      'Custom Agent Configuration',
      'Dedicated Support Channel',
      'One-time payment',
    ],
  },
];


export default function PricingPage() {
  const { t } = useLocalization();
  
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Gem className="w-10 h-10" />
          {t('pricing.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('pricing.pageSubtitle')}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
