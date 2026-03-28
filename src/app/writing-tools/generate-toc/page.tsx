
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks';
import { useGenerateTocLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-generate-toc-logic';
import { Copy, ListOrdered, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Layout, ListTree } from 'lucide-react';

export default function GenerateTocPage() {
  const { form, mutation, onSubmit, results } = useGenerateTocLogic();
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (results) {
      const tocText = results.tableOfContents.map(c => `# ${c.title}\n${c.sections.map(s => `  - ${s}`).join('\n')}`).join('\n\n');
      await navigator.clipboard.writeText(tocText);
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Immersive Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% -20%, hsl(var(--primary) / 0.08), transparent 50%)'
        }}
      />
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="container relative z-10 mx-auto max-w-[1600px] px-6 py-20 md:py-32">
        <div className="flex flex-col items-center text-center mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">Architect Engine</Badge>
            <div className="h-3 w-px bg-primary/20" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Structural Synthesis</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-foreground leading-[0.9] flex items-center gap-6">
            <ListOrdered className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
            TOC Architect
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl italic font-serif leading-relaxed opacity-80">
            Professional structural modeling suite for deriving high-coherence document hierarchies and organizational manifests from project descriptions.
          </p>
        </div>

        <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
            <h2 className="text-2xl font-bold font-headline tracking-tight">Document Architecture Manifest</h2>
            <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">Provide the core project intent to derive a comprehensive structural blueprint.</p>
          </header>

          <CardContent className="p-0 flex flex-col lg:flex-row min-h-[800px]">
            {/* Setup Zone (Left) */}
            <div className="lg:w-[450px] border-r border-border/40 bg-muted/5 flex flex-col min-h-0">
              <ScrollArea className="flex-1">
                <div className="p-8 space-y-10">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                          <Layout className="h-3 w-3 text-primary" />
                          Project Intent
                        </Label>
                        <Textarea
                          id="project-description"
                          {...form.register('projectDescription')}
                          rows={12}
                          placeholder="Define the primary goals and scope of your document..."
                          className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-6 leading-relaxed rounded-2xl border-dashed min-h-[350px]"
                          disabled={mutation.isPending}
                        />
                        {form.formState.errors.projectDescription && <p className="text-[9px] font-bold text-destructive uppercase tracking-widest px-2">{form.formState.errors.projectDescription.message}</p>}
                      </div>
                    </div>

                    <Button type="submit" disabled={mutation.isPending} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                      {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                      Initialize Architecture
                    </Button>
                  </form>

                  <div className="p-4 rounded-2xl border bg-muted/10 border-dashed text-center space-y-2">
                    <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                      Architectural protocols execute deep semantic scans to derive logical hierarchies and chapter flows.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Results Canvas (Right) */}
            <div className="flex-1 flex flex-col min-h-0 bg-background relative overflow-hidden">
              {/* Subtle Canvas Background */}
              <div className="absolute inset-0 bg-[#f8fafc] dark:bg-black/20 pointer-events-none shadow-inner">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              </div>

              <div className="relative flex-1 flex flex-col min-h-0 p-8 md:p-12">
                {(mutation.isPending || results) ? (
                  <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                    <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Structural Manifest</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!results} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                          {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="flex-1 rounded-[32px] border bg-card p-10 md:p-16 shadow-2xl relative group">
                      {mutation.isPending ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                          <Loader2 className="h-12 w-12 animate-spin text-primary" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Architectural Synthesis</p>
                        </div>
                      ) : (
                        <div className="space-y-10 selection:bg-primary/10">
                          {results?.tableOfContents.map((chapter, index) => (
                            <div key={index} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold bg-muted/50 text-muted-foreground w-6 h-6 rounded flex items-center justify-center shrink-0 border">{index + 1}</span>
                                <h4 className="text-base font-bold tracking-tight text-foreground uppercase tracking-widest">{chapter.title}</h4>
                              </div>
                              <div className="pl-10 space-y-2 border-l border-border/40 ml-3">
                                {chapter.sections.map((section, sIndex) => (
                                  <div key={sIndex} className="flex items-center gap-3 group/item">
                                    <div className="h-1 w-1 rounded-full bg-primary/40 group-hover/item:bg-primary transition-colors" />
                                    <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors italic font-serif">{section}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Page Footer Visual */}
                      <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                        <span>Arkan Architecture Engine</span>
                        <span>STRUCTURAL SCHEMA VERIFIED</span>
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40 space-y-4">
                    <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                      <ListTree className="h-10 w-10 text-primary/60" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Architecture Canvas Ready</h3>
                      <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Provide the project intent on the left to begin structural synthesis.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
