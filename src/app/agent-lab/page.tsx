'use client';

import AgentPlayground from '@/components/agent/AgentPlayground';
import { AgentList } from '@/components/sidebar/AgentList';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useAgentStore } from '@/hooks/use-agent-store';
import { Bot, Github, RefreshCw, AlertCircle } from 'lucide-react';
import React, { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MainApp: React.FC = () => {
    const { 
        loadInitialAgents, 
        refreshAgentsFromApi, 
        agents, 
        selectedAgent, 
        isLoading, 
        error 
    } = useAgentStore();

    useEffect(() => {
        loadInitialAgents();
    }, [loadInitialAgents]);

    const handleRefreshAgents = async () => {
        await refreshAgentsFromApi();
    };

    return (
        <div className="flex h-screen w-screen flex-col">
            <header className="flex h-14 items-center justify-between border-b bg-background px-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 font-headline text-lg font-bold text-primary">
                        <Bot className="h-6 w-6" />
                        <span>AgentLab</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{agents.length} agents loaded from database</span>
                        <Button 
                            onClick={handleRefreshAgents}
                            disabled={isLoading}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                        >
                            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh from DB
                        </Button>
                    </div>
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
            {error && (
                <Alert variant="destructive" className="mx-4 mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load agents from API: {error}
                    </AlertDescription>
                </Alert>
            )}
            <main className="flex-1 overflow-hidden">
                {isLoading && agents.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">Loading agents from API...</p>
                        </div>
                    </div>
                ) : (
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                            <AgentList agents={agents} />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={75}>
                            <AgentPlayground agent={selectedAgent} />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
            </main>
        </div>
    );
};

export default MainApp;
