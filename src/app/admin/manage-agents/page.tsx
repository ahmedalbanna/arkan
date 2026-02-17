
'use client';

// useEffect removed - not used in component
import AgentPlayground from '@/components/agent/AgentPlayground';
import { AgentList } from '@/components/sidebar/AgentList';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useAgentManager } from '@/hooks/use-agent-store';
import { Bot, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/AuthContext';

export default function ManageAgentsPage() {
    const { t } = useLocalization();
    const { 
        agents, 
        selectedAgent, 
        isLoading, 
        error,
        fetchAgents,
    } = useAgentManager();
    const { firebaseUser: _firebaseUser, isLoading: authIsLoading } = useAuth();

    function handleFetch() {
        fetchAgents();
    }

    // Initial fetch is handled by useQuery in the hook
    // This effect is no longer needed
    // useEffect(() => {
    //     if (firebaseUser) {
    //         handleFetch();
    //     }
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [firebaseUser]);

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                        <Bot className="h-6 w-6" />
                        {t('header.agentManager')}
                    </h1>
                    <p className="text-muted-foreground">
                        Manage, test, and configure your AI agents.
                    </p>
                </div>
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button 
                                onClick={handleFetch}
                                disabled={isLoading || authIsLoading}
                                variant="outline"
                                size="sm"
                            >
                                <RefreshCw className={`h-4 w-4 me-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Manually refresh the agent list from the server.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            
            {error && (
                <Alert variant="destructive" className="my-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load agents: {error}
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex-1 mt-4 border rounded-lg overflow-hidden h-[calc(100vh-220px)] bg-background">
                {isLoading && !agents.length ? ( // Show skeleton only on initial hard load
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">Loading agents...</p>
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
            </div>
        </>
    );
};
