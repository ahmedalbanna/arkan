'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Bot, BrainCircuit, Check, Copy, Flame, Send, SendHorizonal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCreateAgent } from '@/hooks/use-agents';
import { toast } from '@/hooks/use-toast';
import { AgentCategory } from '@/lib/agents';

const suggestionChips = [
    { label: 'Task Manager', icon: Check },
    { label: 'Content Creator', icon: Flame },
    { label: 'Social Media Planner', icon: Copy },
    { label: 'Blog SEO Writer', icon: Copy },
    { label: 'Content Marketer', icon: Copy },
    { label: 'Research Analyst', icon: Copy },
    { label: 'Marketing Strategist', icon: Copy },
    { label: 'Copy Editor', icon: Copy },
];

export function GenerateAgentView() {
    const router = useRouter();
    const [prompt, setPrompt] = useState('');
    const createAgentMutation = useCreateAgent();

    const handleGenerate = () => {
        if (!prompt.trim()) {
            toast({ title: "Prompt is empty", description: "Please describe the agent you want to create.", variant: "destructive" });
            return;
        }

        // For now, we will use a simplified agent creation based on the prompt.
        // A more advanced implementation would use an AI flow to generate the agent configuration.
        const generatedId = prompt.toLowerCase().split(' ').slice(0, 3).join('-').replace(/[^a-z0-9-]/g, '');
        const agentData = {
            id: generatedId,
            name: prompt.split(' ').slice(0, 4).join(' '),
            description: prompt,
            prompt: `You are an AI assistant. The user wants you to act as: ${prompt}.`,
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
                    description: 'An agent with a similar ID might already exist. Please try a more specific description.',
                    variant: 'destructive',
                });
            }
        });
    };

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center p-4 text-white ai-gradient-background">
            <div className="w-full max-w-3xl">
                <Button variant="ghost" onClick={() => router.back()} className="absolute top-8 left-8 text-white hover:bg-white/10">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Browse Templates
                </Button>

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
                    <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 h-12 w-12 text-white hover:bg-white/20 rounded-full" onClick={handleGenerate} disabled={createAgentMutation.isPending}>
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
        </div>
    );
}
