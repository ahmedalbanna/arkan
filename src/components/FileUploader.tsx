
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

export function FileUploader({ type }: FileUploaderProps) {
    const { toast } = useToast();
    const { firebaseUser } = useAuth();
    const { addExternalContext } = useReportStore();
    const [isLoading, setIsLoading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast({ title: "Invalid File Type", description: "Only PDF files are supported at this time.", variant: "destructive" });
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
            addExternalContext(file.name, result.markdown, type);

            toast({ title: "File Processed", description: `${file.name} has been successfully added as ${type}.` });

        } catch (err: any) {
            toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }

    }, [firebaseUser, toast, addExternalContext, type]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] }
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
                            <p className="mt-2 text-sm text-muted-foreground">Processing file...</p>
                        </>
                    ) : (
                        <>
                            <UploadCloud className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 text-sm font-semibold">
                                {isDragActive ? 'Drop the file here...' : 'Drag & drop a PDF here, or click to select'}
                            </p>
                            <p className="text-xs text-muted-foreground">PDF only (Max 5MB)</p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
