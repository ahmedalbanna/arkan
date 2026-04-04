'use client';

import React, { useState, useEffect } from 'react';
import { ListTree, Sparkles, Layout, Eye, PenLine } from 'lucide-react';
import { useBuilderStore, useToast } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownViewer } from '@/components/shared/MarkdownViewer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TOCGenerator } from './TOCGenerator';

/**
 * TOCArchitect — A tactical structure editor for manual hierarchy management.
 * Provides a split-view for high-precision manual editing and visual preview.
 */

export function TOCArchitect() {
  const project = useBuilderStore(state => state.project);
  const applyTableOfContents = useBuilderStore(state => state.applyTableOfContents);
  const { toast } = useToast();
  const [tocText, setTocText] = useState('');
  const [isTocDialogOpen, setIsTocDialogOpen] = useState(false);

  useEffect(() => {
    setTocText(project?.tableOfContentsMarkdown || '');
  }, [project?.tableOfContentsMarkdown]);

  const handleApply = () => {
    if (!project) return;
    applyTableOfContents(tocText);
    toast({
        title: 'Structure Applied',
        description: 'The document architecture has been successfully synthesized.'
    });
  };

  return (
    <div className="flex flex-col h-full pt-2">
      <TOCGenerator
        isOpen={isTocDialogOpen}
        onOpenChange={setIsTocDialogOpen}
        onApply={(generatedMarkdown) => {
          setTocText(generatedMarkdown);
          applyTableOfContents(generatedMarkdown);
          setIsTocDialogOpen(false);
        }}
      />

      <header className="mb-8 space-y-1.5 px-1">
          <h1 className="text-[18px] font-black uppercase tracking-tight text-foreground/90">Architecture Manifest</h1>
          <p className="text-[11px] text-muted-foreground/60 italic font-medium leading-relaxed max-w-2xl">
              Define the organizational hierarchy of your manifest. The AI engine utilizes this blueprint to maintain global coherence.
          </p>
      </header>

      <div className="flex-1 flex flex-col gap-8 relative px-1 min-h-0">
        {/* Depth architectural line */}
        <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

        <Tabs defaultValue="edit" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-[280px] grid-cols-2 h-11 rounded-2xl bg-muted/20 p-1 gap-1 border border-border/40 backdrop-blur-md">
                <TabsTrigger value="edit" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg px-2 transition-all rounded-xl">
                    <PenLine className="h-3.5 w-3.5" />
                    Manual Grid
                </TabsTrigger>
                <TabsTrigger value="view" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg px-2 transition-all rounded-xl">
                    <Eye className="h-3.5 w-3.5" />
                    Spectral View
                </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="flex-1 flex flex-col m-0 mt-8 focus-visible:ring-0">
                <div className="flex-1 flex flex-col relative group">
                    <div className="flex items-center gap-2.5 mb-4 group/label">
                        <ListTree className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                        <Label htmlFor="toc-textarea" className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">Hierarchical Logic</Label>
                    </div>
                    
                    <div className="flex-1 relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-transparent rounded-[28px] blur opacity-0 group-hover:opacity-100 transition duration-1000" />
                        <Textarea
                            id="toc-textarea"
                            value={tocText}
                            onChange={(e) => setTocText(e.target.value)}
                            className="h-full w-full font-mono text-[12px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 leading-relaxed resize-none p-8 rounded-[24px] shadow-inner border-dashed transition-all hover:bg-muted/8"
                            placeholder={`# Chapter 1 Title\n  - Section 1.1 Title\n  - Section 1.2 Title\n\n# Chapter 2 Title\n  - Section 2.1 Title`}
                        />
                    </div>

                    {/* Syntax Guide HUD */}
                    <div className="absolute bottom-6 right-8 px-4 py-2 rounded-2xl bg-background/80 backdrop-blur-3xl border border-primary/10 shadow-2xl flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-primary">#</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">CHAPTER</span>
                        </div>
                        <div className="h-3 w-px bg-primary/10" />
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-primary">-</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">SECTION</span>
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="view" className="flex-1 m-0 mt-8 overflow-hidden relative focus-visible:ring-0">
                <ScrollArea className="h-full rounded-[32px] border border-primary/10 bg-black/5 dark:bg-white/[0.02] p-10 shadow-inner">
                     {/* Visual grid atmosphere */}
                     <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                     <MarkdownViewer content={tocText} className="relative z-10 leading-relaxed text-[13px] selection:bg-primary/20 font-medium" />
                </ScrollArea>
            </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-primary/10 mt-auto bg-background/40 backdrop-blur-xl -mx-5 px-5 pb-2">
            <Button 
                onClick={() => setIsTocDialogOpen(true)} 
                variant="outline" 
                className="flex-1 font-black h-12 gap-2.5 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 rounded-2xl uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                <Sparkles className="h-4 w-4" />
                AI Architect
            </Button>
            <Button 
                onClick={handleApply} 
                className="flex-[2] font-black h-12 gap-2.5 shadow-2xl shadow-primary/20 rounded-2xl uppercase tracking-[0.2em] text-[10px] bg-primary hover:opacity-90 ring-1 ring-inset ring-white/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
                <Layout className="h-4 w-4" />
                Materialize Architecture
            </Button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TOCArchitect);
