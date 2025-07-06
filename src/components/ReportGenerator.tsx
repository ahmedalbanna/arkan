'use client';

import { useTransition, useState, useEffect } from 'react';
import { handleGenerateReportItem, type ReportState, type SectionName } from '@/app/generate-report/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, BookText, Library, TestTube2, Waypoints, Code, Flag, BookMarked, FileText, GitGraph, Trash2 } from 'lucide-react';
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
import { type Agent } from '@/lib/agents';
import { type TemplateKey, templates } from '@/lib/docx-styles';
import { exportReportAsDocx } from '@/lib/docx-exporter';
import { DiagramTypeSchema, type DiagramType, type ProjectProposal } from '@/ai/schemas';
import { generateProposal } from '@/ai/flows/generate-proposal';


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

function GenerateItemButton({ itemKey, title, agent, isPending, generatingItem }: { itemKey: string; title: string; agent?: Agent; isPending: boolean; generatingItem: string | null; }) {
    const isGeneratingThis = isPending && generatingItem === itemKey;

    return (
        <Button
            type="submit"
            name="itemToGenerate"
            value={itemKey}
            disabled={isPending || !agent?.isEnabled}
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

const orderedSections = Object.keys(sectionConfig) as SectionName[];
const orderedDiagrams = DiagramTypeSchema.options;

type ControlState = {
  formality: number;
  tone: string;
  wordCount: string;
};

const STORAGE_KEY = 'arkan-report-generator-state';

const generateInstructionText = (controls: ControlState) => {
    let instructions = [];
    if (controls.formality !== undefined) {
        const formality = controls.formality;
        let formalityDesc = "balanced";
        if (formality < 33) formalityDesc = "informal and casual";
        else if (formality > 66) formalityDesc = "highly formal and professional";
        instructions.push(`- The writing style should be ${formalityDesc}.`);
    }
    if (controls.tone && controls.tone !== "none") {
        instructions.push(`- Adopt a ${controls.tone} tone.`);
    }
    if (controls.wordCount) {
        instructions.push(`- The response should be approximately ${controls.wordCount} words long.`);
    }

    if (instructions.length > 0) {
        return `Additionally, please adhere to the following constraints for your response:\n${instructions.join('\n')}`;
    }
    return "لا توجد تعليمات إضافية.";
};

const getInitialControlState = (): Record<SectionName, ControlState> => {
    const initial: Partial<Record<SectionName, ControlState>> = {};
    orderedSections.forEach(key => {
        initial[key] = {
            formality: 50,
            tone: 'professional',
            wordCount: '300',
        };
    });
    return initial as Record<SectionName, ControlState>;
};

export default function ReportGenerator() {
    const initialState: ReportState = { sections: {}, diagrams: {} };
    const [isPending, startTransition] = useTransition();
    const [state, setState] = useState<ReportState>(initialState);
    const [generatingItem, setGeneratingItem] = useState<string | null>(null);

    const [projectIdea, setProjectIdea] = useState('');
    const [proposalJson, setProposalJson] = useState('');
    const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
    const [proposalError, setProposalError] = useState<string | undefined>();
    
    const { addHistoryEntry } = useHistory();
    const { agents, isLoaded: agentsLoaded } = useAgents();

    const [isLoaded, setIsLoaded] = useState(false);

    const [controlState, setControlState] = useState<Record<SectionName, ControlState>>(getInitialControlState);

    // Load state from local storage on mount
    useEffect(() => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const parsed = JSON.parse(savedState);
                setState({
                    sections: parsed.sections || {},
                    diagrams: parsed.diagrams || {},
                });
                setProposalJson(parsed.proposalJson || '');
                setProjectIdea(parsed.projectIdea || '');
            }
        } catch (error) {
            console.error("Failed to load state from localStorage", error);
        }
        setIsLoaded(true);
    }, []);

    // Save state to local storage on change
    useEffect(() => {
        if (!isLoaded) return;
        try {
            const dataToSave = {
                sections: state.sections,
                diagrams: state.diagrams,
                proposalJson: proposalJson,
                projectIdea: projectIdea,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (error) {
             console.error("Failed to save state to localStorage", error);
        }
    }, [state, proposalJson, projectIdea, isLoaded]);

    const handleControlChange = (section: SectionName, field: keyof ControlState, value: string | number) => {
        setControlState(prevState => ({
            ...prevState,
            [section]: {
                ...prevState[section],
                [field]: value,
            }
        }));
    };

    const hasContent = Object.values(state.sections).some(s => !!s) || Object.values(state.diagrams || {}).some(d => !!d);
    
    const proposalAgent = agents.find(a => a.id === 'generate-proposal');
    const reportAgents = orderedSections.map(key => agents.find(a => a.id === sectionConfig[key].agentId));
    const diagramAgents = orderedDiagrams.map(key => agents.find(a => a.id === diagramConfig[key].agentId));
    
    const handleGenerateProposalClick = async () => {
        if (!projectIdea || !proposalAgent) return;
        setIsGeneratingProposal(true);
        setProposalError(undefined);
        try {
            const result = await generateProposal({
                projectIdea,
                prompt: proposalAgent.prompt
            });
            setProposalJson(JSON.stringify(result, null, 2));
            addHistoryEntry({
                type: 'proposal',
                title: `مقترح مشروع: ${result.title}`,
                proposal: result,
            });
            // Clear any previous report state when generating a new proposal
            setState({ sections: {}, diagrams: {} });
        } catch (e) {
            console.error(e);
            setProposalError('حدث خطأ أثناء توليد المقترح. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsGeneratingProposal(false);
        }
    }

    const handleSubmit = (formData: FormData) => {
        const item = formData.get('itemToGenerate') as string;
        if (!item) return;

        setGeneratingItem(item);
        startTransition(async () => {
            const newState = await handleGenerateReportItem(state, formData);
            setState(newState);
            setGeneratingItem(null);
        });
    };

    const handleNewSession = () => {
        localStorage.removeItem(STORAGE_KEY);
        setState({ sections: {}, diagrams: {} });
        setProposalJson('');
        setProjectIdea('');
        setControlState(getInitialControlState());
    };

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

    if (!isLoaded || !agentsLoaded) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">الخطوة 1: توليد مقترح المشروع</CardTitle>
                    <CardDescription>
                        اكتب وصفًا موجزًا لفكرة مشروعك. كلما كانت الفكرة أوضح، كان المقترح أفضل.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="مثال: نظام لإدارة علاقات العملاء (CRM) لتحسين كفاءة المبيعات وخدمة العملاء."
                        rows={5}
                        required
                        value={projectIdea}
                        onChange={(e) => setProjectIdea(e.target.value)}
                    />
                    {proposalError && (
                        <p className="text-sm font-medium text-destructive mt-2">{proposalError}</p>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGenerateProposalClick} disabled={isGeneratingProposal || !proposalAgent?.isEnabled}>
                        {isGeneratingProposal ? (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="ml-2 h-4 w-4" />
                        )}
                        توليد المقترح
                    </Button>
                </CardFooter>
            </Card>

            <div className={`grid grid-cols-1 md:grid-cols-3 sm:gap-2 lg:gap-4 ${!proposalJson ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="md:col-span-1">
                    <form action={handleSubmit}>
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline flex leading-relaxed">الخطوة 2: مراجعة المقترح (JSON)</CardTitle>
                                    <CardDescription>الصق هنا محتوى مقترح المشروع الكامل بصيغة JSON.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        name="proposalJson"
                                        placeholder='{ "title": "...", "objective": "...", ... }'
                                        rows={15}
                                        required
                                        value={proposalJson}
                                        onChange={(e) => setProposalJson(e.target.value)}
                                        disabled={!proposalJson}
                                    />
                                    {state?.error && !generatingItem && (
                                        <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline">الخطوة 3: أدوات التوليد</CardTitle>
                                    <CardDescription>اختر قسمًا أو مخططًا لتوليده. يمكنك تعديل موجه الأوامر (prompt) لكل عنصر.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="multiple" className="w-full space-y-1">
                                        {orderedSections.map((key, index) => {
                                            const agent = reportAgents[index];
                                            if (!agent) return null;
                                            const { title, icon: Icon } = sectionConfig[key];
                                            const currentControls = controlState[key];
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
                                                                        <Slider id={`formality-${key}`} name={`formality_${key}`} value={[currentControls.formality]} onValueChange={(val) => handleControlChange(key, 'formality', val[0])} max={100} step={1} />
                                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                                            <span>غير رسمي</span>
                                                                            <span>متوازن</span>
                                                                            <span>رسمي جداً</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`tone-${key}`}>النبرة (Tone)</Label>
                                                                        <Select name={`tone_${key}`} value={currentControls.tone} onValueChange={(val) => handleControlChange(key, 'tone', val)}>
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
                                                                        <Input id={`wordCount-${key}`} name={`wordCount_${key}`} type="number" placeholder="مثال: 300" value={currentControls.wordCount} onChange={(e) => handleControlChange(key, 'wordCount', e.target.value)} />
                                                                    </div>
                                                                    <div className="p-3 bg-muted/50 rounded-md text-xs text-muted-foreground space-y-1">
                                                                        <p className="font-semibold">معاينة التعليمات التي ستُضاف للموجه:</p>
                                                                        <pre className="whitespace-pre-wrap font-mono text-primary/80">
                                                                            {generateInstructionText(currentControls)}
                                                                        </pre>
                                                                    </div>
                                                                </div>
                                                            </TabsContent>
                                                        </Tabs>
                                                        <GenerateItemButton itemKey={key} title={`توليد ${title}`} agent={agent} isPending={isPending} generatingItem={generatingItem} />
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
                                                        <GenerateItemButton itemKey={key} title={`توليد ${title}`} agent={agent} isPending={isPending} generatingItem={generatingItem} />
                                                    </AccordionContent>
                                                </AccordionItem>
                                            );
                                        })}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </div>
                <div className="md:col-span-2">
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="font-headline">الإجراءات</CardTitle>
                            <CardDescription>تصدير الأقسام التي تم إنشاؤها أو بدء جلسة جديدة.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-4">
                            <Button onClick={handleExportDOCX} disabled={!hasContent || isPending} className="w-full sm:w-auto font-headline">
                                <FileText className="ml-2 h-4 w-4" />
                                تصدير كملف DOCX
                            </Button>
                            <Button onClick={handleNewSession} variant="outline" disabled={isPending} className="w-full sm:w-auto font-headline">
                                <Trash2 className="ml-2 h-4 w-4" />
                                جلسة جديدة
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

                    {state?.error && generatingItem && (
                        <Alert className="mb-6" variant="destructive">
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle className="font-headline">فشل التوليد!</AlertTitle>
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}

                    <Accordion type="multiple" className="w-full space-y-4" defaultValue={orderedSections.concat(orderedDiagrams)}>
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
        </div>
    );
}
