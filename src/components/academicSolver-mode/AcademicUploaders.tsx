
'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, FileText, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ExternalContext } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { processFileApi } from '@/services'; // Still needed for text files if we want that flow, but we will bypass for now.

interface AcademicUploadersProps {
    title: string;
    onContentAdded: (fileName: string, content: string) => void;
    onContentRemoved: (index: number) => void;
    isProcessing: boolean;
    uploadedContent: ExternalContext[];
    isContext?: boolean; // Flag to differentiate between question and context documents
}

/**
 * Converts a File object to a data URI string.
 * @param file The file to convert.
 * @returns A promise that resolves with the data URI.
 */
function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}


export const AcademicUploaders = ({ title, onContentAdded, onContentRemoved, isProcessing, uploadedContent, isContext = false }: AcademicUploadersProps) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLocalization();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsLoading(true);
        for (const file of acceptedFiles) {
             try {
                // For PDF and images, we just need the data URI. For text, we read it.
                if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                    const dataUrl = await fileToDataUrl(file);
                    onContentAdded(file.name, dataUrl);
                } else {
                    const textContent = await file.text();
                    onContentAdded(file.name, textContent);
                }
                toast({ title: t('builder.academicSolver.toasts.fileAdded'), description: t('builder.academicSolver.toasts.fileAddedDesc').replace('{fileName}', file.name) });

            } catch (error: any) {
                toast({ title: t('builder.academicSolver.toasts.uploadFailed'), description: error.message, variant: "destructive" });
            }
        }
        setIsLoading(false);
    }, [onContentAdded, toast, t]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
        }
    });

    const [pastedText, setPastedText] = useState('');
    const [pastedTitle, setPastedTitle] = useState('');

    const handleAddPastedText = () => {
        if (!pastedTitle.trim() || !pastedText.trim()) {
            toast({ title: t('builder.academicSolver.toasts.missingInfoToastTitle'), description: t('builder.academicSolver.toasts.missingInfoToastDesc'), variant: 'destructive' });
            return;
        }
        onContentAdded(`${pastedTitle}.md`, pastedText);
        setPastedText('');
        setPastedTitle('');
    };

    return (
        <Card className="bg-muted/50">
            <CardHeader className="p-4">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Tabs defaultValue="upload">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">{t('builder.academicSolver.uploaders.uploadFile')}</TabsTrigger>
                        <TabsTrigger value="paste">{t('builder.academicSolver.uploaders.pasteText')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="mt-4">
                        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragActive ? 'border-primary' : ''}`}>
                            <input {...getInputProps()} />
                            <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">{isDragActive ? t('builder.academicSolver.toasts.dropHere') : t('builder.academicSolver.uploaders.dropzoneHint')}</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="paste" className="mt-4 space-y-2">
                        <Label htmlFor="paste-title">{t('builder.academicSolver.uploaders.pasteTitle')}</Label>
                        <Input id="paste-title" placeholder={t('builder.academicSolver.uploaders.titlePlaceholder')} value={pastedTitle} onChange={e => setPastedTitle(e.target.value)} />
                        <Label htmlFor="paste-content">{t('builder.academicSolver.uploaders.pasteContent')}</Label>
                        <Textarea id="paste-content" placeholder={t('builder.academicSolver.uploaders.contentPlaceholder')} value={pastedText} onChange={e => setPastedText(e.target.value)} rows={5} />
                        <Button onClick={handleAddPastedText} size="sm">{t('builder.academicSolver.uploaders.addButton')}</Button>
                    </TabsContent>
                </Tabs>

                {(isLoading || isProcessing) && <div className="flex justify-center mt-2"><Loader2 className="h-5 w-5 animate-spin" /></div>}

                {uploadedContent.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-semibold">{t('builder.academicSolver.toasts.uploadedContext')}</h4>
                        <ScrollArea className="h-24 w-full rounded-md border p-2">
                            <div className="space-y-1">
                                {uploadedContent.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm p-1 rounded-md bg-background">
                                        <span className="truncate">{item.fileName}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onContentRemoved(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
