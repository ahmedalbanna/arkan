
'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, File, Loader2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useReportStore } from '@/hooks/useReportStore';

interface FileUploaderProps {
    type: 'context' | 'example';
}

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export function ImageUploader({ type }: FileUploaderProps) {
    const { toast } = useToast();
    const { firebaseUser } = useAuth();
    const { addExternalContext } = useReportStore();
    const [isLoading, setIsLoading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast({ title: "Invalid File Type", description: "Only JPG, PNG, and WebP images are supported.", variant: "destructive" });
            return;
        }

        if (!firebaseUser) {
            toast({ title: "Authentication Error", description: "You must be logged in to upload an image.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        
        try {
            const dataUri = await fileToDataUri(file);
            addExternalContext(file.name, dataUri, type);
            toast({ title: "Image Added", description: `Image ${file.name} has been successfully added as context.` });
        } catch (err: any) {
            toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }

    }, [firebaseUser, toast, addExternalContext, type]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] }
    });

    return (
        <div>
            <Card
                {...getRootProps()}
                className={`border-2 border-dashed ${isDragActive ? 'border-primary bg-accent' : 'border-border'
                    } hover:border-primary/80 transition-colors cursor-pointer`}
            >
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <input {...getInputProps()} />
                    {isLoading ? (
                        <>
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="mt-4 text-muted-foreground">Adding image...</p>
                        </>
                    ) : (
                        <>
                            <UploadCloud className="h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 font-semibold">
                                {isDragActive ? 'Drop the image here...' : 'Drag & drop an image here, or click to select'}
                            </p>
                            <p className="text-xs text-muted-foreground">JPG, PNG, WebP (Max 5MB)</p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
