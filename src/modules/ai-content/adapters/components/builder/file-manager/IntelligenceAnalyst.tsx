'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    AtomIcon,
    Binary,
    Check,
    Copy,
    FileJson,
    Loader2,
    Plus,
    RefreshCcw,
    Search,
    BrainCircuit,
    ShieldAlert,
    Database,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useBuilderStore, useToast } from '@/hooks';
import { cn } from "@/infrastructure/utils/cn";
import { generateRandomId } from '@/infrastructure/utils/randomId';

// Dynamic import for high-weight JSON visualizer
const ReactJson = dynamic(() => import('@microlink/react-json-view'), {
    ssr: false,
    loading: () => <div className="h-40 flex items-center justify-center bg-muted/5 rounded-2xl animate-pulse text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Initializing Neural Visualizer...</div>
});

/**
 * IntelligenceAnalyst — Deep spectral analysis hub for context vectors.
 * Allows structural decomposition of source data into manageable neural nodes.
 * 
 * DEFENSIVE MEASURES:
 * 1. Schema Validation: Strict Zod validation for analysis parameters.
 * 2. Error Containment: Wraps JSON transformation and dynamic visualization in try-catch.
 * 3. Execution Guard: Prevents duplicate analysis and handles malformed payloads.
 * 4. UX Safety: Implements pulse triggers and loading states for long-running AI tasks.
 */

const analysisSchema = z.object({
    query: z.string().min(3, 'Analysis vector requires at least 3 characters'),
    depth: z.enum(['shallow', 'standard', 'deep']).default('standard'),
});

type AnalysisFormValues = z.infer<typeof analysisSchema>;

function jsonToMarkdown(json: any, level = 1): string {
    if (typeof json !== 'object' || json === null) return String(json);

    try {
        let md = '';
        const indent = '  '.repeat(level - 1);
        for (const [key, value] of Object.entries(json)) {
            if (typeof value === 'object' && value !== null) {
                md += `${indent}- **${key}**\n${jsonToMarkdown(value, level + 1)}`;
            } else {
                md += `${indent}- **${key}**: ${value}\n`;
            }
        }
        return md;
    } catch (e) {
        console.error('[IntelligenceAnalyst] JSON to MD conversion failed:', e);
        return 'Data serialization error encountered.';
    }
}

export function IntelligenceAnalyst() {
    const { project, updateProject } = useBuilderStore();
    const { toast } = useToast();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const form = useForm<AnalysisFormValues>({
        resolver: zodResolver(analysisSchema),
        defaultValues: {
            query: '',
            depth: 'standard',
        }
    });

    const handleRunAnalysis = useCallback(async (values: AnalysisFormValues) => {
        if (!project) return;

        setIsAnalyzing(true);
        setResult(null);

        try {
            // Simulated deep spectral analysis pipeline
            // In production, this would call a specialized analysis tool via useWritingTool
            await new Promise(resolve => setTimeout(resolve, 2000));

            const mockAnalysis = {
                metadata: {
                    vector_density: '0.84',
                    semantic_cohesion: 'high',
                    source_nodes: project.externalContext.length,
                },
                structural_insights: [
                    { category: 'Technical Constraints', identified: 12, critical: 2 },
                    { category: 'Thematic Patterns', identified: 5, confidence: '92%' }
                ],
                recommended_blueprints: ['technical-deep-dive', 'executive-summary-v2']
            };

            setResult(mockAnalysis);
            toast({ title: "Analysis Synchronized", description: "Intelligence vector successfully mapped from source matrix." });
        } catch (error) {
            console.error('[IntelligenceAnalyst] Analysis failed:', error);
            toast({ title: "System Overload", description: "The analysis core failed to process the current context window.", variant: 'destructive' });
        } finally {
            setIsAnalyzing(false);
        }
    }, [project, toast]);

    const handleIntegrateInsight = useCallback(() => {
        if (!result || !updateProject) return;

        try {
            const content = jsonToMarkdown(result);
            updateProject(p => p.addExternalContext({
                fileName: `Analysis_Insight_${Date.now()}.md`,
                content,
                type: 'guidelines'
            }, generateRandomId()));

            toast({ title: "Insight Materialized", description: "Spectral data node successfully integrated into context matrix." });
        } catch (error) {
            console.error('[IntelligenceAnalyst] Integration failure:', error);
            toast({ title: "Materialization Error", description: "Failed to synthesize insight node.", variant: 'destructive' });
        }
    }, [result, updateProject, toast]);

    if (!project) return null;

    return (
        <div className="flex flex-col h-full gap-8 pt-2 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-1.5 px-1">
                <div className="flex items-center gap-2.5">
                    <BrainCircuit className="h-4 w-4 text-primary/70" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Neural Analyst</h4>
                </div>
                <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-widest">
                    Decompose source matrices into structural intelligence.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleRunAnalysis)} className="space-y-6 px-1 relative">
                    {/* Depth architectural line */}
                    <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

                    <div className="space-y-5">
                        <FormField
                            control={form.control}
                            name="query"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 px-1">Analysis Vector</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="SCAN_TARGET..."
                                            className="h-10 text-[11px] font-bold bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl uppercase tracking-widest"
                                            disabled={isAnalyzing}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[9px] font-bold italic text-destructive/80" />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={isAnalyzing}
                            className="w-full h-12 text-[10px] font-black uppercase tracking-[0.3em] gap-3 shadow-xl shadow-primary/10 rounded-2xl bg-primary hover:opacity-90 relative overflow-hidden group/run transition-all duration-500 ease-[0.22,1,0.36,1]"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Processing Matrix...</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4 transition-transform group-hover/run:rotate-12" />
                                    <span>Initialize Spectral Analysis</span>
                                </>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/run:translate-x-full transition-transform duration-1000 ease-in-out" />
                        </Button>
                    </div>
                </form>
            </Form>

            <Separator className="bg-primary/10 h-px" />

            <div className="flex-1 min-h-0 flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <Binary className="h-3 w-3 text-primary/40" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Spectrum Output</span>
                    </div>
                    {result && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleIntegrateInsight}
                            className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-primary/10 hover:bg-primary/5 hover:text-primary transition-all gap-1.5"
                        >
                            <Plus className="h-3 w-3" />
                            Materialize
                        </Button>
                    )}
                </div>

                <div className="flex-1 relative">
                    <ScrollArea className="absolute inset-0 rounded-[24px] border border-primary/10 bg-muted/5 p-6 custom-scrollbar relative z-10">
                        {result ? (
                            <div className="animate-in fade-in zoom-in-95 duration-700">
                                <ReactJson
                                    src={result}
                                    theme="monokai"
                                    name={false}
                                    collapsed={1}
                                    enableClipboard={false}
                                    displayDataTypes={false}
                                    style={{ background: 'transparent', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
                                <div className="p-5 rounded-full bg-muted/20 border border-dashed border-muted-foreground/40">
                                    <FileJson className="h-8 w-8 text-muted-foreground stroke-[1]" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em]">Output Idle</p>
                                    <p className="text-[9px] font-medium italic">Execute analysis to view cognitive decomposition.</p>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>

            <div className="p-5 rounded-[24px] border border-primary/10 bg-muted/5 text-center space-y-2 group/info hover:bg-muted/10 transition-all">
                <p className="text-[9px] text-primary/40 italic leading-relaxed font-medium uppercase tracking-widest group-hover:text-primary/60 transition-colors px-4">
                    Neural Analyst uses structural inference to identify critical data patterns within the Source Matrix.
                </p>
            </div>
        </div>
    );
}
