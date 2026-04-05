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
    Layout,
    Layers,
    Cpu,
    Database,
    Binary
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

/**
 * HomePageContent — Arkan Landing Matrix.
 * High-fidelity marketing entry point synchronized with internal workspace aesthetics.
 * 
 * DEFENSIVE MEASURES:
 * 1. Interaction Fidelity: Implements standardized sweep-gradients and inset rings.
 * 2. Visual Standardization: Codifies 28px dot-grids and technical typography.
 * 3. Responsive Robustness: Optimized for variable viewport widths with flexible grids.
 * 4. Child Guard: Fixes "React.Children.only" error by isolating Button asChild children.
 */

export default function HomePageContent() {
    const { t } = useLocalization();
    const { user } = useAuth();

    const features = [
        {
            icon: FileSpreadsheet,
            title: t('docs.proposalGenerator.title'),
            description: t('docs.proposalGenerator.description'),
            tag: 'Strategic',
            vector: 'V1.4'
        },
        {
            icon: FileText,
            title: t('docs.reportGenerator.title'),
            description: t('docs.reportGenerator.description'),
            tag: 'Comprehensive',
            vector: 'V2.1'
        },
        {
            icon: Presentation,
            title: t('docs.presentationGenerator.title'),
            description: t('docs.presentationGenerator.description'),
            tag: 'Visual',
            vector: 'V1.0'
        },
        {
            icon: GitGraph,
            title: t('docs.diagramGenerator.title'),
            description: t('docs.diagramGenerator.description'),
            tag: 'Analytical',
            vector: 'ML_SPEC'
        },
        {
            icon: Bot,
            title: "AI Agent Manager",
            description: "Orchestrate specialized AI entities to handle niche domains and complex architectural requirements.",
            tag: 'Advanced',
            vector: 'CORE_V3'
        },
        {
            icon: BookCheck,
            title: t('docs.academicSolver.title'),
            description: t('docs.academicSolver.description'),
            tag: 'Rigor',
            vector: 'ACAD_V2'
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
            {/* Immersive Hero Section — Atmospheric Core */}
            <section className="relative pt-32 pb-40 md:pt-48 md:pb-64 overflow-hidden">
                 {/* Standardized 28px Dot-grid Background */}
                 <div 
                    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none z-0" 
                    style={{ 
                        backgroundImage: 'radial-gradient(circle at center, hsl(var(--primary)) 1px, transparent 1px)',
                        backgroundSize: '28px 28px' 
                    }} 
                />

                 <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at 50% 30%, hsl(var(--primary) / 0.12), transparent 50%)'
                    }}
                />
                
                <div className="container relative z-10 mx-auto px-6 text-center">
                    {/* Node Status Indicator */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">
                            Neural Pipeline Operational
                        </span>
                        <div className="h-3 w-px bg-primary/20 mx-1" />
                        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-black border-primary/20 text-primary bg-background shadow-inner px-2">v2.4.0-STABLE</Badge>
                    </div>

                    <h1 className="text-6xl md:text-[110px] font-headline font-black tracking-tighter text-foreground leading-[0.82] mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 uppercase">
                        Architecting <span className="text-primary italic">Intelligence</span>
                    </h1>

                    <p className={cn(
                        "text-xl sm:text-2xl md:text-3xl font-headline font-medium text-muted-foreground/80 max-w-4xl mx-auto mb-16 px-4 leading-relaxed",
                        "animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500"
                    )}>
                        The production workspace for systematic document synthesis, spectral research analysis, and AI-driven content orchestration.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
                        <div className="relative group overflow-hidden rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02]">
                            <Button asChild size="lg" className="h-16 px-12 text-[11px] font-black uppercase tracking-[0.25em] relative z-10 ring-1 ring-inset ring-white/20 bg-primary border-none">
                                <Link href={user ? "/builder" : "/login"} className="flex items-center">
                                    Initialize Production <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            {/* Technical Sweep Gradient — Moved outside Button asChild */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                        </div>
                        
                        <Button asChild size="lg" variant="outline" className="h-16 px-12 text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl border-primary/20 bg-background/40 backdrop-blur-md hover:bg-primary/5 hover:text-primary transition-all active:scale-95">
                            <Link href="/writing-tools">View Arsenal</Link>
                        </Button>
                    </div>
                </div>

                {/* Atmospheric decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-primary/[0.03] rounded-full filter blur-[180px] animate-pulse pointer-events-none -z-10" />
            </section>

            {/* Feature Matrix — Technical Manifest */}
            <section className="py-32 bg-muted/5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                
                {/* 28px Dot-grid for Features */}
                <div 
                    className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                    style={{ 
                        backgroundImage: 'radial-gradient(circle at center, hsl(var(--primary)) 1px, transparent 1px)',
                        backgroundSize: '28px 28px' 
                    }} 
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center mb-24 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="h-px w-8 bg-primary/40" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-primary">Neural Arsenal</span>
                            <div className="h-px w-8 bg-primary/40" />
                        </div>
                        <h2 className="text-4xl md:text-7xl font-black font-headline tracking-tighter uppercase leading-none">High-Density Tooling</h2>
                        <p className="text-lg text-muted-foreground/70 max-w-2xl italic leading-relaxed font-serif px-4">Precision engineering nodes for high-stakes documentation and spectral synthesis.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="group relative bg-card/40 backdrop-blur-xl p-10 rounded-[40px] border border-border/60 hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)] hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden">
                                {/* Technical Background Icons */}
                                <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-1000 rotate-12 pointer-events-none">
                                    <f.icon className="w-64 h-64 text-primary" />
                                </div>

                                {/* Crop Marks — Technical HUD detail */}
                                <div className="absolute top-6 left-6 w-4 h-px bg-primary/10" />
                                <div className="absolute top-6 left-6 w-px h-4 bg-primary/10" />
                                <div className="absolute top-6 right-6 w-4 h-px bg-primary/10" />
                                <div className="absolute top-6 right-6 w-px h-4 bg-primary/10" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="h-14 w-14 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                                            <f.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge variant="outline" className="text-[8px] uppercase tracking-widest font-black border-primary/20 text-primary/60 bg-primary/5 shadow-inner px-2 py-0">{f.tag}</Badge>
                                            <span className="text-[7px] font-mono font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">{f.vector}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black font-headline mb-4 tracking-tight group-hover:text-primary transition-colors uppercase">{f.title}</h3>
                                    <p className="text-muted-foreground/70 leading-relaxed text-sm line-clamp-3 italic font-serif font-medium">
                                        {f.description}
                                    </p>
                                    <div className="mt-10 pt-6 border-t border-primary/10 flex items-center text-[9px] font-black uppercase tracking-[0.25em] text-primary/60 group-hover:text-primary transition-all translate-x-[-4px] group-hover:translate-x-0">
                                        Initialize node protocol <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Production Lifecycle — Process Grid */}
            <section className="py-32 bg-background relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col items-center text-center mb-24 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-muted-foreground/60">Execution Manifest</span>
                        </div>
                        <h2 className="text-4xl md:text-7xl font-black font-headline tracking-tighter uppercase leading-none">Synthesis Pipeline</h2>
                        <p className="text-lg text-muted-foreground/70 max-w-2xl italic font-serif px-4">A systematic algorithmic approach to deriving professional excellence.</p>
                    </div>

                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 max-w-6xl mx-auto">
                         {/* Technical Connector Line */}
                         <div className="absolute top-16 left-0 w-full h-px bg-primary/10 hidden md:block" />
                         <div className="absolute top-16 left-0 w-full h-px bg-gradient-to-r from-primary/40 via-primary to-transparent hidden md:block animate-pulse" style={{ width: '66%' }} />

                        {protocolSteps.map((s, i) => (
                            <div key={i} className="relative flex flex-col items-center text-center group">
                                <div className="relative z-10 w-32 h-32 flex items-center justify-center bg-background text-primary rounded-[44px] text-4xl font-bold font-headline mb-10 border border-border/60 shadow-2xl shadow-black/[0.03] transition-all duration-700 group-hover:border-primary/40 group-hover:rounded-2xl group-hover:scale-105 group-hover:shadow-primary/15 relative overflow-hidden">
                                    <span className="opacity-[0.03] absolute text-[120px] font-black italic select-none pointer-events-none -bottom-4 -right-4 transition-all group-hover:opacity-[0.06] group-hover:-translate-y-2">{s.step}</span>
                                    <s.icon className="h-10 w-10 text-primary/40 group-hover:text-primary group-hover:scale-110 transition-all duration-500" />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <h3 className="text-xl font-black font-headline tracking-[0.15em] uppercase text-foreground/90">{s.title}</h3>
                                    <div className="h-1 w-8 bg-primary/10 rounded-full group-hover:w-16 transition-all duration-500" />
                                </div>
                                <p className="text-muted-foreground leading-relaxed text-[13px] max-w-xs italic font-serif opacity-80 mt-4 px-2 font-medium">
                                    {s.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final Conversion — The Void CTA */}
            <section className="py-32 px-6 pb-48">
                <div className="container mx-auto">
                    <div className="bg-[#090c10] p-12 md:p-32 rounded-[64px] shadow-[0_0_120px_-20px_rgba(var(--primary),0.2)] relative overflow-hidden group border border-white/5">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_50%)]" />
                        <div className="absolute -bottom-48 -left-48 w-[800px] h-[800px] bg-primary/10 rounded-full filter blur-[140px] animate-pulse" />
                        
                        {/* 28px Grid for CTA */}
                        <div 
                            className="absolute inset-0 opacity-[0.04] pointer-events-none" 
                            style={{ 
                                backgroundImage: 'radial-gradient(circle at center, #fff 1px, transparent 1px)',
                                backgroundSize: '40px 40px' 
                            }} 
                        />

                        <div className="relative z-10 flex flex-col items-center text-center space-y-12">
                            <div className="space-y-5">
                                <Badge variant="outline" className="text-[10px] uppercase tracking-[0.5em] font-black text-primary px-8 py-1.5 rounded-full border-white/10 bg-white/5 backdrop-blur-md">Engagement Portal</Badge>
                                <h2 className="text-5xl md:text-[90px] font-black font-headline tracking-tighter text-white max-w-5xl leading-[0.82] uppercase">
                                    Initialize your next <span className="text-primary italic">Intelligence Vector</span>
                                </h2>
                            </div>
                            
                            <p className="text-white/60 text-xl max-w-2xl font-medium leading-relaxed italic font-serif">
                                Join the elite cohort of researchers leveraging the Arkan protocol to synthesize high-impact, verified documentation.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-6 pt-4">
                                <Button asChild size="lg" className="h-16 px-12 text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 transition-transform bg-primary text-primary-foreground border-none ring-1 ring-inset ring-white/20">
                                    <Link href="/signup">Establish Identity</Link>
                                </Button>
                                <Button asChild size="lg" variant="ghost" className="h-16 px-12 text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
                                    <Link href="/login" className="flex items-center">
                                        Restore Node Session <ChevronRight className="h-4 w-4 ml-2 opacity-40 group-hover:opacity-100" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stable Manifest Footer — High Fidelity Landing Alignment */}
            <footer className="py-12 px-10 border-t border-primary/10 bg-muted/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:20px_20px]" />
                
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/80">Arkan Intelligence Suite</span>
                        </div>
                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] ml-4.5">Stable Manifest V2.4.0</span>
                    </div>

                    <div className="flex items-center gap-10">
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">System Status</span>
                            <Badge variant="outline" className="h-5 text-[8px] font-black border-green-500/20 text-green-500 bg-green-500/5 px-2 rounded-lg">ALL_NODES_OPERATIONAL</Badge>
                        </div>
                        <div className="h-8 w-px bg-primary/10 hidden md:block" />
                        <div className="flex items-center gap-6">
                            {[
                                { icon: Cpu, label: 'Core' },
                                { icon: Database, label: 'Matrix' },
                                { icon: Binary, label: 'Vector' }
                            ].map((node, i) => (
                                <div key={i} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                                    <node.icon className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                                    <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/20 group-hover:text-primary/60 transition-colors">{node.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
