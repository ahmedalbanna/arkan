
'use client';

import AgentPlayground from '@/modules/ai/adapters/components/agent/AgentPlayground';
import { AgentList } from '@/modules/ai/adapters/components/sidebar/AgentList';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useAgentManager } from '@/hooks/use-agent-store';
import { Bot, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/infrastructure/utils/cn';
export default function ManageAgentsPage() {
    const { t } = useLocalization();
    const {
        agents,
        selectedAgent,
        isLoading,
        error,
        fetchAgents,
    } = useAgentManager();
    const { isLoading: authIsLoading } = useAuth();

    function handleFetch() {
        fetchAgents();
    }

    // Initial fetch is handled by useQuery in the hook
    // This effect is no longer needed
    // useEffect(() => {
    //     if (user) {
    //         handleFetch();
    //     }
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [user]);



    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">Neural Node</Badge>
                        <div className="h-3 w-px bg-primary/20" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Agent Orchestration</span>
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter text-foreground flex items-center gap-4">
                            <Bot className="w-10 h-10 text-primary animate-pulse" />
                            {t('header.agentManager')}
                        </h1>
                        <p className="text-lg text-muted-foreground italic font-serif opacity-80 max-w-2xl leading-relaxed">
                            Configure, test, and deploy specialized AI entities into the Arkan intelligence suite.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-background border shadow-sm flex flex-col items-end">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Registry Status</span>
                        <span className="text-xs font-bold text-green-500 flex items-center gap-1.5 mt-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            Operational
                        </span>
                    </div>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleFetch}
                                    disabled={isLoading || authIsLoading}
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all"
                                >
                                    <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-widest">
                                Sync Registry
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="bg-destructive/[0.03] border-destructive/20 rounded-2xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-medium italic">
                        Registry Sync Error: {error}
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex-1 border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] h-[calc(100vh-280px)]">
                {isLoading && !agents.length ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-4 opacity-40">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Synchronizing Agent Registry</p>
                    </div>
                ) : (
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                        <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-muted/5 border-r border-border/40">
                            <AgentList agents={agents} />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={75} className="bg-background relative">
                            {/* Subtle Canvas Background */}
                            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                            <div className="relative h-full z-10">
                                <AgentPlayground agent={selectedAgent} />
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
            </div>
        </div>
    );
};
