'use client';

import { AnimatedContainer, StaggeredAnimation } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle, Crown, Sparkles, Star, X, Zap } from 'lucide-react';

interface PricingFeature {
    name: string;
    basic: boolean | string;
    pro: boolean | string;
    premium: boolean | string;
}

interface PricingComparisonProps {
    features: PricingFeature[];
    className?: string;
}

export function PricingComparison({ features, className }: PricingComparisonProps) {
    const plans = [
        { name: 'Basic', icon: Zap, color: 'from-blue-500 to-blue-600' },
        { name: 'Pro', icon: Star, color: 'from-purple-500 to-purple-600' },
        { name: 'Premium', icon: Crown, color: 'from-yellow-500 to-yellow-600' }
    ];

    const getFeatureValue = (feature: PricingFeature, plan: string) => {
        switch (plan.toLowerCase()) {
            case 'basic':
                return feature.basic;
            case 'pro':
                return feature.pro;
            case 'premium':
                return feature.premium;
            default:
                return false;
        }
    };

    const renderFeatureValue = (value: boolean | string) => {
        if (typeof value === 'boolean') {
            return value ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
                <X className="h-5 w-5 text-muted-foreground" />
            );
        }
        return <span className="text-sm font-medium">{value}</span>;
    };

    return (
        <div className={cn("w-full", className)}>
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <Card variant="glass" className="backdrop-blur-md shadow-soft overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="font-headline">Feature Comparison</CardTitle>
                                <p className="text-sm text-muted-foreground">Compare features across all plans</p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="text-left p-4 font-semibold">Features</th>
                                        {plans.map((plan, index) => (
                                            <th key={plan.name} className="text-center p-4">
                                                <AnimatedContainer animation="fade-in-up" delay={300 + index * 100}>
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className={cn(
                                                            "p-2 rounded-lg bg-gradient-to-br shadow-soft",
                                                            plan.color
                                                        )}>
                                                            <plan.icon className="h-5 w-5 text-white" />
                                                        </div>
                                                        <span className="font-semibold">{plan.name}</span>
                                                        <Badge variant="secondary" className="text-xs">
                                                            <Sparkles className="h-3 w-3 mr-1" />
                                                            AI-Powered
                                                        </Badge>
                                                    </div>
                                                </AnimatedContainer>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <StaggeredAnimation animation="fade-in-up" staggerDelay={100}>
                                        {features.map((feature, index) => (
                                            <tr key={index} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
                                                <td className="p-4 font-medium">{feature.name}</td>
                                                {plans.map((plan, planIndex) => (
                                                    <td key={plan.name} className="p-4 text-center">
                                                        <div className="flex justify-center">
                                                            {renderFeatureValue(getFeatureValue(feature, plan.name))}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </StaggeredAnimation>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </AnimatedContainer>
        </div>
    );
}
