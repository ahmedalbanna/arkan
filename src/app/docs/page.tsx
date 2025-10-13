
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedContainer, StaggeredAnimation } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { Bell, BookCheck, BookOpen, BrainCircuit, FileQuestion, FileSpreadsheet, FileText, GitGraph, Laptop, Palette, Presentation, Search, ShieldCheck, Users } from 'lucide-react';

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

export default function DocsPage() {
    const { t } = useLocalization();

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 container mx-auto max-w-7xl px-4 py-12">
                {/* Header */}
                <div className="text-center mb-16">
                    <AnimatedContainer animation="fade-in-down" delay={200}>
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-glow">
                                <BookOpen className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-headline font-bold bg-gradient-to-r from-blue-500 via-primary to-purple-500 bg-clip-text text-transparent">
                            {t('docs.pageTitle')}
                        </h1>
                        <p className="text-lg text-muted-foreground mt-2">
                            {t('docs.pageSubtitle')}
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Search className="h-3 w-3" />
                                Interactive Guide
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                                <BrainCircuit className="h-3 w-3" />
                                AI-Powered
                            </Badge>
                        </div>
                    </AnimatedContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                    {/* Navigation Sidebar */}

                    <aside className="md:col-span-3">

                        <nav className="sticky top-24">
                            <AnimatedContainer animation="fade-in-left" delay={400}>
                                <Card variant="glass" className="backdrop-blur-md shadow-soft">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-headline flex items-center gap-2">
                                            <BrainCircuit className="h-5 w-5 text-primary" />
                                            {t('docs.navigationTitle')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ul className="space-y-1 p-4">
                                            {features.map((feature, index) => (
                                                <li key={feature.id}>
                                                    <a
                                                        href={`#${feature.id}`}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                                                    >
                                                        <feature.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                                        <span className="text-sm font-medium">{t(feature.title)}</span>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </AnimatedContainer>
                        </nav>

                    </aside>


                    {/* Main Content */}
                    <main className="md:col-span-9 space-y-8">
                        <AnimatedContainer animation="fade-in-up" delay={600}>
                            <StaggeredAnimation animation="fade-in-up" staggerDelay={100}>
                                {features.map((feature) => (
                                    <Card
                                        id={feature.id}
                                        key={feature.id}
                                        variant="glass"
                                        className="scroll-mt-24 backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-300"
                                    >
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                                                    <feature.icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <CardTitle className="text-2xl font-headline">
                                                        {t(feature.title)}
                                                    </CardTitle>
                                                    <p className="text-muted-foreground mt-1">
                                                        {t(feature.description)}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    <BrainCircuit className="h-3 w-3" />
                                                    AI-Powered
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Accordion type="single" collapsible className="w-full">
                                                <AccordionItem value="how-to-use" className="border-t">
                                                    <AccordionTrigger className="font-semibold text-left py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <BookCheck className="h-4 w-4 text-primary" />
                                                            {t('docs.howToUse')}
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="pt-4">
                                                            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                                                                {feature.steps.map((step, index) => (
                                                                    <li key={index} className="flex items-start gap-2">
                                                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold mt-0.5">
                                                                            {index + 1}
                                                                        </span>
                                                                        <span>{t(step)}</span>
                                                                    </li>
                                                                ))}
                                                            </ol>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </CardContent>
                                    </Card>
                                ))}
                            </StaggeredAnimation>
                        </AnimatedContainer>
                    </main>
                </div>
            </div>
        </div>
    );
}
