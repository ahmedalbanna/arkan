
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { toast, useCreateAgent, useGenerateAgentConfig } from '@/hooks';
import { AgentCategory, type AgentPrompt } from '@/lib/models/agent';
import { ArrowLeft, Bot, Braces, BrainCircuit, Check, Copy, Flame, Loader2, PlusCircle, RotateCcw, SendHorizonal, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';


const suggestionChips = [
    { label: 'agentGenerator.chips.taskManager', icon: Check },
    { label: 'agentGenerator.chips.contentCreator', icon: Flame },
    { label: 'agentGenerator.chips.socialMediaPlanner', icon: Copy },
    { label: 'agentGenerator.chips.seoWriter', icon: Copy },
];

type GenerationStep = 'prompting' | 'generating' | 'reviewing';

interface GeneratedAgentData {
    name: string;
    description: string;
    instructions: string;
    guidelines: string;
    jsonStructure?: any;
}

export interface UploadedFile {
    name: string;
    type: string;
    content: string; // data URI
}

export function GenerateAgentView() {
    const router = useRouter();
    const { t } = useLocalization();
    const [step, setStep] = useState<GenerationStep>('prompting');
    const [prompt, setPrompt] = useState('');
    const [includeJsonOutput, setIncludeJsonOutput] = useState(false);
    const [contextFiles, setContextFiles] = useState<UploadedFile[]>([]);
    const [generatedData, setGeneratedData] = useState<GeneratedAgentData | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<AgentCategory>(AgentCategory.ContentGeneration);
    const createAgentMutation = useCreateAgent();

    const generateMutation = useGenerateAgentConfig();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        acceptedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUri = reader.result as string;
                setContextFiles(prev => [...prev, { name: file.name, type: file.type, content: dataUri }]);
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const removeFile = (index: number) => {
        setContextFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = () => {
        if (!prompt.trim()) {
            toast({ title: t('agentGenerator.toast.promptEmpty.title'), description: t('agentGenerator.toast.promptEmpty.description'), variant: "destructive" });
            return;
        }
        setStep('generating');
        generateMutation.mutate({ prompt, includeJsonOutput, contextFiles }, {
            onSuccess: (data) => {
                setGeneratedData(data as GeneratedAgentData);
                setStep('reviewing');
            },
            onError: (error) => {
                toast({ title: t('agentGenerator.toast.generationFailed.title'), description: error.message, variant: 'destructive' });
                setStep('prompting');
            }
        });
    };

    const handleAccept = () => {
        if (!generatedData) return;

        const generatedId = generatedData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const guidelinesArray = generatedData.guidelines.split('\n').map(line => line.replace(/^- /, '').trim()).filter(line => line);

        const agentPrompt: AgentPrompt = {
            base: generatedData.instructions,
            guidelines: guidelinesArray.map(g => ({ text: g, isDefault: true })),
        };

        if (generatedData.jsonStructure) {
            agentPrompt.jsonStructure = generatedData.jsonStructure;
        }

        const knowledgeSources = contextFiles.map(file => ({
            name: file.name,
            type: 'file' as const, // For now, all are treated as files
            content: file.content
        }));

        const agentData = {
            id: generatedId,
            name: generatedData.name,
            description: generatedData.description,
            category: selectedCategory,
            pageUrl: '/admin/chats', // Default URL for custom agents
            prompt: agentPrompt,
            knowledge: knowledgeSources,
        };

        createAgentMutation.mutate(agentData as any, {
            onSuccess: (newAgent) => {
                router.push(`/admin/manage-agents/${newAgent.id}/edit`);
            },
            onError: (error) => {
                toast({
                    title: t('agentGenerator.toast.creationFailed.title'),
                    description: t('agentGenerator.toast.creationFailed.description'),
                    variant: 'destructive',
                });
            }
        });
    };

    const handleReject = () => {
        setStep('prompting');
        setGeneratedData(null);
    };

    const handleRegenerate = () => {
        handleGenerate();
    };

    const renderPromptingView = () => (
        <div className="w-full max-w-4xl">
             <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
                        <Bot className="w-8 h-8"/>
                        {t('agentGenerator.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('agentGenerator.placeholder')}
                        className="min-h-[150px] text-lg focus-visible:ring-1 focus-visible:ring-offset-0 p-6"
                    />
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div {...getRootProps()} className="cursor-pointer">
                                <input {...getInputProps()} />
                                <Button variant="outline" type="button">
                                    <BrainCircuit className="me-2 h-4 w-4" />
                                    {t('agentGenerator.addKnowledge')}
                                </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="json-output" checked={includeJsonOutput} onCheckedChange={setIncludeJsonOutput} />
                                <Label htmlFor="json-output" className="text-xs flex items-center gap-1"><Braces className="h-4 w-4" /> {t('agentGenerator.jsonOutput')}</Label>
                            </div>
                        </div>
                         <Button variant="default" size="lg" onClick={handleGenerate}>
                            <SendHorizonal className="h-5 w-5" />
                        </Button>
                    </div>

                     {contextFiles.length > 0 && (
                        <div className="mt-4 p-4 bg-muted rounded-lg border">
                            <h4 className="text-sm font-semibold mb-2">{t('agentGenerator.contextFiles')} ({contextFiles.length})</h4>
                            <ScrollArea className="h-24">
                                <div className="space-y-1">
                                    {contextFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-1 text-xs bg-background rounded">
                                            <span className="truncate">{file.name}</span>
                                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeFile(index)}>
                                                <XCircle className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </CardContent>
             </Card>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestionChips.map(({ label, icon: Icon }) => (
                    <Button
                        key={label}
                        variant="secondary"
                        onClick={() => setPrompt(prev => prev ? `${prev}\n- ${t(label)}` : t(label))}
                    >
                        <Icon className="me-2 h-4 w-4" />
                        {t(label)}
                    </Button>
                ))}
            </div>
        </div>
    );

    const renderGeneratingView = () => (
        <div className="w-full max-w-3xl text-center">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-2">
                {t('agentGenerator.title')}
            </h1>
            <p className="text-muted-foreground mb-8">{t('agentGenerator.generatingSubtitle')}</p>
            <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
        </div>
    );

    const renderReviewView = () => (
        <div className="w-full max-w-3xl">
            <Button variant="ghost" onClick={() => setStep('prompting')} className="absolute top-8 left-8">
                <ArrowLeft className="me-2 h-4 w-4" />
                {t('agentGenerator.backToPrompt')}
            </Button>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
                    {t('agentGenerator.reviewTitle')}
                </h1>
            </div>
            <Card className="space-y-6">
                <CardHeader>
                    <CardTitle>Original Prompt</CardTitle>
                    <CardDescription className="border p-4 rounded-md text-foreground">
                        {prompt}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-center">
                        <div {...getRootProps()} className="cursor-pointer">
                            <input {...getInputProps()} />
                            <Button variant="outline" type="button">
                                <PlusCircle className="me-2 h-4 w-4" />
                                {t('agentGenerator.addKnowledge')}
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="agent-name" className="text-xs uppercase text-muted-foreground">{t('agentGenerator.review.name')}</Label>
                            <Input id="agent-name" value={generatedData?.name || ''} onChange={(e) => setGeneratedData(prev => prev ? { ...prev, name: e.target.value } : null)} className="h-12" />
                        </div>
                        <div>
                            <Label htmlFor="agent-category" className="text-xs uppercase text-muted-foreground">{t('agentGenerator.review.category')}</Label>
                            <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as AgentCategory)}>
                                <SelectTrigger id="agent-category" className="h-12"><SelectValue placeholder={selectedCategory} /></SelectTrigger>
                                <SelectContent>
                                    {Object.values(AgentCategory).map(cat => <SelectItem key={cat} value={cat}>{cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="agent-description" className="text-xs uppercase text-muted-foreground">{t('agentGenerator.review.description')}</Label>
                        <Textarea id="agent-description" value={generatedData?.description || ''} onChange={(e) => setGeneratedData(prev => prev ? { ...prev, description: e.target.value } : null)} className="min-h-[70px]" />
                    </div>
                    <div>
                        <Label htmlFor="agent-instructions" className="text-xs uppercase text-muted-foreground">{t('agentGenerator.review.instructions')}</Label>
                        <Textarea id="agent-instructions" value={generatedData?.instructions || ''} onChange={(e) => setGeneratedData(prev => prev ? { ...prev, instructions: e.target.value } : null)} className="min-h-[100px]" />
                    </div>
                    <div>
                        <Label htmlFor="agent-guidelines" className="text-xs uppercase text-muted-foreground">{t('agentGenerator.review.guidelines')}</Label>
                        <Textarea id="agent-guidelines" value={generatedData?.guidelines || ''} onChange={(e) => setGeneratedData(prev => prev ? { ...prev, guidelines: e.target.value } : null)} className="min-h-[100px]" />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                    <Button variant="secondary" onClick={handleAccept} disabled={createAgentMutation.isPending}>
                        {createAgentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        <span className="ml-2">{t('agentGenerator.review.acceptButton')}</span>
                    </Button>
                    <Button variant="outline" onClick={handleRegenerate} disabled={generateMutation.isPending}>
                        {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                        <span className="ml-2">{t('agentGenerator.review.regenerateButton')}</span>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center p-4 bg-background text-foreground">
            {step === 'prompting' && renderPromptingView()}
            {(step === 'generating' || generateMutation.isPending) && renderGeneratingView()}
            {step === 'reviewing' && !generateMutation.isPending && renderReviewView()}
        </div>
    );
}

    