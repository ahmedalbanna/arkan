'use client';

import React from 'react';
import { Sparkles, BrainCircuit, Zap, Target, BookOpen, Search, Languages, FileText, ChevronRight, Wand2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/infrastructure/utils/cn';
import { Section } from '@/modules/ai-content/domain/entities/Section';

interface IntelligenceTabProps {
    section: Section;
    onAction: (action: string, params?: any) => void;
    isProcessing?: boolean;
}

export const IntelligenceTab = ({ section, onAction, isProcessing }: IntelligenceTabProps) => {
    const recommendations = [
        {
            id: 'citations',
            title: 'Citation Check',
            description: '3 claims in this section may require primary source backing.',
            icon: BookOpen,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
        },
        {
            id: 'simplify',
            title: 'Technical Density',
            description: 'Complexity is high (84%). Consider simplifying for clarity.',
            icon: Target,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
        }
    ];

    const quickActions = [
        { id: 'improve-flow', label: 'Improve Flow', icon: Zap, tooltip: 'Enhance transitions between paragraphs' },
        { id: 'academic-polish', label: 'Academic Polish', icon: BrainCircuit, tooltip: 'Increase formality and scientific tone' },
        { id: 'fix-grammar', label: 'Neural Grammar', icon: Wand2, tooltip: 'Advanced syntax and logic correction' },
        { id: 'translate', label: 'Translate', icon: Languages, tooltip: 'Convert to primary manifest language' },
    ];

    return (
        <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-right-2 duration-500">
            {/* System Status HUD */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-1000" />
                <div className="relative bg-background/60 backdrop-blur-xl border border-primary/10 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="h-2 w-2 rounded-full bg-primary animate-ping absolute inset-0" />
                                <div className="h-2 w-2 rounded-full bg-primary relative" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Neural Synthesis Active</span>
                        </div>
                        <Badge variant="outline" className="h-5 text-[9px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">
                            Gemma 2B_v2
                        </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                        The AI is monitoring your <span className="text-foreground font-bold italic">"{section.title}"</span> context. 
                        Neural weightings are tuned for <span className="text-primary font-bold">Academic Precision</span>.
                    </p>
                </div>
            </div>

            {/* Active Recommendations */}
            <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2 px-1">
                    <Sparkles className="h-3 w-3 text-primary/60" />
                    Active Recommendations
                </h4>
                <div className="space-y-2">
                    {recommendations.map((rec) => (
                        <button
                            key={rec.id}
                            onClick={() => onAction(rec.id)}
                            className="w-full group text-left p-3 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="flex gap-3 relative z-10">
                                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110", rec.bg)}>
                                    <rec.icon className={cn("h-4 w-4", rec.color)} />
                                </div>
                                <div className="min-w-0">
                                    <h5 className="text-[11px] font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors">{rec.title}</h5>
                                    <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">{rec.description}</p>
                                </div>
                                <ChevronRight className="h-3 w-3 text-muted-foreground/30 ml-auto self-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Neural Quick Actions Grid */}
            <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2 px-1">
                    <BrainCircuit className="h-3 w-3 text-primary/60" />
                    Neural Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    <TooltipProvider>
                        {quickActions.map((action) => (
                            <Tooltip key={action.id}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={() => onAction(action.id)}
                                        className="h-14 flex-col gap-1.5 justify-center rounded-xl bg-muted/5 border-primary/5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-500 group/btn relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-primary/0 group-hover/btn:bg-primary/[0.03] transition-colors duration-500" />
                                        {isProcessing ? (
                                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin relative z-10" />
                                        ) : (
                                            <action.icon className="h-4 w-4 text-muted-foreground group-hover/btn:text-primary group-hover/btn:scale-110 transition-all duration-500 relative z-10" />
                                        )}
                                        <span className="text-[9px] font-black uppercase tracking-widest relative z-10">{action.label}</span>
                                        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-hover/btn:w-full transition-all duration-500 ease-out" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-widest bg-background/95 backdrop-blur-md border-primary/20">{action.tooltip}</TooltipContent>
                            </Tooltip>
                        ))}
                    </TooltipProvider>
                </div>
            </div>

            {/* Context Vector Analysis */}
            <div className="p-4 rounded-2xl bg-muted/5 border border-dashed border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                    <Search className="h-3 w-3 text-primary/40" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Vector Context Analysis</span>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-tight">
                        <span className="text-muted-foreground">RAG Influence</span>
                        <span className="text-primary tabular-nums">72.4%</span>
                    </div>
                    <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[72.4%] rounded-full animate-in slide-in-from-left duration-1000" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                        <Info className="h-2.5 w-2.5 text-primary/40" />
                        <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider italic">Context is derived from 4 ingested documents.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
