
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Card, CardContent } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { toast } from '@/hooks';
import { Loader2, UploadCloud } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadZoneProps {
    onFileAdded: (fileName: string, content: string) => void;
}

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

export const FileUploadZone = ({ onFileAdded }: FileUploadZoneProps) => {
    const { t } = useLocalization();
    const [isLoading, setIsLoading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsLoading(true);
        for (const file of acceptedFiles) {
            try {
                if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                    const dataUrl = await fileToDataUrl(file);
                    onFileAdded(file.name, dataUrl);
                } else {
                    const textContent = await file.text();
                    onFileAdded(file.name, textContent);
                }
                toast({ title: t('builder.academicSolver.toasts.fileAdded'), description: t('builder.academicSolver.toasts.fileAddedDesc').replace('{fileName}', file.name) });
            } catch (error: any) {
                toast({ title: t('builder.academicSolver.toasts.uploadFailed'), description: error.message, variant: "destructive" });
            }
        }
        setIsLoading(false);
    }, [onFileAdded, t]);

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

    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg text-center cursor-pointer backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200 ${
                    isDragActive
                        ? 'border-primary bg-gradient-to-r from-primary/10 to-blue-500/10'
                        : 'border-border bg-gradient-to-r from-background/50 to-primary/5'
                }`}
            >
                <CardContent className="p-6">
                    <input {...getInputProps()} />
                    {isLoading ? (
                        <AnimatedContainer animation="fade-in-up" delay={300}>
                            <div className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-600 mb-4 shadow-soft mx-auto w-fit">
                                <Loader2 className="h-8 w-8 text-white animate-spin" />
                            </div>
                        </AnimatedContainer>
                    ) : (
                        <AnimatedContainer animation="fade-in-up" delay={300}>
                            <div className="p-4 rounded-full bg-gradient-to-br from-muted to-muted-foreground mb-4 shadow-soft mx-auto w-fit">
                                <UploadCloud className="h-8 w-8 text-white" />
                            </div>
                        </AnimatedContainer>
                    )}
                    <AnimatedContainer animation="fade-in-up" delay={400}>
                        <p className="text-sm text-muted-foreground">
                            {isLoading ? t('builder.academicSolver.toasts.processingFile') : (isDragActive ? t('builder.academicSolver.toasts.dropHere') : t('builder.academicSolver.uploaders.dropzoneHint'))}
                        </p>
                    </AnimatedContainer>
                </CardContent>
            </Card>
        </AnimatedContainer>
    );
};
