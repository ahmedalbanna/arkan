
'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, FileText, X, ImageIcon } from 'lucide-react';
import { PasteTextUploader } from './PasteTextUploader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReportStore } from '@/hooks/useReportStore';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ContextFileType } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { toast, useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { processFileApi } from '@/services/document-processing-service';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { PdfPreview } from './PdfPreview';
import { useDropzone } from 'react-dropzone';

function ViewContextDialog({ item }: { item: { fileName: string, content: string, type: ContextFileType }}) {
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
    const { toast } = useToast();
    const { firebaseUser, refetchUser } = useAuth();
    const { addExternalContext } = useReportStore();
    const [isLoading, setIsLoading] = useState(false);

    const processAndAddFile = async (file: File) => {
        if (!firebaseUser) {
            toast({ title: "Authentication Error", description: "You must be logged in to upload files.", variant: "destructive" });
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            const content = reader.result as string;
            // The type is initially 'context' and can be changed by the user.
            addExternalContext(file.name, content, 'context');
            toast({ title: "File Added", description: `${file.name} has been added to context.` });
        };
        reader.onerror = () => {
            toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
        }
    };
    

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsLoading(true);
        for (const file of acceptedFiles) {
           await processAndAddFile(file);
        }
        setIsLoading(false);
    }, [firebaseUser, addExternalContext, toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        accept: {
            'application/pdf': ['.pdf'],
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
                        <p className="mt-2 text-sm text-muted-foreground">Adding files...</p>
                    </>
                ) : (
                    <>
                        <UploadCloud className="h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-sm font-semibold">
                            {isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to select'}
                        </p>
                        <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, MD, Images (Max 5MB)</p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export function UploadManager() {
    const { externalContext, removeExternalContext, updateExternalContextType } = useReportStore();
    const fileTypes: ContextFileType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];
    
    return (
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Context Files</CardTitle>
            <CardDescription>
              Upload and manage all contextual files for your project here. 
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload Files</TabsTrigger>
                    <TabsTrigger value="text">Paste Text</TabsTrigger>
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
                    <h3 className="text-sm font-medium text-muted-foreground">UPLOADED CONTEXT</h3>
                    <ScrollArea className="flex-grow border rounded-lg">
                        <ul className="space-y-1 list-none p-2">
                            {externalContext.map((item, index) => (
                                <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                    <div className="flex items-center gap-2 truncate ">
                                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="truncate font-medium text-sm" style={{ maxWidth: '200px' }}>{item.fileName}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Select value={item.type} onValueChange={(value: ContextFileType) => updateExternalContextType(index, value)}>
                                            <SelectTrigger className={cn("text-xs h-7 w-[110px]", {
                                                'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800': item.type === 'context',
                                                'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800': item.type === 'example',
                                                'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800': item.type === 'question',
                                                'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800': item.type === 'textbook',
                                                'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600': item.type === 'guidelines',
                                            })}>
                                                <SelectValue />
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
                            ))}
                        </ul>
                    </ScrollArea>
                </div>
            )}
        </CardContent>
    </Card>
    );
}
