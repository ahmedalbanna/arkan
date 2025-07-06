'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateReportItem, type ReportState, type SectionName } from '@/app/generate-report/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, BookText, Library, TestTube2, Waypoints, Code, Flag, BookMarked, FileText, GitGraph } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Image from 'next/image';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import ReactMarkdown from 'react-markdown';
import { useHistory } from '@/hooks/use-history';
import { useAgents } from '@/hooks/use-agents';
import type { Agent } from '@/lib/agents';
import { type TemplateKey, templates } from '@/lib/docx-styles';
import { exportReportAsDocx } from '@/lib/docx-exporter';
import { DiagramTypeSchema, type DiagramType } from '@/ai/schemas';

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

const diagramConfig: { [key in DiagramType]: { title: string; agentId: string; } } = {
    useCase: { title: "مخطط حالة الاستخدام", agentId: "generate-use-case-diagram" },
    class: { title: "مخطط الأصناف", agentId: "generate-class-diagram" },
    sequence: { title: "مخطط التسلسل", agentId: "generate-sequence-diagram" },
    activity: { title: "مخطط النشاط", agentId: "generate-activity-diagram" },
    component: { title: "مخطط المكونات", agentId: "generate-component-diagram" },
    archimate: { title: "مخطط ArchiMate", agentId: "generate-archimate-diagram" },
};

function GenerateItemButton({ itemKey, title, agent }: { itemKey: string; title: string; agent?: Agent }) {
    const { pending, data } = useFormStatus();
    const isGeneratingThis = pending && data?.get('itemToGenerate') === itemKey;

    return (
        <Button
            type="submit"
            name="itemToGenerate"
            value={itemKey}
            disabled={pending || !agent?.isEnabled}
            className="font-headline"
            title={!agent?.isEnabled ? 'This agent is disabled' : title}
        >
            {isGeneratingThis ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="ml-2 h-4 w-4" />
            )}
            {title}
        </Button>
    );
}

export default function ReportGenerator() {
    const initialState: ReportState = { sections: {}, diagrams: {} };
    const [state, formAction] = useActionState(handleGenerateReportItem, initialState);
    const [proposalJson, setProposalJson] = useState('');
    const { addHistoryEntry } = useHistory();
    const { agents } = useAgents();

    const hasContent = Object.values(state.sections).some(s => !!s) || Object.values(state.diagrams || {}).some(d => !!d);
    
    const orderedSections = Object.keys(sectionConfig) as SectionName[];
    const reportAgents = orderedSections.map(key => agents.find(a => a.id === sectionConfig[key].agentId));
    
    const orderedDiagrams = DiagramTypeSchema.options;
    const diagramAgents = orderedDiagrams.map(key => agents.find(a => a.id === diagramConfig[key].agentId));

    useEffect(() => {
        if (!state.lastGenerated) return;

        let proposalTitle = 'تقرير مشروع';
        try {
            const parsed = JSON.parse(proposalJson);
            if (parsed && parsed.title) {
                proposalTitle = parsed.title;
            }
        } catch (e) { /* ignore */ }

        if (sectionConfig[state.lastGenerated as SectionName]) {
            const section = state.lastGenerated as SectionName;
            addHistoryEntry({
                type: 'report',
                title: `قسم تقرير: ${sectionConfig[section].title}`,
                proposalTitle,
                section: section,
                content: state.sections[section]!,
            });
        } else if (diagramConfig[state.lastGenerated as DiagramType]) {
            const diagram = state.lastGenerated as DiagramType;
            const diagramData = state.diagrams?.[diagram];
            if(diagramData) {
                addHistoryEntry({
                    type: 'diagram',
                    title: `مخطط: ${diagramConfig[diagram].title}`,
                    diagramType: diagram,
                    plantUmlCode: diagramData.plantUmlCode,
                    imageUrl: diagramData.imageUrl,
                    proposalTitle: proposalTitle,
                });
            }
        }
    }, [state.lastGenerated, state.sections, state.diagrams, addHistoryEntry, proposalJson]);

    const handleExportDOCX = async () => {
        if (!hasContent) return;
        let proposalTitle = 'Project Report';
        try {
            const parsed = JSON.parse(proposalJson);
            if (parsed && parsed.title) {
                proposalTitle = parsed.title;
            }
        } catch (e) { /* ignore */ }
        
        const templateKey = (localStorage.getItem('arkan-docx-template') as TemplateKey) || 'modern';
        const template = templates[templateKey] || templates.modern;
        await exportReportAsDocx(state.sections, state.diagrams || {}, proposalTitle, template.styles);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 sm:gap-2 lg:gap-4">
            <div className="md:col-span-1">
                <form action={formAction}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex leading-relaxed">مقترح المشروع (JSON)</CardTitle>
                            <CardDescription>الصق هنا محتوى مقترح المشروع الكامل بصيغة JSON.</CardDescription>
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
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="font-headline">أدوات التوليد</CardTitle>
                            <CardDescription>اختر قسمًا أو مخططًا لتوليده. يمكنك تعديل موجه الأوامر (prompt) لكل عنصر.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="multiple" className="w-full space-y-1">
                                {orderedSections.map((key, index) => {
                                    const agent = reportAgents[index];
                                    if (!agent) return null;
                                    const { title, icon: Icon } = sectionConfig[key];
                                    return (
                                        <AccordionItem value={key} key={key}>
                                            <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" /> {title}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4 p-4">
                                                <Tabs defaultValue="prompt" className="w-full">
                                                    <TabsList className="grid w-full grid-cols-2">
                                                        <TabsTrigger value="prompt">تعديل الموجه</TabsTrigger>
                                                        <TabsTrigger value="controls">التحكم بالمخرجات</TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent value="prompt" className="pt-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`prompt-${key}`} className="text-xs font-semibold text-muted-foreground">موجه الأوامر (Prompt)</Label>
                                                            <Textarea id={`prompt-${key}`} name={`prompt_${key}`} defaultValue={agent.prompt} rows={10} className="font-mono text-sm" />
                                                        </div>
                                                    </TabsContent>
                                                    <TabsContent value="controls" className="pt-4">
                                                        <div className="space-y-6">
                                                            <div className="space-y-3">
                                                                <Label htmlFor={`formality-${key}`}>الرسمية (Formality)</Label>
                                                                <Slider id={`formality-${key}`} name={`formality_${key}`} defaultValue={[50]} max={100} step={1} />
                                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                                    <span>غير رسمي</span>
                                                                    <span>متوازن</span>
                                                                    <span>رسمي جداً</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`tone-${key}`}>النبرة (Tone)</Label>
                                                                <Select name={`tone_${key}`} defaultValue="professional">
                                                                    <SelectTrigger id={`tone-${key}`}>
                                                                        <SelectValue placeholder="اختر نبرة" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="professional">احترافي</SelectItem>
                                                                        <SelectItem value="academic">أكاديمي</SelectItem>
                                                                        <SelectItem value="casual">غير رسمي</SelectItem>
                                                                        <SelectItem value="persuasive">مقنع</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                             <div className="space-y-2">
                                                                <Label htmlFor={`wordCount-${key}`}>عدد الكلمات (تقريبي)</Label>
                                                                <Input id={`wordCount-${key}`} name={`wordCount_${key}`} type="number" placeholder="مثال: 300" />
                                                            </div>
                                                        </div>
                                                    </TabsContent>
                                                </Tabs>
                                                <GenerateItemButton itemKey={key} title={`توليد ${title}`} agent={agent} />
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                                {orderedDiagrams.map((key, index) => {
                                    const agent = diagramAgents[index];
                                    if (!agent) return null;
                                    const { title } = diagramConfig[key];
                                    return (
                                        <AccordionItem value={key} key={key}>
                                            <AccordionTrigger className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:no-underline">
                                                <div className="flex items-center gap-2">
                                                    <GitGraph className="h-4 w-4" /> {title}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4 p-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`prompt-${key}`} className="text-xs font-semibold text-muted-foreground">موجه الأوامر (Prompt)</Label>
                                                    <Textarea id={`prompt-${key}`} name={`prompt_${key}`} defaultValue={agent.prompt} rows={10} className="font-mono text-sm" />
                                                </div>
                                                <GenerateItemButton itemKey={key} title={`توليد ${title}`} agent={agent} />
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </CardContent>
                    </Card>
                </form>
            </div>
            <div className="md:col-span-2">
                 <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="font-headline">تصدير التقرير</CardTitle>
                        <CardDescription>تصدير الأقسام التي تم إنشاؤها إلى ملف DOCX.</CardDescription>
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
                           تم توليد "{sectionConfig[state.lastGenerated as SectionName]?.title || diagramConfig[state.lastGenerated as DiagramType]?.title}". يمكنك عرضه أدناه.
                        </AlertDescription>
                    </Alert>
                )}
                 <Accordion type="multiple" className="w-full space-y-4">
                    {orderedSections.map((key) => {
                        const content = state.sections[key];
                        if (!content) return null;
                        const { title, icon: Icon } = sectionConfig[key];
                        return (
                            <AccordionItem value={title} key={key}>
                                <AccordionTrigger className="font-headline text-xl"><Icon className="ml-2 h-5 w-5 text-primary" /> {title}</AccordionTrigger>
                                <AccordionContent className="prose dark:prose-invert max-w-none p-4 text-muted-foreground">
                                   <ReactMarkdown>{content}</ReactMarkdown>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                    {orderedDiagrams.map((key) => {
                        const diagramData = state.diagrams?.[key];
                        if (!diagramData) return null;
                        const { title } = diagramConfig[key];
                        return (
                           <AccordionItem value={title} key={key}>
                               <AccordionTrigger className="font-headline text-xl"><GitGraph className="ml-2 h-5 w-5 text-primary" /> {title}</AccordionTrigger>
                               <AccordionContent className="space-y-4 p-4">
                                   <Image 
                                       src={diagramData.imageUrl} 
                                       alt={`Rendered ${title}`}
                                       width={800}
                                       height={600}
                                       className="w-full h-auto object-contain rounded-md border bg-white p-2"
                                   />
                                   <Textarea
                                       readOnly
                                       value={diagramData.plantUmlCode}
                                       rows={10}
                                       className="bg-muted p-4 rounded-md text-sm text-left font-mono"
                                       dir="ltr"
                                   />
                               </AccordionContent>
                           </AccordionItem>
                        )
                    })}
                </Accordion>
            </div>
        </div>
    );
}
