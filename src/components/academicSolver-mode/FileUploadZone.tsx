
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, Loader2 } from 'lucide-react';
import { toast } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';

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
    }, [onFileAdded, toast, t]);

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
        <Card
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-primary' : 'border-border'}`}
        >
            <CardContent className="p-6">
                <input {...getInputProps()} />
                {isLoading ? (
                     <Loader2 className="mx-auto h-8 w-8 text-muted-foreground animate-spin" />
                ) : (
                    <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                    {isLoading ? t('builder.academicSolver.toasts.processingFile') : (isDragActive ? t('builder.academicSolver.toasts.dropHere') : t('builder.academicSolver.uploaders.dropzoneHint'))}
                </p>
            </CardContent>
        </Card>
    );
};
