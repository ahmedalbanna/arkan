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
import { ExternalContextType } from '@/lib/models';
import { cn } from "@/lib/utils/cn";
import { AtomIcon, FileText, ImageIcon, Loader2, UploadCloud, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { ScrollArea } from "../../ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";
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

            reader.onabort = () => {
                // File reading was aborted
            };
            reader.onerror = () => {
                toast({ title: 'Error', description: 'Failed to read file', variant: 'destructive' });
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
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="files">{t('builder.tabs.files')}</TabsTrigger>
                <TabsTrigger value="analyst">
                    <AtomIcon className="h-4 w-4 me-2" />
                    Analyst
                </TabsTrigger>
            </TabsList>
            <TabsContent value="files" className="flex-grow flex flex-col min-h-0">
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>{t('builder.files.fileManagerTitle')}</CardTitle>
                        </div>
                        <CardDescription>
                            {t('builder.files.fileManagerDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col gap-4 min-h-0">
                        <Tabs defaultValue="upload" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upload">{t('builder.files.uploadFilesTab')}</TabsTrigger>
                                <TabsTrigger value="text">{t('builder.files.pasteTextTab')}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload" className="mt-4">
                                <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-accent' : 'border-border'}`}>
                                    <input {...getInputProps()} />
                                    {isLoading ? (
                                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                                    ) : (
                                        <UploadCloud className="h-10 w-10 text-muted-foreground mx-auto" />
                                    )}
                                    <p className="mt-2 text-sm font-semibold">{isDragActive ? t('builder.files.toasts.dropHere') : t('builder.files.dropzoneLabel')}</p>
                                    <p className="text-xs text-muted-foreground">{t('builder.files.dropzoneHint')}</p>
                                </div>
                            </TabsContent>
                            <TabsContent value="text" className="mt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="context-name">{t('builder.files.pasteText.titleLabel')}</Label>
                                    <Input id="context-name" placeholder={t('builder.files.pasteText.titlePlaceholder')} value={textFileName} onChange={(e) => setTextFileName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="context-text">{t('builder.files.pasteText.contentLabel')}</Label>
                                    <Textarea id="context-text" placeholder={t('builder.files.pasteText.contentPlaceholder')} value={textInput} onChange={(e) => setTextInput(e.target.value)} rows={6} />
                                </div>
                                <Button onClick={handleAddPastedText} disabled={!textInput.trim() || !textFileName.trim()} className="w-full">
                                    {t('builder.files.pasteText.addButton')}
                                </Button>
                            </TabsContent>
                        </Tabs>
                        {externalContext.length > 0 && (
                            <div className="space-y-2 flex-grow flex flex-col min-h-0 pt-4 border-t">
                                <h3 className="text-sm font-medium text-muted-foreground">{t('builder.files.toasts.uploadedContext')}</h3>
                                <ScrollArea className="flex-grow">
                                    <ul className="space-y-1 list-none p-1">
                                        {externalContext.map((item, index) => (
                                            <li
                                                key={item.id}
                                                className={cn(
                                                    "flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors cursor-pointer",
                                                    selectedFileId === item.id && 'bg-muted'
                                                )}
                                                onClick={() => selectFile(item.id)}
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    <span className="truncate font-medium text-sm" title={item.fileName}>{item.fileName}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Select value={item.type} onValueChange={(value: ExternalContextType) => {
                                                        updateProject(p => p.updateExternalContextType(index, value));
                                                        // Prevent li's onClick from firing
                                                        event?.stopPropagation();
                                                    }}>
                                                        <SelectTrigger className="text-xs h-7 w-auto p-0 border-0 bg-transparent focus:ring-0">
                                                            <SelectValue asChild>
                                                                <Badge variant="outline" className="capitalize cursor-pointer">{item.type}</Badge>
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fileTypes.map(type => <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <div onClick={e => e.stopPropagation()}><ViewContextDialog item={item} /></div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); updateProject(p => p.removeExternalContext(index)) }}><X className="h-4 w-4 text-destructive" /></Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </ScrollArea>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="analyst" className="flex-grow min-h-0">
                <AnalystAgent />
            </TabsContent>
        </Tabs>
    );
}
