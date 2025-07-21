
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BrainCircuit, FileSpreadsheet, GitGraph, Laptop, Presentation, FileQuestion, BookCheck, PencilLine, FileText, CheckCircle, ShieldCheck, Users } from 'lucide-react';
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
    id: 'exam-solver',
    title: 'docs.examSolver.title',
    icon: FileQuestion,
    description: 'docs.examSolver.description',
    steps: [
        'docs.examSolver.step1',
        'docs.examSolver.step2',
        'docs.examSolver.step3',
    ],
  },
  {
    id: 'homework-solver',
    title: 'docs.homeworkSolver.title',
    icon: BookCheck,
    description: 'docs.homeworkSolver.description',
    steps: [
        'docs.homeworkSolver.step1',
        'docs.homeworkSolver.step2',
        'docs.homeworkSolver.step3',
    ],
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
        <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
                    <BrainCircuit className="w-10 h-10" />
                    {t('docs.pageTitle')}
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                    {t('docs.pageSubtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                <aside className="md:col-span-3">
                    <nav className="sticky top-24">
                        <h2 className="text-lg font-semibold font-headline mb-4">{t('docs.navigationTitle')}</h2>
                        <ul className="space-y-2">
                            {features.map(feature => (
                                <li key={feature.id}>
                                    <a href={`#${feature.id}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                                        <feature.icon className="h-4 w-4" />
                                        {t(feature.title)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                <main className="md:col-span-9 space-y-12">
                    {features.map(feature => (
                        <Card id={feature.id} key={feature.id} className="scroll-mt-24">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl font-headline">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                    {t(feature.title)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-6">{t(feature.description)}</p>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="how-to-use">
                                        <AccordionTrigger className="font-semibold">{t('docs.howToUse')}</AccordionTrigger>
                                        <AccordionContent>
                                            <ol className="list-decimal list-inside space-y-2 mt-2">
                                                {feature.steps.map((step, index) => (
                                                    <li key={index}>{t(step)}</li>
                                                ))}
                                            </ol>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    ))}
                </main>
            </div>
        </div>
    );
}
