
'use client';

import type { PricingPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePurchaseCredits } from '@/hooks/use-user'; // Import the new custom mutation hook

export function PricingCard({ plan }: { plan: PricingPlan }) {
    // Use the custom hook to handle the mutation logic
    const mutation = usePurchaseCredits();

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
                <Button
                    onClick={() => mutation.mutate(plan)}
                    className="w-full font-headline"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        `Purchase ${plan.name}`
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
