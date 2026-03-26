'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/infrastructure/utils/cn';
import { ArrowRight, FileText, Bot, FileSpreadsheet, Presentation, GitGraph, BookCheck } from 'lucide-react';
import Link from 'next/link';

// The 'featuredProjects' prop is no longer used but kept to avoid breaking changes if the page is rendered from different places.
export default function HomePageContent({ }: { featuredProjects: any[] }) {
    const { t, locale } = useLocalization();
    const { user } = useAuth();

    const features = [
        {
            icon: FileSpreadsheet,
            title: t('docs.proposalGenerator.title'),
            description: t('docs.proposalGenerator.description'),
        },
        {
            icon: FileText,
            title: t('docs.reportGenerator.title'),
            description: t('docs.reportGenerator.description'),
        },
        {
            icon: Presentation,
            title: t('docs.presentationGenerator.title'),
            description: t('docs.presentationGenerator.description'),
        },
        {
            icon: GitGraph,
            title: t('docs.diagramGenerator.title'),
            description: t('docs.diagramGenerator.description'),
        },
        {
            icon: Bot,
            title: t('agentManager.pageTitle'),
            description: "Build a series of AI agents to accomplish complex tasks, each configurable with unique prompts and knowledge.",
        },
        {
            icon: BookCheck,
            title: t('docs.academicSolver.title'),
            description: t('docs.academicSolver.description'),
        },
    ];

    const howItWorksSteps = [
        {
            step: 1,
            title: "Describe Your Idea",
            description: "Start by creating a project and describing your core concept. The AI will generate a comprehensive proposal to get you started.",
        },
        {
            step: 2,
            title: "Generate & Refine Content",
            description: "Use the builder to generate report sections, diagrams, and presentations. Edit and refine the content with a powerful suite of AI writing tools.",
        },
        {
            step: 3,
            title: "Export Your Document",
            description: "Once your work is complete, export it as a professionally formatted DOCX or PPTX file, ready for submission or presentation.",
        }
    ];

    return (
        <div className="flex flex-col overflow-hidden">
            {/* Hero Section */}
            <section className="relative py-24 md:py-40 bg-background bg-dot-pattern">
                 <div
                    className="absolute inset-0 z-0 opacity-50 dark:opacity-20"
                    style={{
                        background: 'radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.1), transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--accent) / 0.1), transparent 40%)'
                    }}
                />
                <div className="container relative z-10 mx-auto px-4 text-center">
                    <div className="text-5xl md:text-7xl font-headline font-bold text-primary animate-fade-in-up">
                        {t('header.title')}
                    </div>
                    <h1
                        className={cn(
                            "text-2xl sm:text-3xl md:text-4xl font-headline font-semibold text-muted-foreground mt-2 mb-6 overflow-hidden border-r-4 border-r-primary whitespace-nowrap mx-auto animate-typing",
                            locale === 'ar' && "border-r-0 border-l-4 border-l-primary"
                        )}
                        style={{ width: 'fit-content' }}
                    >
                        {t('home.heroTitle.animated')}
                    </h1>
                    <p
                        className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-in-up"
                        style={{ animationDelay: '2.8s' } as React.CSSProperties}
                    >
                        {t('home.heroSubtitle')}
                    </p>
                    <div
                        className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up"
                        style={{ animationDelay: '3s' } as React.CSSProperties}
                    >
                        <Button asChild size="lg" className="font-headline text-lg w-full sm:w-auto shadow-lg hover:shadow-primary/30 transition-shadow">
                            <Link href={user ? "/builder" : "/login"}>
                                {t('home.exploreProjects')} <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="secondary" className="font-headline text-lg w-full sm:w-auto">
                            <Link href="/docs">{t('home.trySummarizer')}</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 md:py-28 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline">A Complete AI-Powered Workspace</h2>
                        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">From initial idea to final document, Arkan provides all the tools you need.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-card p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-transparent hover:border-primary/20">
                                <div className="p-4 bg-primary/10 rounded-lg mb-6 inline-block">
                                    <feature.icon className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-headline font-semibold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 md:py-28 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline">How It Works</h2>
                        <p className="text-lg text-muted-foreground mt-2">Generate professional documents in three simple steps.</p>
                    </div>
                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
                         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden md:block"></div>
                         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary -translate-y-1/2 hidden md:block" style={{ width: '66%', zIndex: 1 }}></div>

                        {howItWorksSteps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center text-center">
                                <div className="relative z-10 w-16 h-16 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-2xl font-bold font-headline mb-6 border-4 border-background">
                                    {step.step}
                                </div>
                                <h3 className="text-xl font-headline font-semibold mb-3">{step.title}</h3>
                                <p className="text-muted-foreground leading-relaxed max-w-xs">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
