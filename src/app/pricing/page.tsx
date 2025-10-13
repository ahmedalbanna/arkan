
'use client';

import { PricingCard, PricingPlan } from '@/components/price/PricingCard';
import { AnimatedContainer, StaggeredAnimation, TypingAnimation } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { CheckCircle, Crown, Gem, Sparkles, Star, Zap } from 'lucide-react';

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
    <div className="relative flex-grow flex flex-col bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto max-w-6xl px-4 py-12 relative z-10">
        {/* Enhanced Header */}
        <AnimatedContainer animation="fade-in-down" delay={0}>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary-600">
                <Gem className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-headline font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {t('pricing.pageTitle')}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge variant="secondary" className="text-sm">
                    <Sparkles className="h-4 w-4 mr-1" />
                    Choose Your Plan
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    <Zap className="h-4 w-4 mr-1" />
                    One-time Payment
                  </Badge>
                </div>
              </div>
            </div>
            <AnimatedContainer animation="fade-in-up" delay={200}>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                <TypingAnimation
                  text={t('pricing.pageSubtitle')}
                  speed={30}
                  delay={400}
                  showCursor={true}
                />
              </p>
            </AnimatedContainer>
          </div>
        </AnimatedContainer>

        {/* Features Highlight */}
        <AnimatedContainer animation="fade-in-up" delay={400}>
          <Card variant="glass" className="p-8 mb-12 backdrop-blur-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                <Crown className="h-6 w-6 text-primary" />
                Why Choose Arkan?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 group-hover:scale-110 transition-transform mb-3">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">Advanced AI technology for intelligent document generation</p>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 group-hover:scale-110 transition-transform mb-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Professional Quality</h3>
                <p className="text-sm text-muted-foreground">High-quality documents ready for professional use</p>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 group-hover:scale-110 transition-transform mb-3">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Fast & Efficient</h3>
                <p className="text-sm text-muted-foreground">Generate documents in minutes, not hours</p>
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        {/* Enhanced Pricing Cards */}
        <StaggeredAnimation
          staggerDelay={200}
          animation="fade-in-up"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </StaggeredAnimation>
      </div>
    </div>
  );
}
