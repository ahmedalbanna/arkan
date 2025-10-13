
'use client';

import { AnimatedContainer, CounterAnimation, StaggeredAnimation, TypingAnimation } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/lib/utils';
import {
    ArrowRight,
    Award,
    BrainCircuit,
    Code,
    Download,
    FileSpreadsheet,
    Globe,
    Palette,
    Play,
    Presentation,
    Rocket,
    Shield,
    Sparkles,
    Star,
    Users,
    Zap
} from 'lucide-react';
import Link from 'next/link';

export default function HomePageContent() {
    const { t, locale } = useLocalization();
    const { firebaseUser } = useAuth();

    const features = [
        {
            icon: FileSpreadsheet,
            title: t('home.feature1Title'),
            description: t('home.feature1Desc'),
            gradient: 'from-blue-500 to-purple-600',
            delay: '0.1s'
        },
        {
            icon: BrainCircuit,
            title: t('home.feature2Title'),
            description: t('home.feature2Desc'),
            gradient: 'from-purple-500 to-pink-600',
            delay: '0.2s'
        },
        {
            icon: Presentation,
            title: t('home.feature3Title'),
            description: t('home.feature3Desc'),
            gradient: 'from-pink-500 to-red-600',
            delay: '0.3s'
        },
    ];

    const stats = [
        { icon: Users, value: '10K+', label: 'Active Users' },
        { icon: FileSpreadsheet, value: '50K+', label: 'Documents Generated' },
        { icon: Star, value: '4.9', label: 'User Rating' },
        { icon: Globe, value: '15+', label: 'Languages Supported' },
    ];

    const benefits = [
        { icon: Zap, title: 'Lightning Fast', description: 'Generate documents in seconds' },
        { icon: Shield, title: 'Secure & Private', description: 'Your data is always protected' },
        { icon: Code, title: 'AI-Powered', description: 'Advanced AI for better results' },
        { icon: Palette, title: 'Customizable', description: 'Templates for every need' },
    ];

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    {/* Badge */}
                    <AnimatedContainer animation="fade-in-down" delay={0}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                            <Sparkles className="w-4 h-4" />
                            <span>AI-Powered Document Generation</span>
                        </div>
                    </AnimatedContainer>

                    {/* Main Title */}
                    <AnimatedContainer animation="fade-in-up" delay={200}>
                        <div className="text-6xl md:text-8xl font-headline font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
                            {t('header.title')}
                        </div>
                    </AnimatedContainer>

                    {/* Subtitle with Typing Animation */}
                    <AnimatedContainer animation="fade-in-up" delay={400}>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline font-semibold text-muted-foreground mb-6">
                            <TypingAnimation
                                text={t('home.heroTitle.animated')}
                                speed={50}
                                delay={600}
                                showCursor={true}
                            />
                        </h1>
                    </AnimatedContainer>

                    {/* Description */}
                    <AnimatedContainer animation="fade-in-up" delay={600}>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                            {t('home.heroSubtitle')}
                        </p>
                    </AnimatedContainer>

                    {/* CTA Buttons */}
                    <AnimatedContainer animation="fade-in-up" delay={800}>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
                            <Button asChild size="lg" variant="gradient" className="font-headline w-full sm:w-auto group">
                                <Link href={firebaseUser ? "/generate" : "/login"}>
                                    <Rocket className="mr-2 group-hover:animate-wiggle" />
                                    {t('home.exploreProjects')}
                                    <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="font-headline w-full sm:w-auto group">
                                <Link href="/docs">
                                    <Play className="mr-2" />
                                    {t('home.trySummarizer')}
                                </Link>
                            </Button>
                        </div>
                    </AnimatedContainer>

                    {/* Stats with Counter Animation */}
                    <AnimatedContainer animation="fade-in-up" delay={1000}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center group">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mb-2">
                                        <stat.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="text-2xl font-bold text-primary">
                                        <CounterAnimation
                                            value={parseInt(stat.value.replace(/[^\d]/g, ''))}
                                            duration={2000}
                                            delay={1200 + index * 200}
                                            suffix={stat.value.includes('+') ? '+' : ''}
                                        />
                                    </div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </AnimatedContainer>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-24 bg-muted/20 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <AnimatedContainer animation="fade-in-up" delay={0}>
                            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
                                Powerful Features
                            </h2>
                        </AnimatedContainer>
                        <AnimatedContainer animation="fade-in-up" delay={200}>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Everything you need to create professional documents with AI assistance
                            </p>
                        </AnimatedContainer>
                    </div>

                    <StaggeredAnimation
                        staggerDelay={200}
                        animation="fade-in-up"
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                variant="interactive"
                                className="p-8 flex flex-col items-center group hover:shadow-glow hover:-translate-y-2 transition-all duration-300 bg-card/50 backdrop-blur-sm"
                            >
                                <div className={cn(
                                    "p-6 rounded-2xl mb-6 transition-all duration-300 group-hover:scale-110",
                                    `bg-gradient-to-br ${feature.gradient}`
                                )}>
                                    <feature.icon className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-headline font-semibold mb-3 text-center">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-center">
                                    {feature.description}
                                </p>
                            </Card>
                        ))}
                    </StaggeredAnimation>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 md:py-24 bg-gradient-to-r from-primary/5 to-purple-500/5">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <AnimatedContainer animation="fade-in-up" delay={0}>
                            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
                                Why Choose Arkan?
                            </h2>
                        </AnimatedContainer>
                        <AnimatedContainer animation="fade-in-up" delay={200}>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Experience the future of document creation
                            </p>
                        </AnimatedContainer>
                    </div>

                    <StaggeredAnimation
                        staggerDelay={150}
                        animation="scale-in"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {benefits.map((benefit, index) => (
                            <Card
                                key={index}
                                variant="glass"
                                className="p-6 text-center group hover:shadow-medium hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4">
                                    <benefit.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                                <p className="text-sm text-muted-foreground">{benefit.description}</p>
                            </Card>
                        ))}
                    </StaggeredAnimation>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-purple-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <AnimatedContainer animation="fade-in-up" delay={0}>
                        <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
                            Ready to Get Started?
                        </h2>
                    </AnimatedContainer>
                    <AnimatedContainer animation="fade-in-up" delay={200}>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                            Join thousands of users who are already creating amazing documents with Arkan
                        </p>
                    </AnimatedContainer>
                    <AnimatedContainer animation="fade-in-up" delay={400}>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <Button asChild size="lg" variant="secondary" className="font-headline w-full sm:w-auto">
                                <Link href={firebaseUser ? "/generate" : "/login"}>
                                    <Download className="mr-2" />
                                    Start Creating Now
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="font-headline w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                                <Link href="/pricing">
                                    <Award className="mr-2" />
                                    View Pricing
                                </Link>
                            </Button>
                        </div>
                    </AnimatedContainer>
                </div>
            </section>
        </div>
    );
}
