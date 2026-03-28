'use client';

import { DiagramTypeSchema } from '@/modules/ai/domain/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePlantUmlGeneratorLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-plant-uml-generator-logic';
import { Check, Code, Copy, Image as ImageIcon, Loader2, Sparkles, Layout, GitGraph, FileCode, CheckCircle2, Terminal, Zap, Bot, ChevronRight, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Controller } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';

const diagramTypes = DiagramTypeSchema.options.map(value => {
  let label = '';
  if (value === 'er') {
    label = 'ER Diagram';
  } else if (value === 'dfd') {
    label = 'Data Flow Diagram (DFD)';
  } else {
    label = value.charAt(0).toUpperCase() + value.slice(1).replace(/([A-Z])/g, ' $1').trim();
  }
  return { value, label };
});

export function PlantUMLGeneratorTool() {
  const {
    form,
    mutation,
    onSubmit,
    generatedCode,
    isCopied,
    handleCopy,
    imageUrl
  } = usePlantUmlGeneratorLogic();

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Technical Modeling Manifest</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">Execute architectural synthesis protocols to derive high-fidelity PlantUML models from technical specifications.</p>
      </header>

      <CardContent className="p-0 flex flex-col lg:flex-row min-h-[850px]">
        {/* Setup Zone (Left) */}
        <div className="lg:w-[450px] border-r border-border/40 bg-muted/5 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
                <div className="p-8 space-y-10">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Layout className="h-3 w-3 text-primary" />
                                    Diagram Protocol
                                </Label>
                                <Controller
                                    name="diagramType"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
                                            <SelectTrigger id="diagramType" className="h-12 bg-background shadow-sm border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl">
                                                <SelectValue placeholder="Select Model Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {diagramTypes.map(type => (
                                                    <SelectItem key={type.value} value={type.value} className="text-xs font-bold uppercase tracking-wider">{type.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Terminal className="h-3 w-3 text-primary" />
                                    Model Specification
                                </Label>
                                <Textarea
                                    id="description"
                                    {...form.register('text')}
                                    rows={12}
                                    placeholder="Describe the logic, sequence, or structure of your system..."
                                    className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-6 leading-relaxed rounded-2xl border-dashed min-h-[300px]"
                                    disabled={mutation.isPending}
                                />
                                {form.formState.errors.text && <p className="text-[9px] font-bold text-destructive uppercase tracking-widest px-2">{form.formState.errors.text.message}</p>}
                            </div>
                        </div>

                        <Button type="submit" disabled={mutation.isPending} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                            {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <GitGraph className="h-5 w-5" />}
                            Initialize Modeling
                        </Button>
                    </form>
                    
                    <div className="p-4 rounded-2xl border bg-muted/10 border-dashed text-center space-y-2">
                        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                            Modeling protocols derive structural schemas using standard UML syntax and technical best practices.
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
                {(mutation.isPending || generatedCode) ? (
                    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                        <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center px-1 sticky top-0 z-10 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    <TabsList className="h-9 rounded-lg bg-muted/30 p-1 gap-1">
                                        <TabsTrigger value="preview" className="gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary transition-all">
                                            <ImageIcon className="h-3.5 w-3.5" /> 
                                            Visual Model
                                        </TabsTrigger>
                                        <TabsTrigger value="code" className="gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary transition-all">
                                            <FileCode className="h-3.5 w-3.5" /> 
                                            Schema Code
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {generatedCode && (
                                        <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                            {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 min-h-0 relative group">
                                <TabsContent value="preview" className="m-0 h-full focus-visible:ring-0">
                                    <div className="h-full rounded-[32px] border bg-white p-10 shadow-2xl relative flex items-center justify-center overflow-auto custom-scrollbar">
                                        {mutation.isPending ? (
                                            <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Modeling Synthesis</p>
                                            </div>
                                        ) : imageUrl ? (
                                            <div className="relative w-full h-full min-h-[500px] transition-transform duration-500 hover:scale-[1.02] cursor-zoom-in">
                                                <Image src={imageUrl} alt="Generated PlantUML Diagram" layout="fill" className="object-contain" unoptimized />
                                            </div>
                                        ) : (
                                            <div className="text-center opacity-40 space-y-3">
                                                <AlertCircle className="h-10 w-10 mx-auto" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest">Render Failure</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="code" className="m-0 h-full focus-visible:ring-0">
                                    <ScrollArea className="h-full rounded-[32px] border bg-[#0d1117] p-8 shadow-2xl relative">
                                        <pre className="text-[13px] whitespace-pre-wrap font-mono leading-relaxed text-blue-100/90 selection:bg-primary/30" dir="ltr">
                                            {generatedCode}
                                        </pre>
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none opacity-60" />
                                    </ScrollArea>
                                </TabsContent>
                            </div>
                        </Tabs>

                        {/* Page Footer Visual */}
                        {!mutation.isPending && (
                            <div className="mt-auto pt-8 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest px-1">
                                <span>Arkan Modeling Engine</span>
                                <span>ARCHITECTURE NODE VERIFIED</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40 space-y-4">
                        <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                            <GitGraph className="h-10 w-10 text-primary/60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Modeling Canvas Ready</h3>
                            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Define the diagram protocol and model specification on the left to begin synthesis.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
