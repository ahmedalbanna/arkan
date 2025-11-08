
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/lib/utils/cn';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';


export interface PricingPlan {
    id: string;
    name: string;
    price: number;
    credits: number;
    features: string[];
    isPopular?: boolean;
}
export function PricingCard({ plan }: { plan: PricingPlan }) {
    const router = useRouter();
    const { t } = useLocalization();

    const handleSelectPlan = () => {
        const params = new URLSearchParams({
            planId: plan.id,
            planName: plan.name,
            credits: plan.credits.toString(),
            price: plan.price.toString(),
        });
        router.push(`/payment/submit?${params.toString()}`);
    }

    return (
        <Card className={cn('flex flex-col', plan.isPopular && 'border-primary shadow-lg')}>
            {plan.isPopular && (
                <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-1 rounded-t-lg">
                    {t('pricing.mostPopular')}
                </div>
            )}
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground"> / {t('pricing.oneTime')}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <p className="font-semibold">{plan.credits} {t('pricing.aiCredits')}</p>
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
                    onClick={handleSelectPlan}
                    className="w-full font-headline"
                >
                    {t('pricing.selectPlanButton')}
                </Button>
            </CardFooter>
        </Card>
    );
}
