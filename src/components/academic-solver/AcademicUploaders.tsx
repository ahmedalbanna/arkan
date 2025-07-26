
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useAcademicSolverStore } from '@/hooks/useAcademicSolverStore';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { PlusCircle, File, Eye, X, Loader2 } from 'lucide-react';

interface SingleUploaderProps {
    onContentAdded: (fileName: string, content: string) => void;
    onContentRemoved: (index: number) => void;
    isProcessing: boolean;
    isContext?: boolean;
    uploadedContent: { fileName: string, content: string }[];
}


const PDFUploader = ({ onContentAdded, isProcessing }: { onContentAdded: (fileName: string, content: string) => void, isProcessing: boolean }) => {
    const { toast } = useToast();
    const { firebaseUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast({ title: "Invalid File Type", description: "Only PDF files are supported.", variant: "destructive" });
            return;
        }

        if (!firebaseUser) {
            toast({ title: "Authentication Error", description: "You must be logged in to upload a file.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = await firebaseUser.getIdToken();
            const response = await fetch('/api/pdf-to-markdown', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to process file.');
            }
            
            const result = await response.json();
            onContentAdded(file.name, result.markdown);
            toast({ title: "File Processed", description: `${file.name} has been successfully processed.` });

        } catch (err: any) {
            toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [firebaseUser, toast, onContentAdded]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

    return (
        <Card {...getRootProps()} className={`border-2 border-dashed ${isDragActive ? 'border-primary bg-accent' : 'border-border'} hover:border-primary/80 transition-colors cursor-pointer text-center p-6`}>
            <input {...getInputProps()} disabled={isProcessing || isLoading} />
            {isLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /> : <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />}
            <p className="mt-2 text-sm font-semibold">{isDragActive ? 'Drop PDF here...' : 'Drag & drop PDF or click'}</p>
        </Card>
    );
};

const TextPaster = ({ onContentAdded, isProcessing }: { onContentAdded: (fileName: string, content: string) => void, isProcessing: boolean }) => {
    const [text, setText] = useState('');
    const [fileName, setFileName] = useState('Pasted Text');
    const { toast } = useToast();

    const handleAdd = () => {
        if (!text.trim()) {
            toast({ title: "No Content", description: "Please paste some text.", variant: "destructive" });
            return;
        }
        onContentAdded(`${fileName}.md`, text);
        setText('');
    };

    return (
        <div className="space-y-2">
            <Textarea placeholder="Paste content here..." value={text} onChange={(e) => setText(e.target.value)} rows={4} disabled={isProcessing} />
            <div className="flex justify-end">
                <Button onClick={handleAdd} disabled={isProcessing || !text.trim()}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Text
                </Button>
            </div>
        </div>
    );
};

const ImageTextExtractor = ({ onContentAdded, isProcessing }: { onContentAdded: (fileName: string, content: string) => void, isProcessing: boolean }) => {
    const { toast } = useToast();
    const { firebaseUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast({ title: "Invalid File Type", description: "Only JPG, PNG, and WebP images are supported.", variant: "destructive" });
            return;
        }

        if (!firebaseUser) {
            toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = await firebaseUser.getIdToken();
            const response = await fetch('/api/image-to-text', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to process image.');
            }
            
            const result = await response.json();
            onContentAdded(`Image: ${file.name}`, result.text);
            toast({ title: "Image Processed", description: `Text from ${file.name} has been added.` });

        } catch (err: any) {
            toast({ title: "Processing Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [firebaseUser, toast, onContentAdded]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] } });

     return (
        <Card {...getRootProps()} className={`border-2 border-dashed ${isDragActive ? 'border-primary bg-accent' : 'border-border'} hover:border-primary/80 transition-colors cursor-pointer text-center p-6`}>
            <input {...getInputProps()} disabled={isProcessing || isLoading} />
            {isLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /> : <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />}
            <p className="mt-2 text-sm font-semibold">{isDragActive ? 'Drop image here...' : 'Drag & drop image or click'}</p>
        </Card>
    );
};

export const AcademicUploaders = ({ title, onContentAdded, onContentRemoved, isProcessing, isContext = false }: { title: string, onContentAdded: (fileName: string, content: string) => void, onContentRemoved: (index: number) => void, isProcessing: boolean, isContext?: boolean }) => {
    const { questionContent, externalContext } = useAcademicSolverStore();
    const contentArray = isContext ? externalContext : (questionContent ? [{ fileName: 'Questions Document', content: questionContent }] : []);

    const handleSingleContentAdded = (fileName: string, content: string) => {
        // For non-context, this will replace the content.
        if (!isContext) {
            (onContentAdded as (fileName: string | null, content: string) => void)(null, content);
        } else {
            onContentAdded(fileName, content);
        }
    }

    return (
        <Card>
            <CardContent className="p-4 space-y-2">
                 <Label className="font-semibold">{title}</Label>
                 {contentArray.length > 0 ? (
                      <div className="space-y-2">
                        {contentArray.map((item, index) => (
                            <li key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/50 text-sm list-none">
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
                 ) : (
                    <Tabs defaultValue="pdf" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="pdf"><UploadCloud className="mr-2 h-4 w-4" /> PDF</TabsTrigger>
                            <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" /> Text</TabsTrigger>
                            <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4" /> Image</TabsTrigger>
                        </TabsList>
                        <TabsContent value="pdf" className="mt-2"><PDFUploader onContentAdded={handleSingleContentAdded} isProcessing={isProcessing} /></TabsContent>
                        <TabsContent value="text" className="mt-2"><TextPaster onContentAdded={handleSingleContentAdded} isProcessing={isProcessing} /></TabsContent>
                        <TabsContent value="image" className="mt-2"><ImageTextExtractor onContentAdded={handleSingleContentAdded} isProcessing={isProcessing} /></TabsContent>
                    </Tabs>
                 )}
            </CardContent>
        </Card>
    )
}
