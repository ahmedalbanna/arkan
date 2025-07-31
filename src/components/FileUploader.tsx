
'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, File, Loader2, X, AlertCircle, Eye } from 'lucide-react';
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

const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

export function FileUploader({ type }: FileUploaderProps) {
    const { toast } = useToast();
    const { firebaseUser } = useAuth();
    const { addExternalContext } = useReportStore();
    const [isLoading, setIsLoading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (!firebaseUser) {
            toast({ title: "Authentication Error", description: "You must be logged in to upload a file.", variant: "destructive" });
            return;
        }

        setIsLoading(true);

        try {
            let content: string;
            // For non-PDF text files, read them as plain text. For PDFs (and others), use data URI for later processing.
            if (file.type === 'text/plain' || file.type === 'text/markdown' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                content = await fileToText(file);
            } else {
                content = await fileToDataUri(file);
            }
            
            addExternalContext(file.name, content, type);
            toast({ title: "File Added", description: `${file.name} has been successfully added as ${type}.` });
        } catch (err: any) {
            toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }

    }, [firebaseUser, toast, addExternalContext, type]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
        }
    });

    return (
        <div>
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
                            <p className="mt-2 text-sm text-muted-foreground">Adding file...</p>
                        </>
                    ) : (
                        <>
                            <UploadCloud className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 text-sm font-semibold">
                                {isDragActive ? 'Drop the file here...' : 'Drag & drop a file here, or click to select'}
                            </p>
                            <p className="text-xs text-muted-foreground">.pdf, .docx, .txt, .md (Max 5MB)</p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
