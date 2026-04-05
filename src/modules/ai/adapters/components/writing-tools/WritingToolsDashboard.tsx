'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
    Sparkles, 
    ArrowLeft, 
    LayoutGrid, 
    Search, 
    Binary, 
    Cpu, 
    Database, 
    ShieldCheck,
    Wrench,
    Bot,
    FileText,
    Settings
} from 'lucide-react';

import { useLocalization } from '@/context/LocalizationContext';
import { AIResearcherTool } from './AIResearcherTool';
import { SummarizerTool } from './SummarizerTool';
import { AIToolCard } from './AIToolCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/infrastructure/utils/cn';

/**
 * WritingToolsDashboard — High-fidelity command center for the AI tool arsenal.
 * Orchestrates specialized AI entities for niche architectural tasks.
 * 
 * DEFENSIVE MEASURES:
 * 1. Safe Navigation: Guards against invalid tool identifiers and empty states.
 * 2. Visual Fidelity: 28px grids, glassmorphism, and technical status pulses.
 * 3. Search Resilience: Efficient filtering with null-safe label matching.
 * 4. Technical Aesthetic: Standardized "Intelligence Suite" layouts.
 */

interface ToolNode {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    component: React.ReactNode;
    vector: string;
}

export function WritingToolsDashboard() {
    const { t } = useLocalization();
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const arsenal: ToolNode[] = useMemo(() => [
        {
            id: 'ai-researcher',
            title: t('writingTools.aiResearcher.title') || 'Neural Researcher',
            description: t('writingTools.aiResearcher.description') || 'In-depth spectral research and literature analysis.',
            icon: Sparkles,
            component: <AIResearcherTool />,
            vector: 'ACAD_V2'
        },
        {
            id: 'summarizer',
            title: t('writingTools.summarizer.title') || 'Context Summarizer',
            description: t('writingTools.summarizer.description') || 'Synthesize massive content volumes into logical manifests.',
            icon: FileText,
            component: <SummarizerTool />,
            vector: 'CORE_V1'
        },
        // Additional tools can be integrated here
    ], [t]);

    const filteredArsenal = useMemo(() => 
        arsenal.filter(tool => 
            tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [arsenal, searchQuery]);

    const activeToolNode = useMemo(() => 
        arsenal.find(tool => tool.id === selectedTool),
    [arsenal, selectedTool]);

    return (
        <div className="flex flex-col h-screen w-full bg-background overflow-hidden relative">
            {/* 28px Dot-grid Atmosphere — Standardized alignment */}
            <div 
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none z-0" 
                style={{ 
                    backgroundImage: 'radial-gradient(circle at center, hsl(var(--primary)) 1px, transparent 1px)',
                    backgroundSize: '28px 28px' 
                }} 
            />

            <header className="h-16 border-b border-primary/10 bg-background/60 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 relative z-10">
                <div className="flex items-center gap-6">
                    <Link href="/" className="group/logo flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover/logo:scale-105 transition-all">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black uppercase tracking-tight text-foreground/90">Writing Arsenal</span>
                            <div className="flex items-center gap-1.5">
                                <div className="h-1 w-1 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(var(--primary),0.8)]" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/60">Ready for Infiltration</span>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {selectedTool && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedTool(null)}
                            className="h-9 gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 rounded-xl transition-all"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Return to Grid
                        </Button>
                    )}
                    <div className="h-4 w-px bg-primary/10 mx-2" />
                    <Badge variant="outline" className="h-6 text-[9px] font-black border-primary/20 bg-primary/5 text-primary px-3 rounded-full shadow-inner">
                        {arsenal.length} NODES_ACTIVE
                    </Badge>
                </div>
            </header>

            <main className="flex-1 overflow-hidden flex flex-col relative z-10">
                {selectedTool && activeToolNode ? (
                    <ScrollArea className="flex-1">
                        <div className="p-8 md:p-12 max-w-6xl mx-auto">
                            {activeToolNode.component}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex-1 flex flex-col p-8 md:p-12 max-w-7xl mx-auto w-full">
                        <div className="space-y-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                                <div className="space-y-2">
                                    <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter text-foreground uppercase leading-none">
                                        AI Tool <span className="text-primary italic">Arsenal</span>
                                    </h1>
                                    <p className="text-lg text-muted-foreground italic font-serif opacity-70 max-w-2xl leading-relaxed font-medium">
                                        Select a specialized neural node to perform atomic document manipulations and research synthesis.
                                    </p>
                                </div>
                                <div className="relative group/search w-full md:w-80">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within/search:text-primary transition-colors" />
                                    <Input
                                        placeholder="SCAN_TOOLS..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 h-11 text-[10px] font-black uppercase tracking-widest bg-muted/5 border-primary/5 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all"
                                    />
                                </div>
                            </div>

                            <div className="relative pt-10">
                                {/* Depth architectural line */}
                                <div className="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-primary/30 via-primary/5 to-transparent" />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredArsenal.map((tool) => (
                                        <AIToolCard 
                                            key={tool.id}
                                            id={tool.id}
                                            title={tool.title}
                                            description={tool.description}
                                            icon={tool.icon}
                                            vector={tool.vector}
                                            onClick={() => setSelectedTool(tool.id)}
                                        />
                                    ))}
                                    
                                    {filteredArsenal.length === 0 && (
                                        <div className="col-span-full py-20 text-center opacity-30 group/empty">
                                            <div className="p-8 rounded-[32px] border border-dashed border-primary/20 bg-muted/5 shadow-inner w-fit mx-auto mb-6">
                                                <Database className="h-12 w-12 text-muted-foreground group-hover/empty:scale-110 transition-transform duration-500" />
                                            </div>
                                            <h3 className="text-[14px] font-black uppercase tracking-[0.3em]">No Arsenal Match</h3>
                                            <p className="text-[11px] italic font-medium mt-2">Adjust your scan parameters to identify specialized tool nodes.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="h-12 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                    <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">
                        Arkan Neural Arsenal • Node V2.4 Stable
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary/30" />
                        <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums uppercase tracking-widest">PROTOCOL_ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {[
                            { icon: Cpu, label: 'Core' },
                            { icon: Binary, label: 'Vector' }
                        ].map((node, i) => (
                            <div key={i} className="flex items-center gap-1.5 opacity-20">
                                <node.icon className="h-3 w-3" />
                                <span className="text-[7px] font-black uppercase tracking-widest">{node.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
