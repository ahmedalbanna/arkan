
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BrainCircuit, FileSpreadsheet, GitGraph, Laptop, Presentation, FileQuestion, BookCheck, PencilLine, FileText, ShieldCheck, Users, Workflow, Bell, Palette } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

const features = [
  {
    id: 'proposal',
    title: 'docs.proposalGenerator.title',
    icon: FileSpreadsheet,
    description: 'docs.proposalGenerator.description',
    steps: [
      'docs.proposalGenerator.step1',
      'docs.proposalGenerator.step2',
      'docs.proposalGenerator.step3',
    ],
  },
  {
    id: 'report',
    title: 'docs.reportGenerator.title',
    icon: FileText,
    description: 'docs.reportGenerator.description',
    steps: [
        'docs.reportGenerator.step1',
        'docs.reportGenerator.step2',
        'docs.reportGenerator.step3',
        'docs.reportGenerator.step4',
    ],
  },
  {
    id: 'diagram',
    title: 'docs.diagramGenerator.title',
    icon: GitGraph,
    description: 'docs.diagramGenerator.description',
    steps: [
        'docs.diagramGenerator.step1',
        'docs.diagramGenerator.step2',
        'docs.diagramGenerator.step3',
    ],
  },
  {
    id: 'code',
    title: 'docs.codeGenerator.title',
    icon: Laptop,
    description: 'docs.codeGenerator.description',
    steps: [
        'docs.codeGenerator.step1',
        'docs.codeGenerator.step2',
    ],
  },
    {
    id: 'presentation',
    title: 'docs.presentationGenerator.title',
    icon: Presentation,
    description: 'docs.presentationGenerator.description',
    steps: [
        'docs.presentationGenerator.step1',
        'docs.presentationGenerator.step2',
        'docs.presentationGenerator.step3',
    ],
  },
  {
    id: 'academic-solver',
    title: 'docs.academicSolver.title',
    icon: FileQuestion,
    description: 'docs.academicSolver.description',
    steps: [
        'docs.academicSolver.step1',
        'docs.academicSolver.step2',
        'docs.academicSolver.step3',
    ],
  },
  {
      id: 'team-management',
      title: 'docs.teamManagement.title',
      icon: Users,
      description: 'docs.teamManagement.description',
      steps: [
          'docs.teamManagement.step1',
          'docs.teamManagement.step2',
          'docs.teamManagement.step3',
          'docs.teamManagement.step4',
      ],
  },
  {
      id: 'design-studio',
      title: 'docs.designStudio.title',
      icon: Palette,
      description: 'docs.designStudio.description',
      steps: [
          'docs.designStudio.step1',
          'docs.designStudio.step2',
          'docs.designStudio.step3',
          'docs.designStudio.step4',
      ],
  },
  {
    id: 'push-notifications',
    title: 'docs.pushNotifications.title',
    icon: Bell,
    description: 'docs.pushNotifications.description',
    steps: [],
  },
  {
    id: 'admin',
    title: 'docs.admin.title',
    icon: ShieldCheck,
    description: 'docs.admin.description',
    steps: [
        'docs.admin.step1',
        'docs.admin.step2',
        'docs.admin.step3',
        'docs.admin.step4',
    ],
  },
];

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';

export default function DocsPage() {
    const { t } = useLocalization();

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Immersive Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% -20%, hsl(var(--primary) / 0.08), transparent 50%)'
                }}
            />
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="container relative z-10 mx-auto max-w-[1600px] px-6 py-20 md:py-32">
                <div className="flex flex-col items-center text-center mb-24 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">Reference Manifest</Badge>
                        <div className="h-3 w-px bg-primary/20" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Documentation Node</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-foreground leading-[0.9] flex items-center gap-6">
                        <BrainCircuit className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
                        {t('docs.pageTitle')}
                    </h1>
                    
                    <p className="text-xl text-muted-foreground max-w-3xl italic font-serif leading-relaxed opacity-80">
                        {t('docs.pageSubtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20">
                    {/* Technical Navigation Sidebar */}
                    <aside className="md:col-span-3">
                        <nav className="sticky top-24 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Protocol Index</h3>
                                </div>
                                
                                <div className="flex flex-col gap-1.5">
                                    {features.map(feature => (
                                        <a 
                                            key={feature.id} 
                                            href={`#${feature.id}`} 
                                            className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all duration-300 border border-transparent hover:border-primary/20"
                                        >
                                            <feature.icon className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                            <span className="truncate">{t(feature.title)}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 rounded-[24px] border border-dashed border-primary/20 bg-primary/[0.02] text-center space-y-3">
                                <ShieldCheck className="h-8 w-8 text-primary/40 mx-auto" />
                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-relaxed">
                                    Verified Systematic Documentation
                                </p>
                            </div>
                        </nav>
                    </aside>

                    {/* Content Manifest */}
                    <main className="md:col-span-9 space-y-16">
                        {features.map((feature, index) => (
                            <div 
                                id={feature.id} 
                                key={feature.id} 
                                className="scroll-mt-32 animate-in fade-in slide-in-from-bottom-8 duration-1000" 
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] group">
                                    <header className="px-8 py-10 border-b bg-muted/5 flex items-center justify-between transition-colors group-hover:bg-primary/[0.02]">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-all duration-500">
                                                <feature.icon className="h-7 w-7" />
                                            </div>
                                            <div className="space-y-1">
                                                <h2 className="text-2xl font-bold font-headline tracking-tight">{t(feature.title)}</h2>
                                                <Badge variant="outline" className="h-4.5 text-[8px] uppercase tracking-widest font-bold border-primary/20 text-primary">
                                                    Protocol ID: 0{index + 1}
                                                </Badge>
                                            </div>
                                        </div>
                                    </header>
                                    
                                    <CardContent className="p-8 md:p-12 space-y-10">
                                        <p className="text-base text-muted-foreground leading-relaxed italic font-serif opacity-80 border-l-2 border-primary/20 pl-6 max-w-3xl">
                                            {t(feature.description)}
                                        </p>

                                        <Separator className="bg-border/40" />

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{t('docs.howToUse')}</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {feature.steps.map((step, sIdx) => (
                                                    <div key={sIdx} className="relative group/step p-5 rounded-2xl border border-border/60 bg-muted/5 hover:border-primary/40 hover:bg-background hover:shadow-xl transition-all duration-500">
                                                        <div className="flex items-start gap-4">
                                                            <span className="text-[10px] font-bold bg-muted/50 text-muted-foreground w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border group-hover/step:bg-primary group-hover/step:text-primary-foreground group-hover/step:border-primary transition-all">
                                                                {sIdx + 1}
                                                            </span>
                                                            <p className="text-[13px] leading-relaxed font-medium text-muted-foreground group-hover/step:text-foreground transition-colors pt-0.5">
                                                                {t(step)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>

                                    <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
                                        <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                            Arkan Intelligence Suite • Logic Node Stable
                                        </p>
                                        <div className="flex items-center gap-2 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span className="text-[8px] font-bold uppercase tracking-tighter">Verified Protocol</span>
                                        </div>
                                    </footer>
                                </Card>
                            </div>
                        ))}
                    </main>
                </div>

                <footer className="mt-32 pt-12 border-t border-border/40 text-center space-y-4">
                    <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.4em]">
                        Arkan Knowledge Base • V1.0 Stable
                    </p>
                </footer>
            </div>
        </div>
    );
}
