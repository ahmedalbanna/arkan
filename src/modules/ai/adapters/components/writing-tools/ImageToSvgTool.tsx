'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useImageToSvgLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-image-to-svg-logic';
import { Check, Copy, Download, Image as ImageIcon, Loader2, Sparkles, UploadCloud, Zap, Layout, CheckCircle2, ImageUp } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/infrastructure/utils/cn';

export function ImageToSvgTool() {
  const {
    form,
    onSubmit,
    mutation,
    getRootProps,
    getInputProps,
    isDragActive,
    previewImage,
    svgResult,
    isCopied,
    handleCopy,
    handleDownload,
  } = useImageToSvgLogic();

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Vector Synthesis Manifest</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">Execute structural vectorization protocols to derive high-fidelity scalable manifests from raster assets.</p>
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
                                    <ImageIcon className="h-3 w-3 text-primary" />
                                    Source Asset
                                </Label>
                                <div {...getRootProps()} className={cn(
                                    "border-2 border-dashed rounded-[32px] p-12 text-center cursor-pointer transition-all duration-300 group bg-background shadow-inner",
                                    isDragActive ? "border-primary bg-primary/[0.03] ring-8 ring-primary/5" : "border-border/60 hover:border-primary/40 hover:bg-muted/5"
                                )}>
                                    <input {...getInputProps()} />
                                    <div className="relative mx-auto h-16 w-16 mb-6">
                                        <UploadCloud className={cn(
                                            "h-16 w-16 transition-colors text-muted-foreground group-hover:text-primary/60",
                                            isDragActive && "text-primary"
                                        )} />
                                    </div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest mb-2">{isDragActive ? "Drop Asset Now" : "Load Raster"}</h4>
                                    <p className="text-[11px] text-muted-foreground italic max-w-xs mx-auto leading-relaxed">
                                        {previewImage ? "Ready for vectorization" : "Select high-resolution raster source"}
                                    </p>
                                    {previewImage && (
                                        <div className="mt-6 relative h-24 w-24 mx-auto rounded-xl overflow-hidden shadow-lg border-2 border-white ring-1 ring-black/5 animate-in zoom-in-50">
                                            <Image src={previewImage} alt="Preview" layout="fill" className="object-contain" />
                                        </div>
                                    )}
                                </div>
                                {form.formState.errors.file && <p className="text-[9px] font-bold text-destructive uppercase tracking-widest px-2">{form.formState.errors.file.message as string}</p>}
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Layout className="h-3 w-3 text-primary" />
                                    Vector Protocol
                                </Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-bold uppercase text-muted-foreground/40 ml-1">Algorithm</Label>
                                        <Select name="mode" defaultValue="flat" onValueChange={(v) => form.setValue('mode', v as any)}>
                                            <SelectTrigger className="h-10 text-xs bg-background ring-1 ring-border/40 border-none rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="flat" className="text-xs">Flat (Shape)</SelectItem>
                                                <SelectItem value="line" className="text-xs">Line (Outline)</SelectItem>
                                                <SelectItem value="lowpoly" className="text-xs">Low Poly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-bold uppercase text-muted-foreground/40 ml-1">Precision</Label>
                                        <Select name="quality" onValueChange={(v) => form.setValue('quality', v as any)}>
                                            <SelectTrigger className="h-10 text-xs bg-background ring-1 ring-border/40 border-none rounded-xl">
                                                <SelectValue placeholder="Preset" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low" className="text-xs text-destructive">Draft</SelectItem>
                                                <SelectItem value="medium" className="text-xs text-primary">Balanced</SelectItem>
                                                <SelectItem value="high" className="text-xs text-green-600 font-bold">Production</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Zap className="h-3 w-3 text-primary" />
                                    Parameter Logic
                                </Label>
                                <Accordion type="multiple" className="w-full space-y-2">
                                    <AccordionItem value="flat" className="border rounded-xl bg-background overflow-hidden px-4 py-1">
                                        <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest hover:no-underline">Flat Matrix</AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-4 pb-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[8px] font-black uppercase text-muted-foreground/40">Color Depth</Label>
                                                    <Input type="number" {...form.register('colors', { valueAsNumber: true })} defaultValue="8" min="2" max="32" className="h-8 text-xs bg-muted/5 border-none shadow-inner" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[8px] font-black uppercase text-muted-foreground/40">Min Area</Label>
                                                    <Input type="number" {...form.register('min_area', { valueAsNumber: true })} defaultValue="20" min="1" className="h-8 text-xs bg-muted/5 border-none shadow-inner" />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="line" className="border rounded-xl bg-background overflow-hidden px-4 py-1">
                                        <AccordionTrigger className="text-[10px] font-bold uppercase tracking-widest hover:no-underline">Line Schema</AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-4 pb-6">
                                            <div className="grid grid-cols-1 gap-2">
                                                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/5">
                                                    <Label className="text-[9px] font-bold uppercase tracking-tighter cursor-pointer" htmlFor="adaptive">Adaptive</Label>
                                                    <Checkbox id="adaptive" {...form.register('adaptive')} defaultChecked={false} className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/5">
                                                    <Label className="text-[9px] font-bold uppercase tracking-tighter cursor-pointer" htmlFor="centerline">Centerline</Label>
                                                    <Checkbox id="centerline" {...form.register('centerline')} defaultChecked={true} className="h-3.5 w-3.5" />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        </div>

                        <Button type="submit" disabled={mutation.isPending} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                            {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                            Initialize Vectorization
                        </Button>
                    </form>
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
                {(mutation.isPending || svgResult) ? (
                    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                        <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Vector Manifest</h3>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!svgResult} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                    {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleDownload} disabled={!svgResult} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 rounded-[32px] border bg-card shadow-2xl relative group overflow-hidden">
                            {mutation.isPending ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Vector Synthesis</p>
                                </div>
                            ) : (
                                <Tabs defaultValue="preview" className="h-full flex flex-col min-h-0">
                                    <div className="flex justify-center py-4 border-b bg-muted/5">
                                        <TabsList className="h-8 rounded-lg bg-muted/30 p-1 gap-1">
                                            <TabsTrigger value="preview" className="px-4 text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary transition-all">Visual Model</TabsTrigger>
                                            <TabsTrigger value="code" className="px-4 text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary transition-all">Schema Code</TabsTrigger>
                                        </TabsList>
                                    </div>
                                    <div className="flex-1 min-h-0">
                                        <TabsContent value="preview" className="m-0 h-full p-10 flex items-center justify-center bg-white relative">
                                            {/* Diagnostic Grid overlay for SVG */}
                                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                            <div dangerouslySetInnerHTML={{ __html: svgResult }} className="relative z-10 w-full h-full max-h-[500px] transition-transform duration-700 hover:scale-[1.02]" />
                                        </TabsContent>
                                        <TabsContent value="code" className="m-0 h-full">
                                            <div className="h-full bg-[#0d1117] p-8 relative">
                                                <pre className="text-[12px] whitespace-pre-wrap font-mono leading-relaxed text-blue-100/90 selection:bg-primary/30 h-full" dir="ltr">
                                                    {svgResult}
                                                </pre>
                                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none opacity-60" />
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            )}
                            
                            {/* Page Footer Visual */}
                            {!mutation.isPending && (
                                <div className="absolute bottom-8 left-8 right-8 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest pointer-events-none">
                                    <span>Arkan Vector Engine</span>
                                    <span>SCALABLE NODE VERIFIED</span>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40 space-y-4">
                        <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                            <ImageUp className="h-10 w-10 text-primary/60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vector Canvas Ready</h3>
                            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Load a raster asset on the left to begin structural vectorization.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
