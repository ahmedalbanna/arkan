
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useLocalization } from '@/context/LocalizationContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTheme } from 'next-themes';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });


interface Activity {
    userId: string;
    userName?: string;
    agentId: string;
    createdAt: string;
    id: string;
    input: any;
    output: any;
}

interface RecentActivityProps {
    data: Activity[];
}

import { Badge } from '@/components/ui/badge';
import { Activity as ActivityIcon, History, Terminal, Bot, User, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
import { Separator } from '@/components/ui/separator';

function LogDetailView({ log }: { log: Activity }) {
    const { resolvedTheme } = useTheme();

    return (
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border-none shadow-2xl">
            <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <DialogTitle className="text-xl font-bold font-headline tracking-tight">Generation Logic Manifest</DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground italic max-w-2xl leading-relaxed">
                        Complete transmission log for <span className="text-foreground font-bold not-italic">"{log.agentId}"</span> requested by <span className="text-primary font-bold not-italic">{log.userName || 'Anonymous Node'}</span>.
                    </DialogDescription>
                </div>
                <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
                    Log: {String(log.id).slice(0, 8)}
                </Badge>
            </header>

            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden bg-[#0d1117]">
                <div className="flex flex-col border-r border-white/5">
                    <div className="px-8 py-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Input Signal</h4>
                    </div>
                    <ScrollArea className="flex-1 relative group">
                        <div className="p-8">
                            <ReactJson
                                src={log.input}
                                theme="monokai"
                                collapsed={2}
                                displayDataTypes={false}
                                name={false}
                                style={{ background: 'transparent', fontSize: '12px' }}
                            />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none opacity-40" />
                    </ScrollArea>
                </div>
                <div className="flex flex-col">
                    <div className="px-8 py-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Neural Response</h4>
                    </div>
                    <ScrollArea className="flex-1 relative group">
                        <div className="p-8">
                            <ReactJson
                                src={log.output}
                                theme="monokai"
                                collapsed={2}
                                displayDataTypes={false}
                                name={false}
                                style={{ background: 'transparent', fontSize: '12px' }}
                            />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none opacity-40" />
                    </ScrollArea>
                </div>
            </div>

            <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                    Arkan Intelligence Engine • Log Node V1.0
                </p>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-4 text-[8px] uppercase tracking-tighter text-muted-foreground/60 border-border/60">
                        Timestamp: {(() => {
                            try {
                                const d = new Date(log.createdAt);
                                return isNaN(d.getTime()) ? 'Unregistered' : d.toISOString();
                            } catch {
                                return 'Unregistered';
                            }
                        })()}
                    </Badge>
                </div>
            </footer>
        </DialogContent>
    );
}


export function RecentActivity({ data }: RecentActivityProps) {
    const { t } = useLocalization();
    return (
        <Card className="lg:col-span-3 border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] animate-in fade-in duration-700">
            <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                        Activity Stream
                    </h3>
                </div>
                <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
                    Live Feed
                </Badge>
            </header>

            <CardContent className="p-0">
                <ScrollArea className="h-[450px]">
                    <div className="p-4 space-y-1.5">
                        {data.length > 0 ? data.map((activity) => (
                            <Dialog key={activity.id}>
                                <DialogTrigger asChild>
                                    <div className="group relative flex items-center gap-4 cursor-pointer p-3 rounded-2xl transition-all duration-300 hover:bg-primary/[0.03] hover:shadow-sm border border-transparent hover:border-primary/10">
                                        <div className="relative shrink-0">
                                            <Avatar className="h-10 w-10 rounded-xl border shadow-sm transition-transform group-hover:scale-110">
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                                                    {activity.userName ? activity.userName.charAt(0) : 'Y'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 bg-background border rounded-lg p-0.5 shadow-sm group-hover:rotate-12 transition-transform">
                                                <Bot className="h-3 w-3 text-primary/60" />
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold tracking-tight truncate leading-none">
                                                    {activity.userName || 'Anonymous Node'}
                                                </p>
                                                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                                    {(() => {
                                                        try {
                                                            const d = new Date(activity.createdAt);
                                                            return isNaN(d.getTime()) ? 'Recently' : formatDistanceToNow(d, { addSuffix: true });
                                                        } catch {
                                                            return 'Recently';
                                                        }
                                                    })()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="h-4 text-[8px] uppercase tracking-tighter border-primary/20 text-primary px-1 font-bold">
                                                    {activity.agentId}
                                                </Badge>
                                                <p className="text-[10px] text-muted-foreground italic truncate">
                                                    Synthesis protocol initialized.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                            <ChevronRight className="h-3.5 w-3.5 text-primary/40" />
                                        </div>
                                    </div>
                                </DialogTrigger>
                                <LogDetailView log={activity} />
                            </Dialog>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40 space-y-4">
                                <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center">
                                    <History className="h-8 w-8 text-primary/60" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stream Empty</h3>
                                    <p className="text-[10px] italic max-w-[150px] mx-auto leading-relaxed">{t('adminDashboard.noActivity')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>

            <footer className="px-8 py-4 border-t bg-muted/5">
                <p className="text-[8px] text-center text-muted-foreground/40 font-bold uppercase tracking-widest">
                    Real-time Telemetry • Node Connection V1.0
                </p>
            </footer>
        </Card>
    );
}
