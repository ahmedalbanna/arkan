
'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, FileText, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { processFileApi } from '@/services/document-processing-service';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ExternalContext } from '@/hooks/useReportStore';
import { useLocalization } from '@/context/LocalizationContext';

interface AcademicUploadersProps {
    title: string;
    onContentAdded: (fileName: string, content: string) => void;
    onContentRemoved: (index: number) => void;
    isProcessing: boolean;
    uploadedContent: ExternalContext[];
    isContext?: boolean; // Flag to differentiate between question and context documents
}

export const AcademicUploaders = ({ title, onContentAdded, onContentRemoved, isProcessing, uploadedContent, isContext = false }: AcademicUploadersProps) => {
    const { toast } = useToast();
    const { firebaseUser, refetchUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLocalization();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsLoading(true);
        for (const file of acceptedFiles) {
            if (!firebaseUser) {
                toast({ title: t('builder.academicSolver.toasts.authError'), variant: "destructive" });
                continue;
            }
            try {
                const token = await firebaseUser.getIdToken();
                const formData = new FormData();
                formData.append('file', file);
                const result = await processFileApi(formData, token);
                onContentAdded(file.name, result.markdown);
                toast({ title: t('builder.academicSolver.toasts.fileProcessed'), description: t('builder.academicSolver.toasts.fileAddedDesc').replace('{fileName}', file.name) });
                refetchUser();
            } catch (error: any) {
                toast({ title: t('builder.academicSolver.toasts.uploadFailed'), description: error.message, variant: "destructive" });
            }
        }
        setIsLoading(false);
    }, [firebaseUser, onContentAdded, refetchUser, toast, t]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
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
