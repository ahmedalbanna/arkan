
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BrainCircuit, FileSpreadsheet, GitGraph, Laptop, Presentation, FileQuestion, BookCheck, FileText, ShieldCheck, Users, Workflow, Bell } from 'lucide-react';
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
      title: 'Team Management',
      icon: Users,
      description: 'Collaborate with others by creating teams, inviting members, and sharing projects.',
      steps: [
          "Navigate to 'Manage Team' from your user profile dropdown.",
          "Create a new team by giving it a name.",
          "Invite members to your team using their email address.",
          "Team projects will appear alongside your personal projects on the 'My Projects' page.",
      ],
  },
  {
      id: 'design-studio',
      title: 'Design Studio',
      icon: Laptop,
      description: 'Customize the visual appearance of your exported documents using a live template editor.',
      steps: [
          "Click on the 'Design' link in the main header.",
          "Use the controls in the left panel to change fonts, colors, and other styles.",
          "The live preview on the right will instantly update to show your changes.",
      ],
  },
  {
    id: 'push-notifications',
    title: 'Push Notifications',
    icon: Bell,
    description: 'Implement push notifications for task reminders, feedback requests, or marketing updates.',
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
        <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="text-center mb-16 animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
                    <BrainCircuit className="w-10 h-10" />
                    {t('docs.pageTitle')}
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                    {t('docs.pageSubtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                <aside className="md:col-span-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <nav className="sticky top-24">
                        <h2 className="text-lg font-semibold font-headline mb-4 px-2">{t('docs.navigationTitle')}</h2>
                        <ul className="space-y-1">
                            {features.map(feature => (
                                <li key={feature.id}>
                                    <a href={`#${feature.id}`} className="flex items-center gap-3 px-2 py-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-primary transition-colors">
                                        <feature.icon className="h-4 w-4" />
                                        <span>{t(feature.title)}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                <main className="md:col-span-9 space-y-12">
                    {features.map((feature, index) => (
                        <Card id={feature.id} key={feature.id} className="scroll-mt-24 animate-fade-in-up transition-all hover:shadow-lg" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl font-headline">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                    {t(feature.title)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-6">{t(feature.description)}</p>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="how-to-use" className="border-t">
                                        <AccordionTrigger className="font-semibold text-left py-3 hover:no-underline">{t('docs.howToUse')}</AccordionTrigger>
                                        <AccordionContent>
                                            <ol className="list-decimal list-inside space-y-2 mt-2 text-muted-foreground">
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
