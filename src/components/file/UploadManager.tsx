
'use client';

import { PdfPreview } from '@/components/file/PdfPreview';
import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useToast } from '@/hooks';
import { markdownComponents } from '@/lib/markdown-styles';
import { type ContextFileType } from '@/lib/models/context-file';
import { cn } from '@/lib/utils';
import { processFileApi } from '@/services';
import { FileText, ImageIcon, Loader2, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import { PasteTextUploader } from './PasteTextUploader';

interface UploadManagerProps {
    onCollapseToggle: () => void;
}

function ViewContextDialog({ item }: { item: { fileName: string, content: string, type: ContextFileType } }) {
    const isDataUri = item.content.startsWith('data:');
    const isImage = isDataUri && item.content.startsWith('data:image');
    const isPdf = isDataUri && item.content.startsWith('data:application/pdf');

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
                    {isImage ? (
                        <Image src={item.content} alt={item.fileName} width={500} height={700} className="mx-auto" />
                    ) : isPdf ? (
                        <PdfPreview fileUri={item.content} />
                    ) : !isDataUri ? (
                        <ScrollArea className="h-full rounded-md border p-4">
                            <ReactMarkdown components={markdownComponents}>{item.content}</ReactMarkdown>
                        </ScrollArea>
                    ) : (
                        <p className="text-muted-foreground p-8 text-center">Preview for this file type is not available. Please process the file to view its content.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function FileDropzone() {
    const { t } = useLocalization();
    const { toast } = useToast();
    const { firebaseUser, refetchUser } = useAuth();
    const { updateProject } = useBuilderStore();
    const [isLoading, setIsLoading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!firebaseUser) {
            toast({ title: t('builder.files.toasts.authError'), variant: "destructive" });
            return;
        }

        setIsLoading(true);
        for (const file of acceptedFiles) {
            try {
                const token = await firebaseUser.getIdToken();
                const formData = new FormData();
                formData.append('file', file);
                const result = await processFileApi({ file: formData }, token);
                // Updated to use the new ContextManager
                updateProject(p => {
                    const markdownFileName = file.name.replace(/\.[^/.]+$/, ".md");
                    p.contextManager.add(markdownFileName, result.markdown, 'context');
                });
                toast({ title: t('builder.files.toasts.fileAdded'), description: t('builder.files.toasts.fileAddedDesc').replace('{fileName}', file.name) });
                refetchUser();
            } catch (error: any) {
                toast({ title: t('builder.files.toasts.uploadFailed'), description: error.message, variant: "destructive" });
            }
        }
        setIsLoading(false);
    }, [firebaseUser, updateProject, toast, refetchUser, t]);

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

    return (
        <Card
            {...getRootProps()}
            className={`border-2 border-dashed ${isDragActive ? 'border-primary bg-accent' : 'border-border'
                } hover:border-primary/80 transition-colors cursor-pointer`}
        >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <input {...getInputProps()} />
                {isLoading ? (
                    <>
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="mt-2 text-sm text-muted-foreground">{t('builder.files.toasts.processingFile')}</p>
                    </>
                ) : (
                    <>
                        <UploadCloud className="h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-sm font-semibold">
                            {isDragActive ? t('builder.files.toasts.dropHere') : t('builder.files.dropzoneLabel')}
                        </p>
                        <p className="text-xs text-muted-foreground">{t('builder.files.dropzoneHint')}</p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export function UploadManager({ onCollapseToggle }: UploadManagerProps) {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();

    // Updated to use the new ContextManager
    const externalContext = project ? project.contextManager.getAll() : [];

    const handleRemoveContext = (index: number) => {
        updateProject(p => { p.contextManager.remove(index); });
    };

    const handleUpdateContextType = (index: number, type: ContextFileType) => {
        updateProject(p => { p.contextManager.updateType(index, type); });
    };

    const fileTypes: ContextFileType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];

    return (
        <div className="space-y-4">
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <Tabs defaultValue="upload" className="w-full">

                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                            value="upload"
                            className="transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:shadow-glow"
                        >
                            <UploadCloud className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">{t('builder.files.uploadFilesTab')}</span>
                            <span className="sm:hidden">Upload</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="text"
                            className="transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:shadow-glow"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">{t('builder.files.pasteTextTab')}</span>
                            <span className="sm:hidden">Text</span>
                        </TabsTrigger>
                    </TabsList>


                    <TabsContent value="upload" className="mt-4">
                        <AnimatedContainer animation="fade-in-up" delay={400}>
                            <FileDropzone />
                        </AnimatedContainer>
                    </TabsContent>
                    <TabsContent value="text" className="mt-4">
                        <AnimatedContainer animation="fade-in-up" delay={400}>
                            <PasteTextUploader />
                        </AnimatedContainer>
                    </TabsContent>
                </Tabs>
            </AnimatedContainer>
            {externalContext && externalContext.length > 0 && (
                <AnimatedContainer animation="fade-in-up" delay={600}>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-primary/10">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                                {t('builder.files.toasts.uploadedContext')} ({externalContext.length})
                            </h3>
                        </div>
                        <ScrollArea className="border rounded-lg">
                            <ul className="space-y-1 list-none p-2">
                                {externalContext.map((item, index) => {
                                    return (
                                        <li key={index} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors group">
                                            <div className="flex items-center gap-3 truncate">
                                                <div className="p-1 rounded bg-muted/50 group-hover:bg-primary/10 transition-colors">
                                                    <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <span className="truncate font-medium text-sm" style={{ maxWidth: '200px' }}>
                                                    {item.fileName}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Select value={item.type} onValueChange={(value: ContextFileType) => handleUpdateContextType(index, value)}>
                                                    <SelectTrigger className={cn("text-xs h-7 w-auto p-0 border-0 bg-transparent focus:ring-0", {
                                                        'text-blue-800 dark:text-blue-200': item.type === 'context',
                                                        'text-green-800 dark:text-green-200': item.type === 'example',
                                                        'text-yellow-800 dark:text-yellow-200': item.type === 'question',
                                                        'text-purple-800 dark:text-purple-200': item.type === 'textbook',
                                                        'text-gray-800 dark:text-gray-200': item.type === 'guidelines',
                                                    })}>
                                                        <SelectValue asChild>
                                                            <Badge variant="secondary" className={cn("capitalize cursor-pointer", {
                                                                'bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800': item.type === 'context',
                                                                'bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-800': item.type === 'example',
                                                                'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800': item.type === 'question',
                                                                'bg-purple-100 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800': item.type === 'textbook',
                                                                'bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600': item.type === 'guidelines',
                                                            })}>
                                                                {item.type}
                                                            </Badge>
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fileTypes.map(type => (
                                                            <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <ViewContextDialog item={item} />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                    onClick={() => handleRemoveContext(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </ScrollArea>
                    </div>
                </AnimatedContainer>
            )}

        </div>
    );
}
