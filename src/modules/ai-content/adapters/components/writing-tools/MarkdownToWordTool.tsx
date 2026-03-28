'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useState, type ComponentPropsWithoutRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/util/use-toast';
import dynamic from 'next/dynamic';
import { DocxTemplateKey, templates } from '@/modules/ai-content/infrastructure/exporters/DocxStyles';
import { apiService } from '@/infrastructure/api/ApiService';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/infrastructure/utils/cn';
import { FileCode, Layout, Terminal, Type, Globe, ListTree, Sparkles, FileText as FileWord } from 'lucide-react';

const markdownToWordSchema = z.object({
  markdown: z.string().min(10, 'Markdown content must be at least 10 characters long.'),
  fileName: z.string().min(1, 'File name is required.').regex(/^[a-zA-Z0-9_-]+$/, 'File name can only contain letters, numbers, underscores, and hyphens.'),
  template: z.enum(['modern', 'classic', 'academic']),
  pageNumbers: z.boolean().default(true),
  addCoverPage: z.boolean().default(false),
  coverPageMarkdown: z.string().optional(),
  isRtl: z.boolean().default(false)
});

type MarkdownToWordFormValues = z.infer<typeof markdownToWordSchema>;

export function MarkdownToWordTool() {
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);
  const form = useForm<MarkdownToWordFormValues>({
    resolver: zodResolver(markdownToWordSchema),
    defaultValues: {
      markdown: '# Hello World\n\nThis is a sample markdown document.',
      fileName: 'document',
      template: 'modern',
      pageNumbers: true,
      addCoverPage: false,
      coverPageMarkdown: '# My Document Title\n\nBy John Doe\n\n{currentDate}',
      isRtl: false
    }
  });
  const addCoverPage = form.watch('addCoverPage');

  async function onSubmit(data: MarkdownToWordFormValues) {
    setIsConverting(true);
    try {
      const options = {
        styles: templates[data.template as DocxTemplateKey].styles,
        customStyles: templates[data.template as DocxTemplateKey].customStyles,
        pageNumbers: data.pageNumbers,
        coverPageMarkdown: data.addCoverPage ? data.coverPageMarkdown : undefined,
        isRtl: data.isRtl
      };
      const blob = await apiService<{ markdown: string; fileName: string; options: typeof options }, Blob>({
        endpoint: '/api/export/docx',
        method: 'POST',
        data: { markdown: data.markdown, fileName: data.fileName, options },
        responseType: 'blob'
      });
      const { saveAs } = await import('file-saver');
      saveAs(blob, `${data.fileName}.docx`);
      toast({ title: 'Conversion Successful', description: `Your file ${data.fileName}.docx has been downloaded.` });
    } catch (error) {
      console.error('Failed to convert markdown to word:', error);
      toast({ title: 'Conversion Failed', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Word Production Manifest</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">Execute structural compilation protocols to derive high-fidelity DOCX documents from markdown logic.</p>
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
                                    Identity & Format
                                </Label>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Input
                                            id="fileName-input"
                                            {...form.register('fileName')}
                                            placeholder="Production File Name"
                                            className="h-10 text-xs bg-background shadow-sm border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl"
                                            disabled={isConverting}
                                        />
                                        {form.formState.errors.fileName && <p className="text-[9px] font-bold text-destructive uppercase tracking-widest px-2">{form.formState.errors.fileName.message}</p>}
                                    </div>
                                    <Select onValueChange={(value: DocxTemplateKey) => form.setValue('template', value as any)} defaultValue={form.getValues('template')} disabled={isConverting}>
                                        <SelectTrigger id="template-select" className="h-10 text-xs bg-background shadow-sm border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl">
                                            <SelectValue placeholder="Production Template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(templates).map((key) => <SelectItem key={key} value={key} className="text-xs font-bold uppercase tracking-wider">{key}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Terminal className="h-3 w-3 text-primary" />
                                    Advanced Protocol
                                </Label>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-background shadow-sm group hover:border-primary/40 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <ListTree className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                                            <Label htmlFor="addCoverPage" className="text-[11px] font-bold uppercase tracking-tighter cursor-pointer">Cover Manifest</Label>
                                        </div>
                                        <Controller name="addCoverPage" control={form.control} render={({ field }) => <Checkbox id="addCoverPage" checked={field.value} onCheckedChange={field.onChange} disabled={isConverting} className="h-4 w-4" />} />
                                    </div>

                                    {addCoverPage && (
                                        <div className="p-4 rounded-2xl border bg-muted/5 space-y-3 animate-in fade-in zoom-in-95 duration-300">
                                            <Label htmlFor="cover-page-markdown-input" className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Cover Logic</Label>
                                            <Textarea
                                                id="cover-page-markdown-input"
                                                {...form.register('coverPageMarkdown')}
                                                rows={4}
                                                placeholder="Enter cover manifest logic..."
                                                className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-3 leading-relaxed rounded-xl border-dashed"
                                                disabled={isConverting}
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-background shadow-sm group hover:border-primary/40 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Type className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                                            <Label htmlFor="pageNumbers" className="text-[11px] font-bold uppercase tracking-tighter cursor-pointer">Pagination HUD</Label>
                                        </div>
                                        <Controller name="pageNumbers" control={form.control} render={({ field }) => <Checkbox id="pageNumbers" checked={field.value} onCheckedChange={field.onChange} disabled={isConverting} className="h-4 w-4" />} />
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-background shadow-sm group hover:border-primary/40 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                                            <Label htmlFor="isRtl" className="text-[11px] font-bold uppercase tracking-tighter cursor-pointer">RTL Alignment</Label>
                                        </div>
                                        <Controller name="isRtl" control={form.control} render={({ field }) => <Checkbox id="isRtl" checked={field.value} onCheckedChange={field.onChange} disabled={isConverting} className="h-4 w-4" />} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={isConverting} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                            {isConverting ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileWord className="h-5 w-5" />}
                            Initialize Compilation
                        </Button>
                    </form>
                </div>
            </ScrollArea>
        </div>

        {/* Results Canvas (Right) */}
        <div className="flex-1 flex flex-col min-h-0 bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-[#f8fafc] dark:bg-black/20 pointer-events-none shadow-inner">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>

            <div className="relative flex-1 flex flex-col min-h-0 p-8 md:p-12">
                <div className="flex flex-col h-full space-y-6">
                    <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Source Logic Manifest</h3>
                        </div>
                    </div>

                    <div className="flex-1 relative group">
                        <ScrollArea className="h-full rounded-[32px] border bg-[#0d1117] p-10 md:p-12 shadow-2xl relative overflow-hidden">
                            {isConverting ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Executing Technical Compilation</p>
                                </div>
                            ) : (
                                <>
                                    <Textarea 
                                        id="markdown-input" 
                                        {...form.register('markdown')} 
                                        className="h-full w-full bg-transparent border-none focus-visible:ring-0 resize-none text-[13px] font-mono leading-relaxed text-blue-100/90 selection:bg-primary/30 min-h-[600px]" 
                                        placeholder="Enter source markdown here..."
                                        dir="ltr"
                                    />
                                    <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center text-[9px] text-white/20 font-bold uppercase tracking-widest">
                                        <span>Arkan Compilation Engine</span>
                                        <span>SCHEMA VERIFIED</span>
                                    </div>
                                </>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none opacity-60" />
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
