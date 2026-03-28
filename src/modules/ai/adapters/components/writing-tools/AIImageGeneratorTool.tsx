'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { useAIImageGeneratorLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-ai-image-generator-logic';
import { Download, Heart, Image as ImageIcon, Loader2, Sparkles, Trash2, Layout, Zap, Terminal, CheckCircle2, ChevronRight, Maximize2, Bot } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';
import React from 'react';

export function AIImageGeneratorTool() {
  const {
    form,
    onSubmit,
    isLoading,
    imageUrl,
    history,
    handleDownload,
    handleSave,
    handleDelete,
    handleLoadFromHistory,
  } = useAIImageGeneratorLogic();

  const { register, handleSubmit, watch, setValue } = form;
  const seedValue = watch('seed');

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Generative Vision Manifest</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">Execute autonomous rendering protocols to derive high-fidelity visual assets from technical prompts.</p>
      </header>

      <CardContent className="p-0 flex flex-col lg:flex-row min-h-[850px]">
        {/* Setup Zone (Left) */}
        <div className="lg:w-[450px] border-r border-border/40 bg-muted/5 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
                <div className="p-8 space-y-10">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Terminal className="h-3 w-3 text-primary" />
                                    Prompt Payload
                                </Label>
                                <Textarea
                                    id="prompt"
                                    {...register('prompt')}
                                    placeholder="Describe the visual logic and composition..."
                                    className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-6 leading-relaxed rounded-2xl border-dashed min-h-[150px]"
                                    disabled={isLoading}
                                />
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Maximize2 className="h-3 w-3 text-primary" />
                                    Dimensional Matrix
                                </Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-bold uppercase text-muted-foreground/40 ml-1">Width (PX)</Label>
                                        <Input id="width" type="number" {...register('width', { valueAsNumber: true })} className="h-9 text-xs bg-background ring-1 ring-border/40 border-none rounded-lg" disabled={isLoading} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-bold uppercase text-muted-foreground/40 ml-1">Height (PX)</Label>
                                        <Input id="height" type="number" {...register('height', { valueAsNumber: true })} className="h-9 text-xs bg-background ring-1 ring-border/40 border-none rounded-lg" disabled={isLoading} />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-6">
                                <div className="flex justify-between items-center px-1">
                                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                        <Zap className="h-3 w-3 text-primary" />
                                        Seed Entropy
                                    </Label>
                                    <Badge variant="secondary" className="h-4.5 text-[9px] font-mono">{seedValue}</Badge>
                                </div>
                                
                                <div className="space-y-4">
                                    <Slider
                                        id="seed"
                                        min={0}
                                        max={9999999999}
                                        step={1}
                                        value={[seedValue || 0]}
                                        onValueChange={(val) => setValue('seed', val[0])}
                                        disabled={isLoading}
                                    />
                                    <Input
                                        type="number"
                                        value={seedValue}
                                        onChange={(e) => setValue('seed', parseInt(e.target.value, 10))}
                                        className="h-8 text-[10px] font-mono bg-background border-none ring-1 ring-border/40 rounded-lg text-center"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                            Initialize Rendering
                        </Button>
                    </form>
                    
                    <div className="p-4 rounded-2xl border bg-muted/10 border-dashed text-center space-y-2">
                        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                            Visual assets are derived through recursive neural synthesis and follow professional rendering standards.
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
                <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-700">
                    <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Generated Vision Manifest</h3>
                        </div>
                        
                        {imageUrl && !isLoading && (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={handleSave} className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all">
                                    <Heart className="h-3.5 w-3.5" /> Save Asset
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDownload(imageUrl, `${watch('prompt').slice(0, 20)}`)} className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all">
                                    <Download className="h-3.5 w-3.5" /> Snapshot
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 space-y-10">
                        <div className="relative flex-1 flex items-center justify-center rounded-[40px] border bg-card shadow-2xl overflow-hidden ring-1 ring-black/5 group/canvas min-h-[400px]">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Generative Synthesis</p>
                                </div>
                            ) : imageUrl ? (
                                <div className="relative w-full h-full p-8 flex items-center justify-center transition-transform duration-700 group-hover/canvas:scale-[1.02]">
                                    <Image src={imageUrl} alt={watch('prompt')} width={watch('width')} height={watch('height')} className="rounded-2xl object-contain max-w-full max-h-[600px] shadow-2xl" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                                    <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                                        <ImageIcon className="h-10 w-10 text-primary/60" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vision Canvas Ready</h3>
                                        <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Configure the rendering protocol on the left to begin visual synthesis.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* History Panel */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Asset Registry</h4>
                            </div>

                            <ScrollArea className="h-48 w-full rounded-3xl border bg-muted/5 p-4 shadow-inner">
                                {history.length > 0 ? (
                                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                        {history.map((item) => (
                                            <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden border border-border/40 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-500">
                                                <Image
                                                    src={item.url}
                                                    alt={item.prompt}
                                                    layout="fill"
                                                    className="cursor-pointer object-cover transition-transform duration-700 group-hover:scale-110"
                                                    onClick={() => handleLoadFromHistory(item)}
                                                />
                                                <div className="absolute inset-0 bg-[#0d1117]/80 opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 flex flex-col justify-between backdrop-blur-[2px]">
                                                    <div className="flex justify-end gap-1">
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md hover:bg-destructive/20 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}><Trash2 className="h-3 w-3" /></Button>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md hover:bg-primary/20 text-white" onClick={(e) => { e.stopPropagation(); handleDownload(item.url, `${item.prompt.slice(0, 20)}`); }}><Download className="h-3 w-3" /></Button>
                                                    </div>
                                                    <span className="text-[7px] font-bold text-white/40 truncate uppercase tracking-tighter">NODE_{item.id.slice(0, 6)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center opacity-30">
                                        <p className="text-[9px] font-bold uppercase tracking-widest italic">Registry Empty</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                    
                    {/* Page Footer Visual */}
                    <div className="mt-auto pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest px-1">
                        <span>Arkan Rendering Engine</span>
                        <span>VISUAL NODE VERIFIED</span>
                    </div>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

const Textarea = React.forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
