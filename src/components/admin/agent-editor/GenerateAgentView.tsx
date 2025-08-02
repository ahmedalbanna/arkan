'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Bot, BrainCircuit, Check, Copy, Flame, Send, SendHorizonal, ThumbsDown, RotateCcw, X, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCreateAgent } from '@/hooks/use-agents';
import { toast } from '@/hooks/use-toast';
import { AgentCategory } from '@/lib/agents';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AgentPrompt } from '@/lib/agents';

const suggestionChips = [
    { label: 'Task Manager', icon: Check },
    { label: 'Content Creator', icon: Flame },
    { label: 'Social Media Planner', icon: Copy },
    { label: 'Blog SEO Writer', icon: Copy },
];

type GenerationStep = 'prompting' | 'generating' | 'reviewing';

interface GeneratedAgentData {
    name: string;
    instructions: string;
    guidelines: string;
}

export function GenerateAgentView() {
    const router = useRouter();
    const [step, setStep] = useState<GenerationStep>('prompting');
    const [prompt, setPrompt] = useState('');
    const [generatedData, setGeneratedData] = useState<GeneratedAgentData | null>(null);
    const createAgentMutation = useCreateAgent();

    const handleGenerate = () => {
        if (!prompt.trim()) {
            toast({ title: "Prompt is empty", description: "Please describe the agent you want to create.", variant: "destructive" });
            return;
        }
        setStep('generating');

        // Simulate AI generation
        setTimeout(() => {
            const generatedName = prompt.split(' ').slice(0, 4).join(' ');
            const generatedInstructions = `You are an expert ${generatedName}. Your primary goal is to ${prompt}. Follow user instructions carefully and provide accurate, helpful responses.`;
            setGeneratedData({
                name: generatedName,
                instructions: generatedInstructions,
                guidelines: "- Maintain a professional and helpful tone.\n- If you don't know the answer, say so clearly.\n- Provide sources for your information when possible."
            });
            setStep('reviewing');
        }, 2000);
    };

    const handleAccept = () => {
        if (!generatedData) return;
        
        const generatedId = generatedData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const guidelinesArray = generatedData.guidelines.split('\n').map(line => line.replace(/^- /, '').trim()).filter(line => line);

        const agentPrompt: AgentPrompt = {
            base: generatedData.instructions,
            guidelines: guidelinesArray.map(g => ({ text: g, isDefault: true })),
        };

        const agentData = {
            id: generatedId,
            name: generatedData.name,
            description: prompt, // Use original prompt as description
            prompt: agentPrompt,
            category: AgentCategory.ContentGeneration,
            pageUrl: '/admin/chats'
        };

        createAgentMutation.mutate(agentData, {
            onSuccess: (newAgent) => {
                router.push(`/admin/manage-agents/${newAgent.id}/edit`);
            },
            onError: (error) => {
                toast({
                    title: 'Agent creation failed',
                    description: 'An agent with a similar ID might already exist. Please try a more specific description or edit the generated name.',
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
        setStep('generating');
        // Simulate regeneration
        setTimeout(() => {
            // In a real app, you'd call the AI again. Here we just slightly modify the data.
            setGeneratedData(prev => prev ? { ...prev, instructions: prev.instructions + " (Regenerated)" } : null);
            setStep('reviewing');
        }, 1500);
    };

    const renderPromptingView = () => (
        <div className="w-full max-w-3xl">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
                    Generate Your AI Agent <Bot className="h-10 w-10" />
                </h1>
            </div>
            <div className="relative">
                <div className="glowing-border p-0.5 rounded-2xl">
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your AI Agent's specialty and task—more details, better customization!"
                        className="bg-black/80 border-none rounded-2xl min-h-[150px] text-lg text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 p-6 pr-20"
                    />
                </div>
                <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 h-12 w-12 text-white hover:bg-white/20 rounded-full" onClick={handleGenerate}>
                    <SendHorizonal className="h-6 w-6" />
                </Button>
                 <Button variant="outline" className="absolute bottom-4 left-4 bg-white/5 border-white/20 hover:bg-white/10 text-white text-xs h-8">
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Add knowledge
                </Button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestionChips.map(({ label, icon: Icon }) => (
                    <Button
                        key={label}
                        variant="secondary"
                        className="bg-white/10 text-white hover:bg-white/20 rounded-full"
                        onClick={() => setPrompt(prev => prev ? `${prev}\n- ${label}` : label)}
                    >
                        <Icon className="mr-2 h-4 w-4" />
                        {label}
                    </Button>
                ))}
            </div>
        </div>
    );
    
    const renderGeneratingView = () => (
         <div className="w-full max-w-3xl text-center">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-2">
                Generate Your AI Agent <Bot className="h-10 w-10" />
            </h1>
            <p className="text-muted-foreground mb-8">Generating your agent... Just a moment!</p>
            <Loader2 className="h-16 w-16 mx-auto animate-spin" />
        </div>
    );

    const renderReviewView = () => (
        <div className="w-full max-w-3xl">
            <Button variant="ghost" onClick={() => setStep('prompting')} className="absolute top-8 left-8 text-white hover:bg-white/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Browse Templates
            </Button>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
                    Generate Your AI Agent <Bot className="h-10 w-10" />
                </h1>
            </div>
            <div className="space-y-6">
                <div className="glowing-border p-4 rounded-xl text-left">
                    <p>{prompt}</p>
                </div>
                 <div className="flex justify-center">
                     <Button variant="outline" className="bg-white/5 border-white/20 hover:bg-white/10 text-white">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add knowledge
                    </Button>
                </div>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="agent-name" className="text-xs uppercase text-muted-foreground">Name</Label>
                        <Input id="agent-name" value={generatedData?.name || ''} onChange={(e) => setGeneratedData(prev => prev ? { ...prev, name: e.target.value } : null)} className="bg-white/5 border-white/20 h-12" />
                    </div>
                    <div>
                        <Label htmlFor="agent-instructions" className="text-xs uppercase text-muted-foreground">Instructions</Label>
                        <Textarea id="agent-instructions" value={generatedData?.instructions || ''} onChange={(e) => setGeneratedData(prev => prev ? { ...prev, instructions: e.target.value } : null)} className="bg-white/5 border-white/20 min-h-[100px]" />
                    </div>
                     <div>
                        <Label htmlFor="agent-guidelines" className="text-xs uppercase text-muted-foreground">Guidelines</Label>
                        <Textarea id="agent-guidelines" value={generatedData?.guidelines || ''} onChange={(e) => setGeneratedData(prev => prev ? { ...prev, guidelines: e.target.value } : null)} className="bg-white/5 border-white/20 min-h-[100px]" />
                    </div>
                </div>
                <div className="flex justify-center gap-4">
                    <Button variant="secondary" onClick={handleAccept} disabled={createAgentMutation.isPending}>
                        {createAgentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}
                        <span className="ml-2">Accept</span>
                    </Button>
                    <Button variant="outline" onClick={handleRegenerate}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Regenerate
                    </Button>
                    <Button variant="destructive" onClick={handleReject}>
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Reject
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center p-4 text-white ai-gradient-background">
            {step === 'prompting' && renderPromptingView()}
            {step === 'generating' && renderGeneratingView()}
            {step === 'reviewing' && renderReviewView()}
        </div>
    );
}
