'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useImageToPdfLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-image-to-pdf-logic';
import { FileText, Loader2, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { SortableImageItem } from './SortableImageItem';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';
import { Images, Sparkles, CheckCircle2, Download, Bot, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function ImageToPdfTool() {
  const {
    t,
    files,
    setFiles,
    isConverting,
    getRootProps,
    getInputProps,
    isDragActive,
    handleGeneratePdf,
    handleRemoveFile,
  } = useImageToPdfLogic();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">{t('writingTools.imageToPdf.cardTitle')}</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">{t('writingTools.imageToPdf.cardDescription')}</p>
      </header>

      <CardContent className="p-0 flex flex-col lg:flex-row min-h-[800px]">
        {/* Setup Zone (Left) */}
        <div className="lg:w-[450px] border-r border-border/40 bg-muted/5 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
                <div className="p-8 space-y-10">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                <Images className="h-3 w-3 text-primary" />
                                Visual Ingestion
                            </Label>

                            <div {...getRootProps()} className={cn(
                                "border-2 border-dashed rounded-[32px] p-16 text-center cursor-pointer transition-all duration-300 group bg-background shadow-inner",
                                isDragActive ? "border-primary bg-primary/[0.03] ring-8 ring-primary/5" : "border-border/60 hover:border-primary/40 hover:bg-muted/5"
                            )}>
                                <input {...getInputProps()} />
                                <div className="relative mx-auto h-16 w-16 mb-6">
                                    <UploadCloud className={cn(
                                        "h-16 w-16 transition-colors text-muted-foreground group-hover:text-primary/60",
                                        isDragActive && "text-primary"
                                    )} />
                                    {!isDragActive && (
                                        <Plus className="absolute -bottom-1 -right-1 h-5 w-5 text-primary bg-background rounded-full p-1 border shadow-sm" />
                                    )}
                                </div>
                                <h4 className="text-sm font-bold uppercase tracking-widest mb-2">{isDragActive ? "Drop Assets Now" : "Load Visuals"}</h4>
                                <p className="text-[11px] text-muted-foreground italic max-w-xs mx-auto leading-relaxed px-4">
                                    {t('writingTools.imageToPdf.dropzoneSubtitle')}
                                </p>
                                <Badge variant="outline" className="mt-6 h-5 text-[8px] uppercase tracking-tighter border-border/60">Forensic Scan Ready</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-10">
                        <Button
                            onClick={handleGeneratePdf}
                            disabled={isConverting || files.length === 0}
                            className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all"
                        >
                            {isConverting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                            {isConverting ? t('writingTools.imageToPdf.convertingButton') : "Initialize PDF Build"}
                        </Button>

                        <div className="p-4 rounded-2xl border bg-muted/10 border-dashed text-center space-y-2 mt-6">
                            <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                                Images are compiled with lossless compression and structural alignment for professional output.
                            </p>
                        </div>
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
                {files.length > 0 ? (
                    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                        <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Visual Manifest</h3>
                            </div>
                            <Badge variant="secondary" className="h-5 text-[9px] font-bold px-2 border-none bg-primary/10 text-primary">
                                {files.length} Assets Synchronized
                            </Badge>
                        </div>

                        <ScrollArea className="flex-1 rounded-[32px] border bg-card p-8 md:p-10 shadow-2xl relative group">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={files.map(f => f.id)} strategy={rectSortingStrategy}>
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {files.map((file) => (
                                            <div key={file.id} className="animate-in fade-in zoom-in-95 duration-500">
                                                <SortableImageItem file={file} onRemove={handleRemoveFile} />
                                            </div>
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            {/* Page Footer Visual */}
                            <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                <span>Arkan Imaging Engine</span>
                                <span>VERIFIED COMPILATION</span>
                            </div>
                        </ScrollArea>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40 space-y-4">
                        <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                            <Images className="h-10 w-10 text-primary/60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Imaging Canvas Ready</h3>
                            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Load visual assets on the left to begin structural PDF compilation.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
