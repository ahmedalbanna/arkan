'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/infrastructure/utils/cn';
import { 
    ArrowRight, 
    FileText, 
    Bot, 
    FileSpreadsheet, 
    Presentation, 
    GitGraph, 
    BookCheck, 
    Sparkles, 
    ShieldCheck, 
    Zap,
    BookOpenText,
    ChevronRight,
    Layout
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function HomePageContent() {
    const { t } = useLocalization();
    const { user } = useAuth();

    const features = [
        {
            icon: FileSpreadsheet,
            title: t('docs.proposalGenerator.title'),
            description: t('docs.proposalGenerator.description'),
            tag: 'Strategic'
        },
        {
            icon: FileText,
            title: t('docs.reportGenerator.title'),
            description: t('docs.reportGenerator.description'),
            tag: 'Comprehensive'
        },
        {
            icon: Presentation,
            title: t('docs.presentationGenerator.title'),
            description: t('docs.presentationGenerator.description'),
            tag: 'Visual'
        },
        {
            icon: GitGraph,
            title: t('docs.diagramGenerator.title'),
            description: t('docs.diagramGenerator.description'),
            tag: 'Analytical'
        },
        {
            icon: Bot,
            title: "AI Agent Manager",
            description: "Orchestrate specialized AI entities to handle niche domains and complex architectural requirements.",
            tag: 'Advanced'
        },
        {
            icon: BookCheck,
            title: t('docs.academicSolver.title'),
            description: t('docs.academicSolver.description'),
            tag: 'Rigor'
        },
    ];

    const protocolSteps = [
        {
            step: "01",
            title: "Logic Definition",
            description: "Establish your project's primary thesis and constraints. Our AI Architect maps the document DNA.",
            icon: Layout
        },
        {
            step: "02",
            title: "Recursive Synthesis",
            description: "Generate and refine content through multi-turn AI iteration and context-aware section building.",
            icon: Sparkles
        },
        {
            step: "03",
            title: "Production Export",
            description: "Finalize your intelligence into industry-standard DOCX and PPTX formats with professional templates.",
            icon: ShieldCheck
        }
    ];

    return (
        <div className="flex flex-col overflow-hidden bg-background">
            {/* Immersive Hero Section */}
            <section className="relative pt-32 pb-40 md:pt-48 md:pb-64 overflow-hidden">
                 <div
                    className="absolute inset-0 z-0"
                    style={{
                        background: 'radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.08), transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--accent) / 0.08), transparent 40%)'
                    }}
                />
                
                {/* Technical Desk Grid */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                <div className="container relative z-10 mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">v1.0 Stable</Badge>
                        <div className="h-3 w-px bg-primary/20" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 flex items-center gap-1.5">
                            <Zap className="h-3 w-3 fill-primary" />
                            Production Grade AI
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-[100px] font-headline font-bold tracking-tighter text-foreground leading-[0.85] mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Architecting <span className="text-primary underline decoration-primary/10 decoration-8 underline-offset-8">Intelligence</span>
                    </h1>

                    <p className={cn(
                        "text-xl sm:text-2xl md:text-3xl font-headline font-semibold text-muted-foreground max-w-4xl mx-auto mb-12 opacity-80",
                        "animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500"
                    )}>
                        The professional workspace for systematic document production, research synthesis, and AI-driven document architecture.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-5 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
                        <Button asChild size="lg" className="h-16 px-12 text-lg font-bold rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 group">
                            <Link href={user ? "/builder" : "/login"} className="flex items-center">
                                Start Production <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-16 px-12 text-lg font-bold rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/5 hover:text-primary transition-all active:scale-95">
                            <Link href="/writing-tools">Explore Tooling</Link>
                        </Button>
                    </div>
                </div>

                {/* Animated Background Atmosphere */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full filter blur-[150px] animate-pulse pointer-events-none -z-10" />
            </section>

            {/* Premium Features Section */}
            <section className="py-32 bg-muted/10 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
                <div className="container mx-auto px-6">
                    <div className="flex flex-col items-center text-center mb-24 space-y-4">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary px-6 py-1.5 rounded-full border-primary/20 bg-background shadow-sm">The Arsenal</Badge>
                        <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">Professional Tooling</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl italic leading-relaxed opacity-70 font-serif">Precision engineering for high-stakes documentation and research.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="group relative bg-card p-10 rounded-[32px] border border-border/40 hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
                                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-all duration-700 rotate-12">
                                    <feature.icon className="w-40 h-40 text-primary" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-bold opacity-40 group-hover:opacity-100 transition-opacity border-primary/20">{feature.tag}</Badge>
                                    </div>
                                    <h3 className="text-2xl font-bold font-headline mb-4 tracking-tight group-hover:text-primary transition-colors">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed text-sm line-clamp-3 italic font-serif">
                                        {feature.description}
                                    </p>
                                    <div className="mt-8 pt-6 border-t border-border/40 flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                        Initialize Tool <ChevronRight className="h-3 w-3 ml-1" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Strategic Protocol Section */}
            <section className="py-32 bg-background relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col items-center text-center mb-24 space-y-4">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary px-6 py-1.5 rounded-full border-primary/20 bg-background shadow-sm">The Protocol</Badge>
                        <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">Production Lifecycle</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl italic font-serif opacity-70">A systematic approach to deriving document excellence.</p>
                    </div>

                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
                         {/* Technical Connector Line */}
                         <div className="absolute top-16 left-0 w-full h-px bg-border/40 hidden md:block" />
                         <div className="absolute top-16 left-0 w-full h-px bg-gradient-to-r from-primary/40 via-primary to-transparent hidden md:block animate-pulse" style={{ width: '66%' }} />

                        {protocolSteps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center text-center group">
                                <div className="relative z-10 w-32 h-32 flex items-center justify-center bg-background text-primary rounded-[40px] text-4xl font-bold font-headline mb-10 border border-border/60 shadow-xl shadow-black/[0.03] transition-all duration-700 group-hover:border-primary/40 group-hover:rounded-2xl group-hover:scale-105 group-hover:shadow-primary/10">
                                    <span className="opacity-[0.03] absolute text-[120px] font-black italic select-none pointer-events-none -bottom-4 -right-4">{step.step}</span>
                                    <step.icon className="h-10 w-10 text-primary/40 group-hover:text-primary transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold font-headline mb-4 tracking-widest uppercase text-foreground/80">{step.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm max-w-xs italic font-serif opacity-80">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Background Atmosphere */}
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full filter blur-[120px] -z-10 translate-x-1/2 translate-y-1/2" />
            </section>

            {/* Final Production CTA */}
            <section className="py-32 px-6 pb-48">
                <div className="container mx-auto">
                    <div className="bg-[#0d1117] dark:bg-black p-12 md:p-32 rounded-[64px] shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group border border-white/5">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_50%)] opacity-50" />
                        <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-primary/10 rounded-full filter blur-[120px] animate-pulse" />
                        
                        {/* Desk Grid Effect for CTA */}
                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                        <div className="relative z-10 flex flex-col items-center text-center space-y-12">
                            <div className="space-y-4">
                                <Badge variant="outline" className="text-[10px] uppercase tracking-[0.5em] font-bold text-primary-foreground/40 px-6 py-1 rounded-full border-white/10">Initialize Production</Badge>
                                <h2 className="text-5xl md:text-[80px] font-bold font-headline tracking-tighter text-white max-w-4xl leading-[0.85]">
                                    Ready to Architect Your Next <span className="text-primary italic">Intelligence?</span>
                                </h2>
                            </div>
                            
                            <p className="text-white/60 text-xl max-w-2xl font-medium leading-relaxed italic font-serif">
                                Join the elite cohort of researchers and professionals leveraging the Arkan Protocol to produce high-impact, verified documentation.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-6">
                                <Button asChild size="lg" className="h-16 px-12 text-lg font-bold rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 transition-transform bg-primary text-primary-foreground border-none">
                                    <Link href="/signup">Establish Credentials</Link>
                                </Button>
                                <Button asChild size="lg" variant="ghost" className="h-16 px-12 text-lg font-bold rounded-2xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
                                    <Link href="/login" className="flex items-center">
                                        Restore Session <ChevronRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
