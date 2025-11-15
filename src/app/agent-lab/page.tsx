'use client';

import AgentPlayground from '@/components/agent/AgentPlayground';
import { AgentList } from '@/components/sidebar/AgentList';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useAgentStore } from '@/hooks/use-agent-store';
import { Bot, Github } from 'lucide-react';
import React, { useEffect } from 'react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MainApp: React.FC = () => {
    const { loadInitialAgents, agents, selectedAgent } = useAgentStore();

    useEffect(() => {
        loadInitialAgents();
    }, [loadInitialAgents]);

    return (
        <div className="flex h-screen w-screen flex-col">
            <header className="flex h-14 items-center justify-between border-b bg-background px-4">
                <div className="flex items-center gap-2 font-headline text-lg font-bold text-primary">
                    <Bot className="h-6 w-6" />
                    <span>AgentLab</span>
                </div>
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" asChild>
                                    <a href="https://github.com/google/generative-ai-docs/tree/main/site/en/studio/samples/agent_lab" target="_blank" rel="noopener noreferrer">
                                        <Github className="h-5 w-5" />
                                    </a>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View on GitHub</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <ThemeToggle />
                </div>
            </header>
            <main className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                    <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                        <AgentList agents={agents} />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={75}>
                        <AgentPlayground agent={selectedAgent} />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>
        </div>
    );
};

export default MainApp;
