'use client';

import { AnimatedContainer, StaggeredAnimation } from '@/components/ui/animation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Quote, Sparkles, Star, TrendingUp } from 'lucide-react';

interface Testimonial {
    id: string;
    name: string;
    role: string;
    company: string;
    avatar?: string;
    rating: number;
    content: string;
    plan: string;
    creditsUsed: number;
    savings: number;
}

interface PricingTestimonialProps {
    testimonials: Testimonial[];
    className?: string;
}

export function PricingTestimonial({ testimonials, className }: PricingTestimonialProps) {
    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={cn(
                    "h-4 w-4",
                    i < rating ? "text-yellow-500 fill-current" : "text-muted-foreground"
                )}
            />
        ));
    };

    const getPlanColor = (plan: string) => {
        switch (plan.toLowerCase()) {
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
        <div className={cn("w-full", className)}>
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl font-headline font-semibold">What Our Users Say</h2>
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Real feedback from satisfied customers</p>
                </div>
            </AnimatedContainer>

            <StaggeredAnimation animation="fade-in-up" staggerDelay={100}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <AnimatedContainer key={testimonial.id} animation="fade-in-up" delay={300 + index * 100}>
                            <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-300 group">
                                <CardContent className="p-6">
                                    {/* Quote Icon */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary-600/10">
                                            <Quote className="h-4 w-4 text-primary" />
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-xs bg-gradient-to-r text-white",
                                                getPlanColor(testimonial.plan)
                                            )}
                                        >
                                            {testimonial.plan}
                                        </Badge>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-3">
                                        {renderStars(testimonial.rating)}
                                    </div>

                                    {/* Content */}
                                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                        &quot;{testimonial.content}&quot;
                                    </p>

                                    {/* User Info */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                                            <AvatarImage src={testimonial.avatar} />
                                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-white font-semibold">
                                                {testimonial.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm truncate">{testimonial.name}</div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {testimonial.role} at {testimonial.company}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Sparkles className="h-3 w-3 text-primary" />
                                                <span className="text-xs text-muted-foreground">Credits Used</span>
                                            </div>
                                            <div className="font-semibold text-sm">
                                                {testimonial.creditsUsed.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <TrendingUp className="h-3 w-3 text-green-500" />
                                                <span className="text-xs text-muted-foreground">Saved</span>
                                            </div>
                                            <div className="font-semibold text-sm text-green-600">
                                                ${testimonial.savings}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </AnimatedContainer>
                    ))}
                </div>
            </StaggeredAnimation>

            {/* Call to Action */}
            <AnimatedContainer animation="fade-in-up" delay={600}>
                <div className="text-center mt-8">
                    <div className="p-6 rounded-lg bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/20">
                        <h3 className="font-semibold text-lg mb-2">Join Thousands of Satisfied Users</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Start your AI journey today and experience the power of our platform
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Badge variant="secondary" className="text-xs">
                                <Sparkles className="h-3 w-3 mr-1" />
                                10,000+ Active Users
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                99% Satisfaction
                            </Badge>
                        </div>
                    </div>
                </div>
            </AnimatedContainer>
        </div>
    );
}
