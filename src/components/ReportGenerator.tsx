'use client';

import { useTransition, useState, useEffect } from 'react';
import { handleGenerateReportItem, type ReportState } from '@/app/generate-report/actions';
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
import ProposalViewer from './ProposalViewer';

import ReactMarkdown from 'react-markdown';
import { useHistory } from '@/hooks/use-history';
import { useAgents } from '@/hooks/use-agents';
import { type Agent } from '@/lib/agents';
import { type TemplateKey, templates } from '@/lib/docx-styles';
import { exportReportAsDocx, exportProposalAsDocx } from '@/lib/docx-exporter';
import { DiagramTypeSchema, type DiagramType, type ProjectProposal, SectionNameSchema, type SectionName, ProjectProposalSchema } from '@/ai/schemas';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { add, format } from 'date-fns';


const sectionConfig: { [key in SectionName]: { title: string; icon: React.ElementType, agentId: string } } = {
    introduction: { title: "Introduction", icon: BookMarked, agentId: "generate-introduction" },
    literatureReview: { title: "Literature Review", icon: Library, agentId: "generate-literature-review" },
    systemAnalysis: { title: "System Analysis", icon: Waypoints, agentId: "generate-system-analysis" },
    designStrategy: { title: "Design Strategy", icon: BookText, agentId: "generate-design-strategy" },
    systemDesign: { title: "System Design", icon: Code, agentId: "generate-system-design" },
    systemProgramming: { title: "System Programming", icon: Code, agentId: "generate-system-programming" },
    systemTesting: { title: "System Testing", icon: TestTube2, agentId: "generate-system-testing" },
    conclusion: { title: "Conclusion", icon: Flag, agentId: "generate-conclusion" },
};

const diagramConfig: { [key in DiagramType]: { title: string; agentId: string; } } = {
    useCase: { title: "Use Case Diagram", agentId: "generate-use-case-diagram" },
    class: { title: "Class Diagram", agentId: "generate-class-diagram" },
    sequence: { title: "Sequence Diagram", agentId: "generate-sequence-diagram" },
    activity: { title: "Activity Diagram", agentId: "generate-activity-diagram" },
    component: { title: "Component Diagram", agentId: "generate-component-diagram" },
    archimate: { title: "ArchiMate Diagram", agentId: "generate-archimate-diagram" },
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="mr-2 h-4 w-4" />
            )}
            {title}
        </Button>
    );
}

const orderedSections = SectionNameSchema.options;
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
    return "No additional instructions.";
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

function set(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    // If it's the last key, set the value
    if (i === keys.length - 1) {
      current[key] = value;
    } else {
      // If the path doesn't exist, create it
      if (!current[key]) {
        // Check if next key is a number to create an array or an object
        current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
      }
      current = current[key];
    }
  }
}

export default function ReportGenerator() {
    const initialState: ReportState = { sections: {}, diagrams: {} };
    const [isPending, startTransition] = useTransition();
    const [state, setState] = useState<ReportState>(initialState);
    const [generatingItem, setGeneratingItem] = useState<string | null>(null);

    const [projectIdea, setProjectIdea] = useState('');
    const [proposalJson, setProposalJson] = useState('');
    const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
    const [proposalError, setProposalError] = useState<string | undefined>();
    const [proposal, setProposal] = useState<ProjectProposal | null>(null);
    
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
                const savedProposalJson = parsed.proposalJson || '';
                setProposalJson(savedProposalJson);
                if (savedProposalJson) {
                    try {
                        const parsedProposal = ProjectProposalSchema.parse(JSON.parse(savedProposalJson));
                        setProposal(parsedProposal);
                    } catch {
                        setProposal(null);
                    }
                }
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
            setProposal(result);
            addHistoryEntry({
                type: 'proposal',
                title: `Project Proposal: ${result.title}`,
                proposal: result,
            });
            setState({ sections: {}, diagrams: {} });
        } catch (e) {
            console.error(e);
            setProposalError('An error occurred while generating the proposal. Please try again.');
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
    
    const handleProposalUpdate = (path: string, value: any) => {
        if (!proposal) return;
    
        const newProposal = JSON.parse(JSON.stringify(proposal));
        
        set(newProposal, path, value);
    
        if (path.startsWith('budget.breakdown') || path === 'budget.currency') {
            const total = newProposal.budget.breakdown.reduce((acc: number, item: { cost: number }) => acc + Number(item.cost || 0), 0);
            newProposal.budget.totalAmount = total;
        }
    
        if (path.startsWith('timeline')) {
            try {
                let currentDate = new Date(newProposal.timeline.startDate);
                if (isNaN(currentDate.getTime())) { // Check for invalid date
                   currentDate = new Date(); // fallback to today
                }

                for (const phase of newProposal.timeline.phases) {
                    const durationWeeks = Number(phase.durationWeeks || 0);
                    currentDate = add(currentDate, { weeks: durationWeeks });
                }
                newProposal.timeline.endDate = format(currentDate, 'yyyy-MM-dd');
            } catch (error) {
                console.error("Error calculating timeline:", error);
                // Keep the old end date if calculation fails
            }
        }
    
        setProposal(newProposal);
        setProposalJson(JSON.stringify(newProposal, null, 2));
    };

    const handleNewSession = () => {
        localStorage.removeItem(STORAGE_KEY);
        setState({ sections: {}, diagrams: {} });
        setProposalJson('');
        setProjectIdea('');
        setProposal(null);
        setControlState(getInitialControlState());
    };

    useEffect(() => {
        if (!state.lastGenerated) return;

        let proposalTitle = 'Project Report';
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
                title: `Report Section: ${sectionConfig[section].title}`,
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
                    title: `Diagram: ${diagramConfig[diagram].title}`,
                    diagramType: diagram,
                    plantUmlCode: diagramData.plantUmlCode,
                    imageUrl: diagramData.imageUrl,
                    proposalTitle: proposalTitle,
                });
            }
        }
    }, [state.lastGenerated, state.sections, state.diagrams, addHistoryEntry, proposalJson]);

    const handleExportReportDOCX = async () => {
        if (!hasContent) return;
        let proposalTitle = 'Project Report';
        if (proposal && proposal.title) {
            proposalTitle = proposal.title;
        }
        
        const templateKey = (localStorage.getItem('arkan-docx-template') as TemplateKey) || 'modern';
        const template = templates[templateKey] || templates.modern;
        await exportReportAsDocx(state.sections, state.diagrams || {}, proposalTitle, template.styles);
    };

    const handleExportProposalDOCX = async () => {
        if (!proposal) return;
        const templateKey = (localStorage.getItem('arkan-docx-template') as TemplateKey) || 'modern';
        const template = templates[templateKey] || templates.modern;
        await exportProposalAsDocx(proposal, template.styles);
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
                    <CardTitle className="font-headline text-xl">Step 1: Generate Project Proposal</CardTitle>
                    <CardDescription>
                        Write a brief description of your project idea. The clearer the idea, the better the proposal.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="e.g., A customer relationship management (CRM) system to improve sales efficiency and customer service."
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
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generate Proposal
                    </Button>
                </CardFooter>
            </Card>

            <div className={`grid grid-cols-1 md:grid-cols-5 sm:gap-2 lg:gap-4 ${!proposalJson ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="md:col-span-2">
                    <form action={handleSubmit}>
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline flex leading-relaxed">Step 2: Review Proposal (JSON)</CardTitle>
                                    <CardDescription>This is the raw input for the AI agents. You can modify it if needed.</CardDescription>
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
                                        className="font-mono text-xs"
                                        dir="ltr"
                                    />
                                    {state?.error && !generatingItem && (
                                        <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline">Step 3: Generation Tools</CardTitle>
                                    <CardDescription>Select a section or diagram to generate. You can edit the prompt for each item.</CardDescription>
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
                                                                <TabsTrigger value="prompt">Edit Prompt</TabsTrigger>
                                                                <TabsTrigger value="controls">Control Output</TabsTrigger>
                                                            </TabsList>
                                                            <TabsContent value="prompt" className="pt-4">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor={`prompt-${key}`} className="text-xs font-semibold text-muted-foreground">Prompt</Label>
                                                                    <Textarea id={`prompt-${key}`} name={`prompt_${key}`} defaultValue={agent.prompt} rows={10} className="font-mono text-sm" />
                                                                </div>
                                                            </TabsContent>
                                                            <TabsContent value="controls" className="pt-4">
                                                                <div className="space-y-6">
                                                                    <div className="space-y-3">
                                                                        <Label htmlFor={`formality-${key}`}>Formality</Label>
                                                                        <Slider id={`formality-${key}`} name={`formality_${key}`} value={[currentControls.formality]} onValueChange={(val) => handleControlChange(key, 'formality', val[0])} max={100} step={1} />
                                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                                            <span>Informal</span>
                                                                            <span>Balanced</span>
                                                                            <span>Very Formal</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`tone-${key}`}>Tone</Label>
                                                                        <Select name={`tone_${key}`} value={currentControls.tone} onValueChange={(val) => handleControlChange(key, 'tone', val)}>
                                                                            <SelectTrigger id={`tone-${key}`}>
                                                                                <SelectValue placeholder="Select a tone" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="professional">Professional</SelectItem>
                                                                                <SelectItem value="academic">Academic</SelectItem>
                                                                                <SelectItem value="casual">Casual</SelectItem>
                                                                                <SelectItem value="persuasive">Persuasive</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`wordCount-${key}`}>Word Count (approx.)</Label>
                                                                        <Input id={`wordCount-${key}`} name={`wordCount_${key}`} type="number" placeholder="e.g., 300" value={currentControls.wordCount} onChange={(e) => handleControlChange(key, 'wordCount', e.target.value)} />
                                                                    </div>
                                                                    <div className="p-3 bg-muted/50 rounded-md text-xs text-muted-foreground space-y-1">
                                                                        <p className="font-semibold">Instruction Preview:</p>
                                                                        <pre className="whitespace-pre-wrap font-mono text-primary/80">
                                                                            {generateInstructionText(currentControls)}
                                                                        </pre>
                                                                    </div>
                                                                </div>
                                                            </TabsContent>
                                                        </Tabs>
                                                        <GenerateItemButton itemKey={key} title={`Generate ${title}`} agent={agent} isPending={isPending} generatingItem={generatingItem} />
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
                                                            <Label htmlFor={`prompt-${key}`} className="text-xs font-semibold text-muted-foreground">Prompt</Label>
                                                            <Textarea id={`prompt-${key}`} name={`prompt_${key}`} defaultValue={agent.prompt} rows={10} className="font-mono text-sm" />
                                                        </div>
                                                        <GenerateItemButton itemKey={key} title={`Generate ${title}`} agent={agent} isPending={isPending} generatingItem={generatingItem} />
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
                <div className="md:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Actions</CardTitle>
                            <CardDescription>Export your outputs or start a new session.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-4">
                            <Button onClick={handleExportProposalDOCX} disabled={!proposal || isPending} className="w-full sm:w-auto font-headline">
                                <FileText className="mr-2 h-4 w-4" />
                                Export Proposal
                            </Button>
                            <Button onClick={handleExportReportDOCX} disabled={!hasContent || isPending} className="w-full sm:w-auto font-headline">
                                <FileText className="mr-2 h-4 w-4" />
                                Export Report
                            </Button>
                            <Button onClick={handleNewSession} variant="outline" disabled={isPending} className="w-full sm:w-auto font-headline">
                                <Trash2 className="mr-2 h-4 w-4" />
                                New Session
                            </Button>
                        </CardContent>
                    </Card>

                    {state?.lastGenerated && !state.error && (
                        <Alert>
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle className="font-headline">Generation Successful!</AlertTitle>
                            <AlertDescription>
                                Successfully generated "{sectionConfig[state.lastGenerated as SectionName]?.title || diagramConfig[state.lastGenerated as DiagramType]?.title}". You can view it below.
                            </AlertDescription>
                        </Alert>
                    )}

                    {state?.error && generatingItem && (
                        <Alert variant="destructive">
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle className="font-headline">Generation Failed!</AlertTitle>
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}

                    {proposal && (
                        <div>
                            <CardTitle className="font-headline text-xl mb-4">Generated Proposal Details (Editable)</CardTitle>
                            <ProposalViewer proposal={proposal} onUpdate={handleProposalUpdate} />
                        </div>
                    )}
                    
                    <Accordion type="multiple" className="w-full space-y-4" defaultValue={orderedSections.concat(orderedDiagrams)}>
                        {orderedSections.map((key) => {
                            const content = state.sections[key];
                            if (!content) return null;
                            const { title, icon: Icon } = sectionConfig[key];
                            return (
                                <AccordionItem value={title} key={key} className="bg-background rounded-lg border">
                                    <AccordionTrigger className="font-headline text-xl p-4"><Icon className="mr-2 h-5 w-5 text-primary" /> {title}</AccordionTrigger>
                                    <AccordionContent className="prose dark:prose-invert max-w-none p-4 text-muted-foreground border-t">
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
                            <AccordionItem value={title} key={key} className="bg-background rounded-lg border">
                                <AccordionTrigger className="font-headline text-xl p-4"><GitGraph className="mr-2 h-5 w-5 text-primary" /> {title}</AccordionTrigger>
                                <AccordionContent className="space-y-4 p-4 border-t">
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
