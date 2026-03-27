
'use client';

import { useBuilderStore, useToast } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ListTree, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { GenerateTocDialog } from './dialogs/GenerateTocDialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownViewer } from '@/components/shared/MarkdownViewer';
import { ScrollArea } from '@/components/ui/scroll-area';

export function TableOfContentForm() {
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
        description: 'The project content has been updated based on your Table of Contents.'
    })
  };

  return (
    <>
      <GenerateTocDialog
        isOpen={isTocDialogOpen}
        onOpenChange={setIsTocDialogOpen}
        onApply={(generatedMarkdown) => {
          setTocText(generatedMarkdown);
          applyTableOfContents(generatedMarkdown);
          setIsTocDialogOpen(false);
        }}
      />
      <div className="flex-grow flex flex-col min-h-0">
          <header className="mb-8 space-y-1.5">
              <h1 className="text-2xl font-bold font-headline tracking-tight">Document Blueprint</h1>
              <p className="text-xs text-muted-foreground italic leading-relaxed max-w-2xl">
                  Define the organizational hierarchy of your project. The AI uses this blueprint to maintain coherence across chapters.
              </p>
          </header>

          <div className="flex-1 flex flex-col gap-6 min-h-0">
            <Tabs defaultValue="edit" className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-[240px] grid-cols-2 h-9 rounded-lg bg-muted/30 p-1 gap-1">
                    <TabsTrigger value="edit" className="text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary transition-all">Manual Edit</TabsTrigger>
                    <TabsTrigger value="view" className="text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary transition-all">Visual Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="flex-1 flex flex-col m-0 mt-6 focus-visible:ring-0">
                    <div className="flex-1 flex flex-col relative group">
                        <Label htmlFor="toc-textarea" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                            <ListTree className="h-3.5 w-3.5 text-primary" />
                            Hierarchical Logic
                        </Label>
                        <Textarea
                            id="toc-textarea"
                            value={tocText}
                            onChange={(e) => setTocText(e.target.value)}
                            className="flex-1 font-mono text-[13px] bg-muted/5 focus-visible:ring-1 leading-relaxed resize-none p-6 border-dashed"
                            placeholder={`# Chapter 1 Title\n  - Section 1.1 Title\n  - Section 1.2 Title\n\n# Chapter 2 Title\n  - Section 2.1 Title`}
                        />

                        {/* Syntax Guide HUD */}
                        <div className="absolute bottom-4 right-6 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border shadow-sm flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-primary">#</span>
                                <span className="text-[9px] font-medium uppercase tracking-tighter">Chapter</span>
                            </div>
                            <div className="h-3 w-px bg-border" />
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-primary">-</span>
                                <span className="text-[9px] font-medium uppercase tracking-tighter">Section</span>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="view" className="flex-1 m-0 mt-6 overflow-hidden relative focus-visible:ring-0">
                    <ScrollArea className="h-full rounded-xl border bg-[#f8fafc] dark:bg-black/20 p-8 shadow-inner">
                         <MarkdownViewer content={tocText} className="leading-relaxed text-sm selection:bg-primary/10" />
                    </ScrollArea>
                </TabsContent>
            </Tabs>

             <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/40 mt-auto bg-background/80 backdrop-blur-sm sticky bottom-0">
                <Button onClick={() => setIsTocDialogOpen(true)} variant="outline" className="flex-1 font-bold h-11 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Architect
                </Button>
                <Button onClick={handleApply} className="flex-[2] font-bold h-11 gap-2 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                    <ListTree className="h-4 w-4" />
                    Construct Project Structure
                </Button>
            </div>
          </div>
      </div>
    </>
  );
}
export default React.memo(TableOfContentForm);
