
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import type { AcademicContextFile } from '@/lib/types';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { PlusCircle, File, Eye, X, Loader2 } from 'lucide-react';
import { FileUploader } from '../FileUploader';
import { PasteTextUploader } from '../PasteTextUploader';
import { ImageUploader } from '../ImageUploader';
import { Badge } from '../ui/badge';
import { useReportStore } from '@/hooks/useReportStore';

interface AcademicUploadersProps {
    title: string;
    onContentAdded: (fileName: string, content: string, type?: 'context' | 'example') => void;
    onContentRemoved: (index: number) => void;
    isProcessing: boolean;
    isContext?: boolean;
    uploadedContent: { fileName: string; content: string; type?: 'context' | 'example' }[];
}


export const AcademicUploaders = ({ title, onContentAdded, onContentRemoved, isProcessing, isContext = false, uploadedContent }: AcademicUploadersProps) => {
    
    return (
        <Card>
            <CardContent className="p-4 space-y-2">
                 <h3 className="font-semibold text-sm">{title}</h3>
                 {uploadedContent.length > 0 && (
                      <ul className="space-y-2 list-none p-0">
                        {uploadedContent.map((item, index) => (
                            <li key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/50 text-sm">
                                <div className="flex items-center gap-2 truncate">
                                    <File className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{item.fileName}</span>
                                </div>
                                <div className="flex items-center">
                                    <Dialog>
                                        <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" title="View Content"><Eye className="h-4 w-4" /></Button></DialogTrigger>
                                        <DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>{item.fileName}</DialogTitle></DialogHeader><ScrollArea className="h-[60vh] rounded-md border p-4"><ReactMarkdown components={markdownComponents}>{item.content}</ReactMarkdown></ScrollArea></DialogContent>
                                    </Dialog>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onContentRemoved(index)}><X className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                 )}
                 <p className="text-xs text-muted-foreground mb-2">Provide documents for factual context. The AI will use this information to answer questions or ground its writing.</p>
                <Tabs defaultValue="pdf" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pdf"><UploadCloud className="mr-2 h-4 w-4"/>PDF</TabsTrigger>
                        <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4"/>Text</TabsTrigger>
                        <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4"/>Image</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pdf" className="mt-2"><FileUploader type={isContext ? 'context' : 'example'} /></TabsContent>
                    <TabsContent value="text" className="mt-2"><PasteTextUploader /></TabsContent>
                    <TabsContent value="image" className="mt-2"><ImageUploader type={isContext ? 'context' : 'example'} /></TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
