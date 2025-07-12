
'use client';

import { useActionState, useTransition } from 'react';
import type { PricingPlan } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { handlePurchase } from '@/app/pricing/actions';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';


function PurchaseButton({ plan }: { plan: PricingPlan }) {
  const { pending } = useTransition();

  return (
    <Button type="submit" className="w-full font-headline" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        `Purchase ${plan.name}`
      )}
    </Button>
  );
}


export function PricingCard({ plan }: { plan: PricingPlan }) {
  const { toast } = useToast();
  const router = useRouter();
  const [state, formAction] = useActionState(handlePurchase, null);

  useEffect(() => {
    if (state?.success) {
      toast({
        title: 'Purchase Successful!',
        description: `You are now on the ${state.planId} plan with ${state.newBalance} credits.`,
      });
      // Redirect to profile page to see the new plan details
      router.push('/profile/user-1');
    }
    if (state?.error) {
      toast({
        title: 'Purchase Failed',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state, toast, router]);

  return (
    <Card className={cn('flex flex-col', plan.isPopular && 'border-primary shadow-lg')}>
      {plan.isPopular && (
        <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-1 rounded-t-lg">
          Most Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
        <CardDescription>
          <span className="text-4xl font-bold">${plan.price}</span>
          <span className="text-muted-foreground"> / month</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="font-semibold">{plan.credits} AI Credits</p>
        <ul className="space-y-2">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <form action={formAction} className="w-full">
          <input type="hidden" name="planId" value={plan.id} />
          <input type="hidden" name="credits" value={plan.credits} />
          <PurchaseButton plan={plan} />
        </form>
      </CardFooter>
    </Card>
  );
}
