
'use client';

import { PdfPreview } from '@/components/file/PdfPreview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useToast } from '@/hooks';
import { ExternalContextType } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { processFileApi } from '@/services';
import { AtomIcon, FileText, ImageIcon, Loader2, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import { PasteTextUploader } from './PasteTextUploader';

interface UploadManagerProps {

}

function ViewContextDialog({ item }: { item: { fileName: string, content: string, type: ExternalContextType } }) {
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
                const result = await processFileApi(formData, token);
                updateProject(p => {
                    p.addExternalContext({
                        fileName: file.name.replace(/\.[^/.]+$/, ".md"),
                        content: result.markdown,
                        type: 'context'
                    });
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

export function UploadManager() {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();

    const externalContext = project?.externalContext || [];

    const removeExternalContext = (index: number) => {
        updateProject(p => { p.removeExternalContext(index); });
    };

    const updateExternalContextType = (index: number, type: ExternalContextType) => {
        updateProject(p => { p.updateExternalContextType(index, type); });
    };

    const fileTypes: ExternalContextType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{t('builder.files.fileManagerTitle')}</CardTitle>
                    <Button variant="ghost" size="icon" className="hidden lg:inline-flex">
                        <AtomIcon className="h-5 w-5" />
                    </Button>
                </div>
                <CardDescription>
                    {t('builder.files.fileManagerDesc')}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4">
                <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">{t('builder.files.uploadFilesTab')}</TabsTrigger>
                        <TabsTrigger value="text">{t('builder.files.pasteTextTab')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="mt-4">
                        <FileDropzone />
                    </TabsContent>
                    <TabsContent value="text" className="mt-4">
                        <PasteTextUploader />
                    </TabsContent>
                </Tabs>

                {externalContext && externalContext.length > 0 && (
                    <div className="space-y-2 flex-grow flex flex-col min-h-0">
                        <h3 className="text-sm font-medium text-muted-foreground">{t('builder.files.toasts.uploadedContext')}</h3>
                        <ScrollArea className="flex-grow border rounded-lg">
                            <ul className="space-y-1 list-none p-2">
                                {externalContext.map((item, index) => {
                                    return (
                                        <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                <span className="truncate font-medium text-sm" title={item.fileName}>{item.fileName}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Select value={item.type} onValueChange={(value: ExternalContextType) => updateExternalContextType(index, value)}>
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
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExternalContext(index)}><X className="h-4 w-4 text-destructive" /></Button>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </ScrollArea>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
