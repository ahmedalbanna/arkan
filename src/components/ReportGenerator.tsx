'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateSection, type ReportState, type SectionName } from '@/app/generate-report/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, BookText, Library, TestTube2, Waypoints, Code, Flag, BookMarked, FileDown, FileText } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

import ReactMarkdown from 'react-markdown';
import { useHistory } from '@/hooks/use-history';
import { useAgents } from '@/hooks/use-agents';
import type { Agent } from '@/lib/agents';
import { type TemplateKey, templates } from '@/lib/docx-styles';
import { exportReportAsDocx } from '@/lib/docx-exporter';


const sectionConfig: { [key in SectionName]: { title: string; icon: React.ElementType, agentId: string } } = {
    introduction: { title: "المقدمة", icon: BookMarked, agentId: "generate-introduction" },
    literatureReview: { title: "مراجعة الأدبيات", icon: Library, agentId: "generate-literature-review" },
    systemAnalysis: { title: "تحليل النظام", icon: Waypoints, agentId: "generate-system-analysis" },
    designStrategy: { title: "استراتيجية التصميم", icon: BookText, agentId: "generate-design-strategy" },
    systemDesign: { title: "تصميم النظام", icon: Code, agentId: "generate-system-design" },
    systemProgramming: { title: "برمجة النظام", icon: Code, agentId: "generate-system-programming" },
    systemTesting: { title: "اختبار النظام", icon: TestTube2, agentId: "generate-system-testing" },
    conclusion: { title: "الخاتمة", icon: Flag, agentId: "generate-conclusion" },
};


function GenerateButton({ section, agent }: { section: SectionName, agent?: Agent }) {
    const { pending, data } = useFormStatus();
    const isGeneratingThis = pending && data?.get('sectionToGenerate') === section;

    return (
        <Button
            type="submit"
            name="sectionToGenerate"
            value={section}
            disabled={pending || !agent?.isEnabled}
            variant="secondary"
            className="w-full justify-start"
            title={!agent?.isEnabled ? 'This agent is disabled' : `Generate ${sectionConfig[section].title}`}
        >
            {isGeneratingThis ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="ml-2 h-4 w-4" />
            )}
            توليد قسم: {sectionConfig[section].title}
        </Button>
    );
}

function ReportSection({ title, content, icon: Icon }: { title: string; content?: string; icon: React.ElementType }) {
    if (!content) return null;

    return (
        <AccordionItem value={title}>
            <AccordionTrigger className="font-headline text-xl">
                <Icon className="ml-2 h-5 w-5 text-primary" /> {title}
            </AccordionTrigger>
            <AccordionContent className="prose dark:prose-invert max-w-none p-4 text-muted-foreground">
               <ReactMarkdown>{content}</ReactMarkdown>
            </AccordionContent>
        </AccordionItem>
    );
}

export default function ReportGenerator() {
    const initialState: ReportState = { sections: {} };
    const [state, formAction] = useActionState(handleGenerateSection, initialState);
    const [proposalJson, setProposalJson] = useState('');
    const { addHistoryEntry } = useHistory();
    const { agents } = useAgents();

    const hasContent = Object.values(state.sections).some(s => !!s);
    const orderedSections = Object.keys(sectionConfig) as SectionName[];
    const reportAgents = orderedSections.map(key => agents.find(a => a.id === sectionConfig[key].agentId));


    useEffect(() => {
        if (state.lastGenerated && state.sections[state.lastGenerated]) {
            let proposalTitle = 'تقرير مشروع';
            try {
                const parsed = JSON.parse(proposalJson);
                if (parsed && parsed.title) {
                    proposalTitle = parsed.title;
                }
            } catch (e) {
                // Ignore parsing errors
            }

            addHistoryEntry({
                type: 'report',
                title: `قسم تقرير: ${sectionConfig[state.lastGenerated].title}`,
                proposalTitle,
                section: state.lastGenerated,
                content: state.sections[state.lastGenerated]!,
            });
        }
    }, [state.lastGenerated, state.sections, addHistoryEntry, proposalJson]);

    const handleExportDOCX = async () => {
        if (!hasContent) return;

        let proposalTitle = 'Project Report';
        try {
            const parsed = JSON.parse(proposalJson);
            if (parsed && parsed.title) {
                proposalTitle = parsed.title;
            }
        } catch (e) {
            // ignore
        }
        
        const templateKey = (localStorage.getItem('arkan-docx-template') as TemplateKey) || 'modern';
        const template = templates[templateKey];
        if (template) {
            await exportReportAsDocx(state.sections, proposalTitle, template.styles);
        } else {
            await exportReportAsDocx(state.sections, proposalTitle, templates.modern.styles);
        }
    };


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 sm:gap-2 lg:gap-4">
            <div className="md:col-span-1">
                <form action={formAction}>
                    {reportAgents.map((agent, index) => {
                        const key = orderedSections[index];
                        return agent ? <input type="hidden" name={`prompt_${key}`} value={agent.prompt} key={key} /> : null
                    })}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex leading-relaxed">مقترح المشروع (JSON)</CardTitle>
                            <CardDescription>
                                الصق هنا محتوى مقترح المشروع الكامل بصيغة JSON.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="proposalJson"
                                placeholder='{ "title": "...", "objective": "...", ... }'
                                rows={15}
                                required
                                onChange={(e) => setProposalJson(e.target.value)}
                            />
                            {state?.error && (
                                <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2 items-start">
                           {orderedSections.map((key, index) => (
                               <GenerateButton key={key} section={key} agent={reportAgents[index]} />
                           ))}
                        </CardFooter>
                    </Card>
                </form>
            </div>
            <div className="md:col-span-2">
                 <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="font-headline">تصدير التقرير</CardTitle>
                        <CardDescription>
                            تصدير الأقسام التي تم إنشاؤها إلى ملف DOCX.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4">
                        <Button onClick={handleExportDOCX} disabled={!hasContent} className="w-full sm:w-auto font-headline">
                            <FileText className="ml-2 h-4 w-4" />
                            تصدير كملف DOCX
                        </Button>
                    </CardContent>
                </Card>

                 {state?.lastGenerated && !state.error && (
                    <Alert className="mb-6">
                        <Sparkles className="h-4 w-4" />
                        <AlertTitle className="font-headline">تم التوليد بنجاح!</AlertTitle>
                        <AlertDescription>
                            تم توليد قسم "{sectionConfig[state.lastGenerated].title}". يمكنك عرضه أدناه.
                        </AlertDescription>
                    </Alert>
                )}
                 <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={state.lastGenerated ? sectionConfig[state.lastGenerated].title : undefined}>
                    {orderedSections.map((key) => {
                        const { title, icon } = sectionConfig[key];
                        return (
                            <ReportSection
                                key={key}
                                title={title}
                                icon={icon}
                                content={state.sections[key as SectionName]}
                            />
                        )
                    })}
                </Accordion>
            </div>
        </div>
    );
}
