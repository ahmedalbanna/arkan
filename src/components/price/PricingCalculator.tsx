'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Calculator, DollarSign, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';

interface PricingCalculatorProps {
    basePrice: number;
    creditsPerDollar: number;
    className?: string;
}

export function PricingCalculator({ basePrice, creditsPerDollar, className }: PricingCalculatorProps) {
    const [budget, setBudget] = useState(100);
    const [customBudget, setCustomBudget] = useState('');
    const [isCustomMode, setIsCustomMode] = useState(false);

    const calculateCredits = (amount: number) => {
        return Math.floor(amount * creditsPerDollar);
    };

    const calculateSavings = (amount: number) => {
        const regularPrice = amount;
        const discountedPrice = amount * 0.9; // 10% discount
        return regularPrice - discountedPrice;
    };

    const handleBudgetChange = (value: number[]) => {
        setBudget(value[0]);
        setIsCustomMode(false);
    };

    const handleCustomBudgetChange = (value: string) => {
        setCustomBudget(value);
        const numValue = parseFloat(value) || 0;
        if (numValue > 0) {
            setIsCustomMode(true);
        }
    };

    const currentBudget = isCustomMode ? parseFloat(customBudget) || 0 : budget;
    const credits = calculateCredits(currentBudget);
    const savings = calculateSavings(currentBudget);

    return (
        <div className={cn("w-full", className)}>
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <Card variant="glass" className="backdrop-blur-md shadow-soft">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                                <Calculator className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="font-headline">Pricing Calculator</CardTitle>
                                <p className="text-sm text-muted-foreground">Calculate your AI credits and savings</p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Budget Input */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-primary" />
                                <Label className="font-semibold">Budget Range</Label>
                            </div>

                            <div className="space-y-3">
                                <Slider
                                    value={[budget]}
                                    onValueChange={handleBudgetChange}
                                    max={1000}
                                    min={10}
                                    step={10}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>$10</span>
                                    <span className="font-semibold">${budget}</span>
                                    <span>$1000</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Or enter custom amount:</span>
                                <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={customBudget}
                                    onChange={(e) => handleCustomBudgetChange(e.target.value)}
                                    className="w-32"
                                />
                            </div>
                        </div>

                        {/* Results */}
                        <AnimatedContainer animation="fade-in-up" delay={400}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Credits */}
                                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="h-4 w-4 text-blue-500" />
                                        <span className="font-semibold text-sm">AI Credits</span>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {credits.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {creditsPerDollar} credits per $1
                                    </div>
                                </div>

                                {/* Total Cost */}
                                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary-600/10 border border-primary/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        <span className="font-semibold text-sm">Total Cost</span>
                                    </div>
                                    <div className="text-2xl font-bold text-primary">
                                        ${currentBudget.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        One-time payment
                                    </div>
                                </div>

                                {/* Savings */}
                                <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="font-semibold text-sm">You Save</span>
                                    </div>
                                    <div className="text-2xl font-bold text-green-600">
                                        ${savings.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        10% early bird discount
                                    </div>
                                </div>
                            </div>
                        </AnimatedContainer>

                        {/* Action Button */}
                        <AnimatedContainer animation="fade-in-up" delay={600}>
                            <div className="text-center">
                                <Button
                                    variant="gradient"
                                    className="hover:shadow-glow transition-all duration-200"
                                    onClick={() => {
                                        // Handle purchase with calculated amount
                                        console.log('Purchase:', currentBudget);
                                    }}
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Purchase {credits.toLocaleString()} Credits
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Secure payment • Instant activation
                                </p>
                            </div>
                        </AnimatedContainer>
                    </CardContent>
                </Card>
            </AnimatedContainer>
        </div>
    );
}
