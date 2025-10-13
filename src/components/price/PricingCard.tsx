
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/lib/utils';
import { CheckCircle, Crown, Sparkles, Star, Zap } from 'lucide-react';
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

    const getPlanIcon = () => {
        switch (plan.name.toLowerCase()) {
            case 'basic':
                return <Zap className="h-6 w-6" />;
            case 'pro':
                return <Star className="h-6 w-6" />;
            case 'premium':
                return <Crown className="h-6 w-6" />;
            default:
                return <Sparkles className="h-6 w-6" />;
        }
    };

    const getPlanGradient = () => {
        switch (plan.name.toLowerCase()) {
            case 'basic':
                return 'from-blue-500 to-blue-600';
            case 'pro':
                return 'from-purple-500 to-purple-600';
            case 'premium':
                return 'from-yellow-500 to-yellow-600';
            default:
                return 'from-primary to-primary-600';
        }
    };

    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card
                variant={plan.isPopular ? "gradient" : "glass"}
                className={cn(
                    'flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-glow hover:-translate-y-2 group',
                    plan.isPopular && 'border-primary shadow-glow scale-105'
                )}
            >
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-primary/5 opacity-50 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none"></div>

                {/* Popular Badge */}
                {plan.isPopular && (
                    <div className="absolute top-4 right-4 z-10">
                        <Badge variant="destructive" className="flex items-center gap-1 px-3 py-1 shadow-glow animate-pulse-glow">
                            <Crown className="h-3 w-3" />
                            {t('pricing.mostPopular')}
                        </Badge>
                    </div>
                )}

                <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                            "p-3 rounded-xl bg-gradient-to-br shadow-soft group-hover:scale-110 transition-transform duration-300",
                            getPlanGradient()
                        )}>
                            <div className="text-white">
                                {getPlanIcon()}
                            </div>
                        </div>
                        <div>
                            <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors">
                                {plan.name}
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI-Powered
                            </Badge>
                        </div>
                    </div>

                    <CardDescription className="space-y-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                                ${plan.price}
                            </span>
                            <span className="text-muted-foreground">/ {t('pricing.oneTime')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1 rounded-md bg-primary/10">
                                <Zap className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-semibold text-lg">{plan.credits} {t('pricing.aiCredits')}</span>
                        </div>
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow space-y-4 relative z-10">
                    <div className="space-y-3">
                        {plan.features.map((feature, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors group/feature"
                            >
                                <div className="p-1 rounded-full bg-green-500/10 group-hover/feature:scale-110 transition-transform">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </div>
                                <span className="text-sm text-muted-foreground group-hover/feature:text-foreground transition-colors">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="relative z-10 pt-4">
                    <Button
                        onClick={handleSelectPlan}
                        variant={plan.isPopular ? "gradient" : "default"}
                        className={cn(
                            "w-full font-headline transition-all duration-200 group-hover:shadow-glow",
                            plan.isPopular
                                ? "hover:scale-105"
                                : "hover:bg-primary hover:text-primary-foreground"
                        )}
                    >
                        <Crown className="h-4 w-4 mr-2" />
                        {t('pricing.selectPlanButton')}
                    </Button>
                </CardFooter>
            </Card>
        </AnimatedContainer>
    );
}
