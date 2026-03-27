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
                updateProject(p => p.addExternalContext({ fileName: file.name, content, type: 'context' }));
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
        }));
        toast({ title: t('builder.files.toasts.contextAddedToastTitle'), description: t('builder.files.toasts.contextAddedToastDesc', { fileName: `${textFileName.trim()}.md` }) });
        setTextInput('');
        setTextFileName('');
    }

    const externalContext = project?.externalContext || [];
    const fileTypes: ExternalContextType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];

    return (
        <Tabs defaultValue="files" className="h-full flex flex-col">
            <div className="px-4 pt-4">
                <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted/20 p-1 gap-1">
                    <TabsTrigger value="files" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        {t('builder.tabs.files')}
                    </TabsTrigger>
                    <TabsTrigger value="analyst" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <AtomIcon className="h-3.5 w-3.5 me-2 text-primary"/>
                        Analyst
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="files" className="flex-grow flex flex-col min-h-0 p-4 pt-6">
                <div className="space-y-1.5 mb-6">
                    <h4 className="text-sm font-semibold tracking-tight">{t('builder.files.fileManagerTitle')}</h4>
                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">{t('builder.files.fileManagerDesc')}</p>
                </div>

                <div className="flex-grow flex flex-col gap-6 min-h-0">
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-8 rounded-md bg-muted/30 p-0.5">
                            <TabsTrigger value="upload" className="text-[10px] font-bold uppercase">{t('builder.files.uploadFilesTab')}</TabsTrigger>
                            <TabsTrigger value="text" className="text-[10px] font-bold uppercase">{t('builder.files.pasteTextTab')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="mt-4">
                            <div {...getRootProps()} className={cn(
                                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 group bg-muted/5",
                                isDragActive ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border hover:border-primary/40 hover:bg-muted/10"
                            )}>
                                <input {...getInputProps()} />
                                <div className="relative mx-auto h-12 w-12 mb-4">
                                    {isLoading ? (
                                        <Loader2 className="h-10 w-10 animate-spin text-primary/40 mx-auto" />
                                    ) : (
                                        <>
                                            <UploadCloud className={cn(
                                                "h-10 w-10 mx-auto transition-colors",
                                                isDragActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/60"
                                            )} />
                                            {!isDragActive && (
                                                <Plus className="absolute -bottom-1 -right-1 h-4 w-4 text-primary bg-background rounded-full p-0.5 border shadow-sm" />
                                            )}
                                        </>
                                    )}
                                </div>
                                <p className="text-[11px] font-bold uppercase tracking-wider">{isDragActive ? t('builder.files.toasts.dropHere') : t('builder.files.dropzoneLabel')}</p>
                                <p className="mt-1 text-[10px] text-muted-foreground italic">{t('builder.files.dropzoneHint')}</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="text" className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="context-name" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('builder.files.pasteText.titleLabel')}</Label>
                                <Input id="context-name" placeholder={t('builder.files.pasteText.titlePlaceholder')} value={textFileName} onChange={(e: any) => setTextFileName(e.target.value)} className="h-8 text-xs bg-background" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="context-text" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('builder.files.pasteText.contentLabel')}</Label>
                                <Textarea id="context-text" placeholder={t('builder.files.pasteText.contentPlaceholder')} value={textInput} onChange={(e: any) => setTextInput(e.target.value)} rows={4} className="text-xs bg-background resize-none p-3" />
                            </div>
                            <Button onClick={handleAddPastedText} disabled={!textInput.trim() || !textFileName.trim()} size="sm" className="w-full font-bold h-9">
                                {t('builder.files.pasteText.addButton')}
                            </Button>
                        </TabsContent>
                    </Tabs>

                    {externalContext.length > 0 && (
                        <div className="flex-grow flex flex-col min-h-0 space-y-4 pt-4 border-t border-border/40">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('builder.files.toasts.uploadedContext')}</h3>
                                <Badge variant="secondary" className="h-4.5 text-[9px] px-1.5">{externalContext.length}</Badge>
                            </div>
                            <ScrollArea className="flex-grow pr-4 -mr-4">
                                <div className="space-y-2 pb-20">
                                    {externalContext.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "group flex flex-col gap-2 p-3 rounded-lg border bg-card hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md",
                                                selectedFileId === item.id && 'border-primary bg-primary/[0.02] ring-1 ring-primary/10'
                                            )}
                                            onClick={() => selectFile(item.id)}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <div className="h-7 w-7 rounded-md bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                                        <FileText className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <span className="truncate font-bold text-xs tracking-tight" title={item.fileName}>{item.fileName}</span>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div onClick={e => e.stopPropagation()}><ViewContextDialog item={item} /></div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive/10" onClick={(e: any) => { e.stopPropagation(); updateProject(p => p.removeExternalContext(index)) }}>
                                                        <X className="h-3.5 w-3.5 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Usage Context:</span>
                                                    <Select value={item.type} onValueChange={(value: ExternalContextType) => {
                                                        updateProject(p => p.updateExternalContextType(index, value));
                                                        // Prevent li's onClick from firing
                                                        event?.stopPropagation();
                                                    }}>
                                                        <SelectTrigger className="text-[10px] h-5 w-auto p-0 border-0 bg-transparent focus:ring-0 font-bold text-primary uppercase tracking-wider">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fileTypes.map(type => <SelectItem key={type} value={type} className="capitalize text-xs">{type}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Badge variant="outline" className="h-4 text-[8px] uppercase tracking-tighter font-normal text-muted-foreground border-border/60">
                                                    {item.content.length > 1000 ? `${(item.content.length / 1024).toFixed(1)} KB` : `${item.content.length} chars`}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="analyst" className="flex-grow min-h-0 p-4 pt-6">
                <AnalystAgent />
            </TabsContent>
        </Tabs>
    );
}
