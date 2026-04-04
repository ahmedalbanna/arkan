'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { useLocalization } from "@/context/LocalizationContext";
import { useBuilderStore, useToast } from '@/hooks';
import { v4 as uuidv4 } from 'uuid';
import { type ExternalContextType } from '@/modules/ai-content/domain/entities/ControlTypes';
import { cn } from "@/infrastructure/utils/cn";
import { AtomIcon, FileText, ImageIcon, Loader2, Plus, UploadCloud, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PdfPreview } from './PdfPreview';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import AnalystAgent from "./AnalystAgent";
import { FileContentViewer } from './FileContentViewer';
import { SidebarContainer } from '../../builder/layout/SidebarContainer';
// Extracted ViewContextDialog component
function ViewContextDialog({ item }: { item: { fileName: string, content: string } }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" title="View Content">
                    <ImageIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[90vh]">
                <DialogHeader><DialogTitle>{item.fileName}</DialogTitle></DialogHeader>
                <div className="h-full overflow-y-auto">
                    <FileContentViewer fileName={item.fileName} content={item.content} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Main UploadManager component
export default function UploadManager() {
    const { t } = useLocalization();
    const { toast } = useToast();
    const { project, updateProject, selectedFileId, selectFile } = useBuilderStore();
    const [isLoading, setIsLoading] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [textFileName, setTextFileName] = useState('');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setIsLoading(true);
        for (const file of acceptedFiles) {
            const reader = new FileReader();

            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => {
                console.log('file reading has failed');
                toast({ title: t('builder.files.toasts.fileReadError'), description: t('builder.files.toasts.fileReadErrorDesc'), variant: 'destructive' });
            };
            reader.onload = () => {
                const content = reader.result as string;
                updateProject(p => p.addExternalContext({ fileName: file.name, content, type: 'context' }, uuidv4()));
                toast({ title: t('builder.files.toasts.fileAdded'), description: t('builder.files.toasts.fileAddedDesc', { fileName: file.name }) });
            };

            const isTextFile = file.type.startsWith('text/') || file.name.endsWith('.md');
            if (isTextFile) {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }
        }
        setIsLoading(false);
    }, [updateProject, toast, t]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
        }
    });

    function handleAddPastedText() {
        if (!textInput.trim() || !textFileName.trim()) {
            toast({
                title: t('builder.files.toasts.missingInfoToastTitle'),
                description: t('builder.files.toasts.missingInfoToastDesc'),
                variant: "destructive"
            });
            return;
        }
        updateProject(p => p.addExternalContext({
            fileName: `${textFileName.trim()}.md`,
            content: textInput,
            type: 'context',
        }, uuidv4()));
        toast({ title: t('builder.files.toasts.contextAddedToastTitle'), description: t('builder.files.toasts.contextAddedToastDesc', { fileName: `${textFileName.trim()}.md` }) });
        setTextInput('');
        setTextFileName('');
    }

    const externalContext = project?.externalContext || [];
    const fileTypes: ExternalContextType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];



    return (
        <SidebarContainer
            title={t('builder.tabs.files')}
            icon={<UploadCloud className="h-3 w-3" />}
        >
            <Tabs defaultValue="files" className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <TabsList className="grid w-full grid-cols-2 h-10 rounded-xl bg-muted/20 p-1 gap-1 border border-border/40 backdrop-blur-md">
                    <TabsTrigger value="files" className="text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md px-2 transition-all rounded-lg">
                        {t('builder.tabs.files')}
                    </TabsTrigger>
                    <TabsTrigger value="analyst" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md px-2 transition-all rounded-lg">
                        <AtomIcon className="h-3 w-3 shrink-0" />
                        Analyst
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="files" className="flex-grow flex flex-col gap-8 m-0 focus-visible:ring-0">
                    <div className="flex flex-col space-y-1">
                        <p className="text-[10px] text-muted-foreground italic leading-relaxed font-medium opacity-80">
                            {t('builder.fileManager.description')}
                        </p>
                    </div>

                    <div className="flex flex-col gap-8">
                        <Tabs defaultValue="upload" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-8 rounded-xl bg-muted/20 p-1 gap-1 border border-border/40 h-auto">
                                <TabsTrigger value="upload" className="text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-2 transition-all rounded-lg">{t('builder.files.uploadFilesTab')}</TabsTrigger>
                                <TabsTrigger value="text" className="text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-2 transition-all rounded-lg">{t('builder.files.pasteTextTab')}</TabsTrigger>
                            </TabsList>

                            <TabsContent value="upload" className="mt-4 m-0 focus-visible:ring-0">
                                <div {...getRootProps()} className={cn(
                                    "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group bg-muted/5 shadow-inner",
                                    isDragActive ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-primary/10 hover:border-primary/30 hover:bg-muted/10"
                                )}>
                                    <input {...getInputProps()} />
                                    <div className="relative mx-auto h-10 w-10 mb-3">
                                        {isLoading ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-primary/40 mx-auto" />
                                        ) : (
                                            <>
                                                <UploadCloud className={cn(
                                                    "h-8 w-8 mx-auto transition-colors",
                                                    isDragActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/60"
                                                )} />
                                                {!isDragActive && (
                                                    <Plus className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 text-primary bg-background rounded-full p-0.5 border shadow-sm" />
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">{isDragActive ? t('builder.files.toasts.dropHere') : t('builder.files.dropzoneLabel')}</p>
                                    <p className="mt-1 text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-wider">{t('builder.files.dropzoneHint')}</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="text" className="mt-4 space-y-4 m-0 focus-visible:ring-0">
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="context-name" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t('builder.files.pasteText.titleLabel')}</Label>
                                        <Input id="context-name" placeholder={t('builder.files.pasteText.titlePlaceholder')} value={textFileName} onChange={(e: any) => setTextFileName(e.target.value)} className="h-10 text-[11px] font-bold bg-muted/5 border-border/40 focus-visible:ring-primary/20 rounded-xl transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="context-text" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t('builder.files.pasteText.contentLabel')}</Label>
                                        <Textarea id="context-text" placeholder={t('builder.files.pasteText.contentPlaceholder')} value={textInput} onChange={(e: any) => setTextInput(e.target.value)} rows={4} className="text-[11px] bg-muted/5 border-border/40 focus-visible:ring-primary/20 rounded-xl transition-all resize-none p-3 leading-relaxed font-serif italic" />
                                    </div>
                                </div>
                                <Button onClick={handleAddPastedText} disabled={!textInput.trim() || !textFileName.trim()} className="w-full h-10 text-[10px] font-black uppercase tracking-[0.2em] gap-2 shadow-xl shadow-primary/10 rounded-xl bg-primary">
                                    <Plus className="h-3.5 w-3.5" />
                                    {t('builder.files.pasteText.addButton')}
                                </Button>
                            </TabsContent>
                        </Tabs>

                        {externalContext.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t('builder.files.toasts.uploadedContext')}</h3>
                                    <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums px-2 rounded-full">{externalContext.length}</Badge>
                                </div>
                                <div className="space-y-2">
                                    {externalContext.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "group flex flex-col gap-2 p-3 rounded-xl border bg-card/40 hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:translate-x-0.5",
                                                selectedFileId === item.id ? 'border-primary/30 bg-primary/[0.03] ring-1 ring-primary/10 shadow-md' : 'border-border/40'
                                            )}
                                            onClick={() => selectFile(item.id)}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors border border-transparent group-hover:border-primary/10">
                                                        <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <span className="truncate font-bold text-xs tracking-tight" title={item.fileName}>{item.fileName}</span>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div onClick={e => e.stopPropagation()}><ViewContextDialog item={item} /></div>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10 rounded-lg" onClick={(e: any) => { e.stopPropagation(); updateProject(p => p.removeExternalContext(index)) }}>
                                                        <X className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-0.5 px-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.1em]">Type:</span>
                                                    <Select value={item.type} onValueChange={(value: ExternalContextType) => {
                                                        updateProject(p => p.updateExternalContextType(index, value));
                                                        // event?.stopPropagation() was not accessible here in previous version either
                                                    }}>
                                                        <SelectTrigger className="text-[9px] h-5 w-auto p-0 border-0 bg-transparent focus:ring-0 font-black text-primary uppercase tracking-[0.1em] hover:opacity-80 transition-opacity">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="border-border/40 rounded-xl">
                                                            {fileTypes.map(type => <SelectItem key={type} value={type} className="capitalize text-[11px] font-medium">{type}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Badge variant="outline" className="h-4 text-[8px] uppercase tracking-widest font-black text-muted-foreground/60 border-border/40 bg-muted/5 px-1.5 rounded-md">
                                                    {item.content.length > 1024 ? `${(item.content.length / 1024).toFixed(1)} KB` : `${item.content.length} CH`}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="analyst" className="flex-grow min-h-0 m-0 focus-visible:ring-0">
                    <AnalystAgent />
                </TabsContent>
            </Tabs>
        </SidebarContainer>
    );
}
