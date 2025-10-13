'use client';

import { AnimatedContainer, StaggeredAnimation } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CreditCard, HelpCircle, Shield, Sparkles, Zap } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
    category: 'general' | 'payment' | 'credits' | 'support';
}

interface PricingFAQProps {
    faqs: FAQItem[];
    className?: string;
}

export function PricingFAQ({ faqs, className }: PricingFAQProps) {
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'general':
                return HelpCircle;
            case 'payment':
                return CreditCard;
            case 'credits':
                return Zap;
            case 'support':
                return Shield;
            default:
                return HelpCircle;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'general':
                return 'from-blue-500 to-blue-600';
            case 'payment':
                return 'from-green-500 to-green-600';
            case 'credits':
                return 'from-purple-500 to-purple-600';
            case 'support':
                return 'from-orange-500 to-orange-600';
            default:
                return 'from-primary to-primary-600';
        }
    };

    const groupedFAQs = faqs.reduce((acc, faq) => {
        if (!acc[faq.category]) {
            acc[faq.category] = [];
        }
        acc[faq.category].push(faq);
        return acc;
    }, {} as Record<string, FAQItem[]>);

    return (
        <div className={cn("w-full", className)}>
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <Card variant="glass" className="backdrop-blur-md shadow-soft">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                                <HelpCircle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="font-headline">Frequently Asked Questions</CardTitle>
                                <p className="text-sm text-muted-foreground">Everything you need to know about our pricing</p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {Object.entries(groupedFAQs).map(([category, categoryFAQs], categoryIndex) => {
                            const Icon = getCategoryIcon(category);
                            const colorClass = getCategoryColor(category);

                            return (
                                <AnimatedContainer
                                    key={category}
                                    animation="fade-in-up"
                                    delay={300 + categoryIndex * 100}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-lg bg-gradient-to-br shadow-soft",
                                                colorClass
                                            )}>
                                                <Icon className="h-4 w-4 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-lg capitalize">{category}</h3>
                                            <Badge variant="secondary" className="text-xs">
                                                {categoryFAQs.length} questions
                                            </Badge>
                                        </div>

                                        <div className="grid gap-3">
                                            <StaggeredAnimation animation="fade-in-up" staggerDelay={50}>
                                                {categoryFAQs.map((faq, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-4 rounded-lg bg-gradient-to-r from-background/50 to-primary/5 border border-border/50 hover:shadow-soft transition-all duration-200 group"
                                                    >
                                                        <div className="space-y-2">
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-1 rounded-md bg-primary/10 group-hover:scale-110 transition-transform">
                                                                    <Sparkles className="h-3 w-3 text-primary" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                                                                        {faq.question}
                                                                    </h4>
                                                                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                                                        {faq.answer}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </StaggeredAnimation>
                                        </div>
                                    </div>
                                </AnimatedContainer>
                            );
                        })}

                        {/* Contact Support */}
                        <AnimatedContainer animation="fade-in-up" delay={600}>
                            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/20 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <span className="font-semibold text-sm">Still have questions?</span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Our support team is here to help you choose the right plan
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        24/7 Support
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        AI-Powered Help
                                    </Badge>
                                </div>
                            </div>
                        </AnimatedContainer>
                    </CardContent>
                </Card>
            </AnimatedContainer>
        </div>
    );
}
