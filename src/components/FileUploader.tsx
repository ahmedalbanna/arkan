
'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, File, Loader2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useReportStore } from '@/hooks/useReportStore';

export function FileUploader() {
    const { toast } = useToast();
    const { firebaseUser } = useAuth();
    const { addExternalContext, externalContext, removeExternalContext } = useReportStore();
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
            addExternalContext(file.name, result.markdown);

            toast({ title: "File Processed", description: `${file.name} has been successfully added as context.` });

        } catch (err: any) {
            toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }

    }, [firebaseUser, toast, addExternalContext]);

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
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <input {...getInputProps()} />
                    {isLoading ? (
                        <>
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="mt-4 text-muted-foreground">Processing file...</p>
                        </>
                    ) : (
                        <>
                            <UploadCloud className="h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 font-semibold">
                                {isDragActive ? 'Drop the file here...' : 'Drag & drop a file here, or click to select'}
                            </p>
                            <p className="text-xs text-muted-foreground">PDF only (Max 5MB)</p>
                        </>
                    )}
                </CardContent>
            </Card>

            {externalContext && externalContext.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Uploaded Context Files:</h3>
                    <ul className="space-y-2">
                        {externalContext.map((item, index) => (
                            <li key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/50 text-sm">
                                <div className="flex items-center gap-2 truncate">
                                    <File className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{item.fileName}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExternalContext(index)}>
                                    <X className="h-4 w-4 text-destructive" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

